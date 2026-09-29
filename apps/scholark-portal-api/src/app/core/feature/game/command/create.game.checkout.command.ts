import { randomUUID } from 'node:crypto';

import {
	HttpException,
	HttpStatus,
	Inject,
	Injectable
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { RedisClientType } from '@redis/client';
import { IsUUID } from 'class-validator';
import type Stripe from 'stripe';

import stripeConfig from '../../../../../config/stripe';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { RedisClient } from '../../../infrastructure/redis/redis.module';
import { StripeClient } from '../../../infrastructure/stripe/stripe.module';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import { InstitutionGameOfferRepository } from '../../education/repository/institution.game.offer.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { GamePaymentAttemptRepository } from '../repository/game.payment.attempt.repository';
import { PublicGameOfferRepository } from '../repository/public.game.offer.repository';
import { FulfillGamePaymentCommand } from './fulfill.game.payment.command';

export class CreateGameCheckoutCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	publicOfferId!: string;

}

export class CreateClassroomGameCheckoutCommandData extends StaticFactory {

	@IsUUID()
	userId!: string;

	@IsUUID()
	classroomGameId!: string;

}

export class CreateGameCheckoutCommandResult extends CommandResult {

	checkoutUrl?: string;
	checkoutSessionId?: string;

	static unavailableFail() {
		return this.fail({ validationResult: ValidationResult.createFromErrorMessage('Game is not available for acquisition') });
	}

	static alreadyAcquiredFail() {
		return this.fail({ validationResult: ValidationResult.createFromErrorMessage('Game is already acquired') });
	}

	static userNotFoundFail() {
		return this.fail({ validationResult: ValidationResult.createFromErrorMessage('User not found') });
	}

}

@Injectable()
export class CreateGameCheckoutCommand {

	constructor(
		private readonly validator: Validator,
		private readonly publicOfferRepository: PublicGameOfferRepository,
		private readonly gameLicenseRepository: GameLicenseRepository,
		private readonly userRepository: UserEntityRepository,
		private readonly paymentAttemptRepository: GamePaymentAttemptRepository,
		private readonly classroomGameRepository: ClassroomGameRepository,
		private readonly institutionGameOfferRepository: InstitutionGameOfferRepository,
		@Inject(StripeClient()) private readonly stripe: Stripe,
		@Inject(RedisClient()) private readonly redisClient: RedisClientType,
		@Inject(stripeConfig.KEY) private readonly config: ConfigType<typeof stripeConfig>,
		private readonly fulfillGamePaymentCommand: FulfillGamePaymentCommand,
	) {}

	async createGameCheckout(data: CreateGameCheckoutCommandData): Promise<CreateGameCheckoutCommandResult> {
		const validationResult = await this.validator.validate(data);
		if (validationResult) {
			return CreateGameCheckoutCommandResult.fail({ validationResult });
		}

		const [publicOffer, user] = await Promise.all([
			this.publicOfferRepository.findForAcquisition(data.publicOfferId),
			this.userRepository.findOneBy({ id: data.userId }),
		]);

		if (!publicOffer || !publicOffer.publishedAt || publicOffer.publishedAt > new Date()
			|| !publicOffer.gameVariant.gameVersion.isPublished()
			|| !publicOffer.gameVariant.gameVersion.game.isPublished()) {
			return CreateGameCheckoutCommandResult.unavailableFail();
		}

		if (!user) {
			return CreateGameCheckoutCommandResult.userNotFoundFail();
		}

		const activeLicense = await this.gameLicenseRepository.findActiveByUserAndGameVariant(
			data.userId,
			publicOffer.gameVariant,
		);

		if (activeLicense) {
			return CreateGameCheckoutCommandResult.alreadyAcquiredFail();
		}

		const game = publicOffer.gameVariant.gameVersion.game;
		return this.withCheckoutCreationLock(`scholark:checkout:${user.id}:public:${publicOffer.id}`, async () => {
			const sessionData = {
				attemptType: 'public' as const,
				cancelUrl: `${this.config.portalUrl}/game/${game.slug}/acquire?offer=${publicOffer.id}`,
				publicOffer,
				successUrl: `${this.config.portalUrl}/game/${game.slug}/acquire/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
				userId: user.id!,
			};
			const pendingAttempt = await this.paymentAttemptRepository.findPendingByUserAndPublicOffer(user.id!, publicOffer.id!);

			if (pendingAttempt) {
				const resumed = await this.resumePendingAttempt(pendingAttempt, sessionData);
				if (resumed) {
					return resumed;
				}
			}

			const attempt = GamePaymentAttempt.create({
				licenseDurationDays: 6 * 30,
				price: publicOffer.price,
				publicOffer,
				status: GamePaymentAttemptStatus.PENDING,
				user,
			});
			await this.paymentAttemptRepository.save(attempt);

			return this.createSessionForAttempt(attempt, sessionData);
		});
	}

	async createClassroomGameCheckout(data: CreateClassroomGameCheckoutCommandData): Promise<CreateGameCheckoutCommandResult> {
		const validationResult = await this.validator.validate(data);
		if (validationResult) {
			return CreateGameCheckoutCommandResult.fail({ validationResult });
		}

		const [classroomGame, user] = await Promise.all([
			this.classroomGameRepository.findForAcquisition(data.classroomGameId),
			this.userRepository.findOneBy({ id: data.userId }),
		]);

		if (!classroomGame || !classroomGame.isAvailable()) {
			return CreateGameCheckoutCommandResult.unavailableFail();
		}

		if (!user) {
			return CreateGameCheckoutCommandResult.userNotFoundFail();
		}

		const studentPayorOffer = await this.institutionGameOfferRepository.findStudentPayorOffer(classroomGame.institutionGameOffer);

		if (!studentPayorOffer || (classroomGame.customization
			&& classroomGame.customization.gameVersion !== classroomGame.institutionGameOffer.gameVariant.gameVersion)) {
			return CreateGameCheckoutCommandResult.unavailableFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGame(
			user.id!,
			classroomGame.id!,
		);

		if (existingLicense) {
			return CreateGameCheckoutCommandResult.alreadyAcquiredFail();
		}

		const institutionGameOffer = classroomGame.institutionGameOffer;
		return this.withCheckoutCreationLock(`scholark:checkout:${user.id}:classroom:${classroomGame.id}`, async () => {
			const sessionData = {
				attemptType: 'classroom' as const,
				cancelUrl: `${this.config.portalUrl}/classroom-game/${classroomGame.id}/acquire`,
				publicOffer: institutionGameOffer,
				classroomGameId: classroomGame.id!,
				successUrl: `${this.config.portalUrl}/classroom-game/${classroomGame.id}/acquire/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
				userId: user.id!,
			};
			const pendingAttempt = await this.paymentAttemptRepository.findPendingByUserAndClassroomGame(user.id!, classroomGame.id!);

			if (pendingAttempt) {
				const resumed = await this.resumePendingAttempt(pendingAttempt, sessionData);
				if (resumed) {
					return resumed;
				}
			}

			const attempt = GamePaymentAttempt.create({
				classroomGame,
				licenseDurationDays: classroomGame.institutionGameOffer.licenseDurationDays,
				price: institutionGameOffer.price,
				institutionGameOffer,
				status: GamePaymentAttemptStatus.PENDING,
				user,
				customization: classroomGame.customization,
			});
			await this.paymentAttemptRepository.save(attempt);

			return this.createSessionForAttempt(attempt, sessionData);
		});
	}

	private async withCheckoutCreationLock(
		key: string,
		createOrResume: () => Promise<CreateGameCheckoutCommandResult>,
	): Promise<CreateGameCheckoutCommandResult> {
		const lockToken = randomUUID();
		const lock = await this.redisClient.set(key, lockToken, {
			condition: 'NX',
			expiration: { type: 'EX', value: 120 },
		});
		if (lock !== 'OK') {
			throw new HttpException('Checkout is already starting. Please try again shortly.', HttpStatus.TOO_MANY_REQUESTS);
		}

		try {
			return await createOrResume();
		} finally {
			await this.redisClient.eval(
				"if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
				{ arguments: [lockToken], keys: [key] },
			);
		}
	}

	private async resumePendingAttempt(
		attempt: GamePaymentAttempt,
		sessionData: Omit<CheckoutSessionData, 'attemptId'>,
	): Promise<CreateGameCheckoutCommandResult | undefined> {
		if (!attempt.stripeCheckoutSessionId) {
			return this.createSessionForAttempt(attempt, sessionData);
		}

		const sessionId = attempt.stripeCheckoutSessionId;
		const session = await this.stripe.checkout.sessions.retrieve(sessionId);
		if (session.id !== sessionId) {
			throw new Error('Stripe Checkout session does not match the payment attempt');
		}
		this.assertSessionMatchesAttempt(session, attempt);

		if (session.payment_status === 'paid') {
			await this.fulfillGamePaymentCommand.execute(session, `checkout-retry:${attempt.id}`, 'revalidation');
			return CreateGameCheckoutCommandResult.success({
				checkoutSessionId: session.id,
				checkoutUrl: `${this.config.portalUrl}/library`,
			});
		}

		if (session.status === 'open' && session.url) {
			return CreateGameCheckoutCommandResult.success({ checkoutSessionId: session.id, checkoutUrl: session.url });
		}

		if (await this.isTerminalFailure(session)) {
			const markedFailed = await this.paymentAttemptRepository.markPendingAsFailed(attempt.id!, session.id);
			if (!markedFailed) {
				const latestAttempt = await this.paymentAttemptRepository.findById(attempt.id!);
				if (latestAttempt?.status === GamePaymentAttemptStatus.FULFILLED) {
					return CreateGameCheckoutCommandResult.success({
						checkoutSessionId: session.id,
						checkoutUrl: `${this.config.portalUrl}/library`,
					});
				}
				return CreateGameCheckoutCommandResult.fail({
					validationResult: ValidationResult.createFromErrorMessage('Checkout status changed. Check Billing before starting another checkout.'),
				});
			}
			return undefined;
		}

		return CreateGameCheckoutCommandResult.fail({
			validationResult: ValidationResult.createFromErrorMessage('Payment is still processing. Check Billing before starting another checkout.'),
		});
	}

	private async createSessionForAttempt(
		attempt: GamePaymentAttempt,
		sessionData: Omit<CheckoutSessionData, 'attemptId'>,
	): Promise<CreateGameCheckoutCommandResult> {
		let session: Stripe.Checkout.Session;
		try {
			session = await this.createSession({ ...sessionData, attemptId: attempt.id! });
		} catch (error) {
			const statusCode = (error as { statusCode?: unknown }).statusCode;
			if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
				await this.paymentAttemptRepository.markPendingAsFailed(attempt.id!);
			}
			throw error;
		}

		if (!session.url) {
			await this.paymentAttemptRepository.markPendingAsFailed(attempt.id!);
			return CreateGameCheckoutCommandResult.fail({
				validationResult: ValidationResult.createFromErrorMessage('Stripe did not return a Checkout URL'),
			});
		}

		attempt.stripeCheckoutSessionId = session.id;
		await this.paymentAttemptRepository.save(attempt);
		return CreateGameCheckoutCommandResult.success({ checkoutSessionId: session.id, checkoutUrl: session.url });
	}

	private assertSessionMatchesAttempt(session: Stripe.Checkout.Session, attempt: GamePaymentAttempt): void {
		const purchaseType = attempt.classroomGame ? 'classroom' : 'public';
		const metadata = session.metadata ?? {};
		const metadataMatchesAttempt =
			metadata.attemptId === attempt.id
			&& metadata.userId === attempt.user.id
			&& metadata.purchaseType === purchaseType
			&& metadata.offerId === (attempt.publicOffer?.id ?? attempt.institutionGameOffer?.id)
			&& metadata.classroomGameId === (attempt.classroomGame?.id ?? '')
			&& session.client_reference_id === attempt.user.id;
		if (!metadataMatchesAttempt) {
			throw new Error('Stripe Checkout metadata does not match the payment attempt');
		}
		if (session.amount_total !== attempt.price.minorUnitAmount
			|| session.currency !== attempt.price.currency.toLowerCase()) {
			throw new Error('Stripe Checkout amount does not match the payment attempt');
		}
	}

	private async isTerminalFailure(session: Stripe.Checkout.Session): Promise<boolean> {
		if (session.status === 'expired') {
			return true;
		}
		if (session.status !== 'complete') {
			return false;
		}
		const paymentIntentId = typeof session.payment_intent === 'string'
			? session.payment_intent
			: session.payment_intent?.id;
		if (!paymentIntentId) {
			return false;
		}
		const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
		return paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method';
	}

	private createSession(data: {
		attemptType: 'public' | 'classroom';
		attemptId: string;
		cancelUrl: string;
		classroomGameId?: string;
		publicOffer: Pick<NonNullable<Awaited<ReturnType<PublicGameOfferRepository['findForAcquisition']>>>, 'id' | 'price' | 'gameVariant'>;
		successUrl: string;
		userId: string;
	}): Promise<Stripe.Checkout.Session> {
		return this.stripe.checkout.sessions.create({
			cancel_url: data.cancelUrl,
			client_reference_id: data.userId,
			line_items: [{
				price_data: {
					currency: data.publicOffer.price.currency.toLowerCase(),
					product_data: { name: data.publicOffer.gameVariant.gameVersion.game.title },
					unit_amount: data.publicOffer.price.minorUnitAmount,
				},
				quantity: 1,
			}],
			metadata: {
				attemptId: data.attemptId,
				classroomGameId: data.classroomGameId ?? '',
				offerId: data.publicOffer.id!,
				purchaseType: data.attemptType,
				userId: data.userId,
			},
			mode: 'payment',
			success_url: data.successUrl,
		}, { idempotencyKey: `scholark-checkout:${data.attemptId}` });
	}

}

type CheckoutSessionData = {
	attemptType: 'public' | 'classroom';
	attemptId: string;
	cancelUrl: string;
	classroomGameId?: string;
	publicOffer: Pick<NonNullable<Awaited<ReturnType<PublicGameOfferRepository['findForAcquisition']>>>, 'id' | 'price' | 'gameVariant'>;
	successUrl: string;
	userId: string;
};