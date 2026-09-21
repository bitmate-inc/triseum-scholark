import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { IsUUID } from 'class-validator';
import type Stripe from 'stripe';

import stripeConfig from '../../../../../config/stripe';
import { CommandResult } from '../../../../../lib/entity/command/command.result';
import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';
import { StripeClient } from '../../../infrastructure/stripe/stripe.module';
import { Validator } from '../../../infrastructure/validation/validator/validator';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import { InstitutionContractGameOfferRepository } from '../../education/repository/institution.contract.game.offer.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';
import { GamePaymentAttempt, GamePaymentAttemptStatus } from '../model/game.payment.attempt.entity';
import { GameLicenseRepository } from '../repository/game.license.repository';
import { GamePaymentAttemptRepository } from '../repository/game.payment.attempt.repository';
import { PublicGameOfferRepository } from '../repository/public.game.offer.repository';

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
		private readonly contractGameRepository: InstitutionContractGameOfferRepository,
		@Inject(StripeClient()) private readonly stripe: Stripe,
		@Inject(stripeConfig.KEY) private readonly config: ConfigType<typeof stripeConfig>,
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

		const attempt = GamePaymentAttempt.create({
			licenseDurationDays: 6 * 30,
			price: publicOffer.price,
			publicOffer,
			status: GamePaymentAttemptStatus.PENDING,
			user,
		});

		await this.paymentAttemptRepository.save(attempt);

		let session: Stripe.Checkout.Session;

		try {
			session = await this.createSession({
				attemptType: 'public',
				cancelUrl: `${this.config.portalUrl}/game/${game.slug}/acquire?offer=${publicOffer.id}`,
				attemptId: attempt.id!,
				publicOffer,
				successUrl: `${this.config.portalUrl}/game/${game.slug}/acquire/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
				userId: user.id!,
			});
		} catch (error) {
			attempt.status = GamePaymentAttemptStatus.FAILED;

			await this.paymentAttemptRepository.save(attempt);

			throw error;
		}

		if (!session.url) {
			attempt.status = GamePaymentAttemptStatus.FAILED;

			await this.paymentAttemptRepository.save(attempt);

			return CreateGameCheckoutCommandResult.fail({
				validationResult: ValidationResult.createFromErrorMessage('Stripe did not return a Checkout URL'),
			});
		}

		attempt.stripeCheckoutSessionId = session.id;

		await this.paymentAttemptRepository.save(attempt);

		return CreateGameCheckoutCommandResult.success({ checkoutSessionId: session.id, checkoutUrl: session.url });
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

		const activeContractGame = await this.contractGameRepository.findActiveStudentPayorByInstitutionAndGameOffer(
			classroomGame.classroom.institution,
			classroomGame.contractGameOffer,
		);

		if (!activeContractGame || (classroomGame.customization
			&& classroomGame.customization.gameVersion !== classroomGame.contractGameOffer.gameVariant.gameVersion)) {
			return CreateGameCheckoutCommandResult.unavailableFail();
		}

		const existingLicense = await this.gameLicenseRepository.findByUserAndClassroomGame(
			user.id!,
			classroomGame.id!,
		);

		if (existingLicense) {
			return CreateGameCheckoutCommandResult.alreadyAcquiredFail();
		}

		const institutionContractGameOffer = classroomGame.contractGameOffer;
		const attempt = GamePaymentAttempt.create({
			classroomGame,
			licenseDurationDays: classroomGame.contractGameOffer.licenseDurationDays,
			price: institutionContractGameOffer.price,
			institutionContractGameOffer,
			status: GamePaymentAttemptStatus.PENDING,
			user,
			customization: classroomGame.customization,
		});

		await this.paymentAttemptRepository.save(attempt);

		let session: Stripe.Checkout.Session;

		try {
			session = await this.createSession({
				attemptType: 'classroom',
				cancelUrl: `${this.config.portalUrl}/classroom-game/${classroomGame.id}/acquire`,
				attemptId: attempt.id!,
				publicOffer: institutionContractGameOffer,
				classroomGameId: classroomGame.id!,
				successUrl: `${this.config.portalUrl}/classroom-game/${classroomGame.id}/acquire/success?checkout_session_id={CHECKOUT_SESSION_ID}`,
				userId: user.id!,
			});
		} catch (error) {
			attempt.status = GamePaymentAttemptStatus.FAILED;

			await this.paymentAttemptRepository.save(attempt);
			
			throw error;
		}

		if (!session.url) {
			attempt.status = GamePaymentAttemptStatus.FAILED;

			await this.paymentAttemptRepository.save(attempt);

			return CreateGameCheckoutCommandResult.fail({
				validationResult: ValidationResult.createFromErrorMessage('Stripe did not return a Checkout URL'),
			});
		}

		attempt.stripeCheckoutSessionId = session.id;

		await this.paymentAttemptRepository.save(attempt);

		return CreateGameCheckoutCommandResult.success({ checkoutSessionId: session.id, checkoutUrl: session.url });
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
		});
	}

}