import { LockMode } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Transporter } from 'nodemailer';

import accountConfig from '../../../../../config/account';
import authConfig from '../../../../../config/auth';
import nodemailerConfig from '../../../../../config/nodemailer';
import { MailerClient } from '../../../infrastructure/nodemailer/nodemailer.module';
import { User } from '../../user/model/user.entity';
import { Instructor } from '../model/instructor.entity';
import { InstructorInvitation } from '../model/instructor.invitation.entity';
import { InstructorUser } from '../model/instructor.user.entity';

export interface CreateInstructorInvitationResult {
	email: string;
	expiresAt: Date;
	invitationUrl?: string;
	instructorName: string;
}

@Injectable()
export class CreateInstructorInvitationCommand {

	constructor(
		private readonly entityManager: EntityManager,
		@Inject(authConfig.KEY) private readonly authConfiguration: ConfigType<typeof authConfig>,
		@Inject(accountConfig.KEY) private readonly accountConfiguration: ConfigType<typeof accountConfig>,
		@Inject(nodemailerConfig.KEY) private readonly mailerConfiguration: ConfigType<typeof nodemailerConfig>,
		@Inject(MailerClient()) private readonly mailer: Transporter,
	) {}

	async execute(data: {
		email: string;
		instructorId: string;
		invitedByUserId: string;
	}): Promise<CreateInstructorInvitationResult> {
		const email = data.email.trim().toLowerCase();
		const now = new Date();
		const tokenValue = InstructorInvitation.createTokenValue();
		const invitationUrl = this.getInvitationUrl(tokenValue);
		const expiresAt = new Date(now.getTime() + this.authConfiguration.tokenTtlSeconds * 1000);

		const result = await this.entityManager.transactional(async (transactionalEntityManager) => {
			const instructor = await transactionalEntityManager.findOne(
				Instructor,
				{ id: data.instructorId },
				{ lockMode: LockMode.PESSIMISTIC_WRITE },
			);
			if (!instructor) {
				throw new NotFoundException('Instructor not found.');
			}

			const instructorLink = await transactionalEntityManager.findOne(
				InstructorUser,
				{ instructor: instructor.id! },
			);
			if (instructorLink) {
				throw new ConflictException('This instructor is already linked to an account.');
			}

			const invitedBy = await transactionalEntityManager.findOne(User, { id: data.invitedByUserId });
			if (!invitedBy) {
				throw new NotFoundException('Inviting user not found.');
			}

			const existingUser = await transactionalEntityManager.findOne(User, { email });
			if (existingUser) {
				const existingUserLink = await transactionalEntityManager.findOne(
					InstructorUser,
					{ user: existingUser.id! },
				);
				if (existingUserLink) {
					throw new ConflictException('This account is already linked to an instructor.');
				}
			}

			const existingInvitationList = await transactionalEntityManager.find(
				InstructorInvitation,
				{
					acceptedAt: null,
					expiresAt: { $gt: now },
					instructor: instructor.id!,
					revokedAt: null,
				},
			);
			for (const existingInvitation of existingInvitationList) {
				existingInvitation.revoke(now);
				transactionalEntityManager.persist(existingInvitation);
			}

			const invitation = InstructorInvitation.create({
				email,
				expiresAt,
				instructor,
				invitedBy,
				tokenHash: InstructorInvitation.hashTokenValue(tokenValue),
			});
			transactionalEntityManager.persist(invitation);
			await transactionalEntityManager.flush();

			return { instructorName: instructor.name, invitation };
		});

		await this.mailer.sendMail({
			from: this.accountConfiguration.confirmEmailFrom,
			subject: 'ScholArk instructor invitation',
			text: `You have been invited to join ScholArk as an instructor for ${result.instructorName}. Accept the invitation: ${invitationUrl}\n\nThis link expires on ${expiresAt.toISOString()}.`,
			to: email,
		});

		return {
			email,
			expiresAt,
			...(this.mailerConfiguration.jsonTransport ? { invitationUrl } : {}),
			instructorName: result.instructorName,
		};
	}

	private getInvitationUrl(tokenValue: string): string {
		const confirmationUrl = this.accountConfiguration.confirmEmailUrl!;
		const urlValue = this.accountConfiguration.instructorInvitationUrl
			?? confirmationUrl.replace('/auth/confirm-email', '/auth/instructor-invitation');
		const url = new URL(urlValue);
		if (!this.accountConfiguration.instructorInvitationUrl && url.pathname === new URL(confirmationUrl).pathname) {
			throw new Error('Configure AUTH_INSTRUCTOR_INVITATION_URL or use the standard confirmation URL path.');
		}
		url.searchParams.set('token', tokenValue);

		return url.toString();
	}

}