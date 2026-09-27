import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType,
} from '../../game/model/game.acquisition.event.entity';
import { GameAcquisitionEventRepository } from '../../game/repository/game.acquisition.event.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';

@Injectable()
export class RevokeAdminAcquisitionCodeCommand {

	constructor(
		private readonly acquisitionCodeRepository: AcquisitionCodeRepository,
		private readonly acquisitionEventRepository: GameAcquisitionEventRepository,
		private readonly userRepository: UserEntityRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(codeId: string, actorUserId: string, reason: string): Promise<void> {
		const normalizedReason = reason.trim();
		if (!normalizedReason) {
			throw new BadRequestException('A reason is required to revoke an acquisition code.');
		}

		await this.unitOfWork.transactional(async () => {
			const acquisitionCode = await this.acquisitionCodeRepository.findForRevocation(codeId);
			if (!acquisitionCode) {
				throw new NotFoundException('Acquisition code not found.');
			}
			if (acquisitionCode.revokedAt) {
				throw new ConflictException('Acquisition code has already been revoked.');
			}
			const actorUser = await this.userRepository.findOneBy({ id: actorUserId });
			if (!actorUser) {
				throw new NotFoundException('Admin user not found.');
			}

			const revokedAt = new Date();
			acquisitionCode.revokedAt = revokedAt;
			await this.acquisitionCodeRepository.save(acquisitionCode);
			await this.acquisitionEventRepository.save(GameAcquisitionEvent.create({
				acquisitionCode,
				actorType: GameAcquisitionEventActorType.ADMIN,
				actorUser,
				eventType: GameAcquisitionEventType.CODE_REVOKED,
				metadata: { codeSuffix: acquisitionCode.codeSuffix },
				reason: normalizedReason,
			}));
		});
	}

}