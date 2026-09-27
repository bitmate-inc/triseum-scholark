import { randomBytes } from 'node:crypto';

import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { MikroOrmUnitOfWork } from '../../../../../lib/database/mikro.orm.unit.of.work';
import { digestAcquisitionCode, getAcquisitionCodeSuffix } from '../../education/model/acquisition.code.util';
import { InstitutionGameOfferDesignatedPayor } from '../../education/model/institution.game.offer.entity';
import { AcquisitionCodeRepository } from '../../education/repository/acquisition.code.repository';
import { ClassroomGameRepository } from '../../education/repository/classroom.game.repository';
import {
	GameAcquisitionEvent,
	GameAcquisitionEventActorType,
	GameAcquisitionEventType
} from '../../game/model/game.acquisition.event.entity';
import { GameAcquisitionEventRepository } from '../../game/repository/game.acquisition.event.repository';
import { UserEntityRepository } from '../../user/repository/user.entity.repository';

export interface CreateAdminAcquisitionCodesCommandData {
	expiresAt: string;
	classroomGameId: string;
	quantity: number;
}

@Injectable()
export class CreateAdminAcquisitionCodesCommand {

	constructor(
		private readonly acquisitionCodeRepository: AcquisitionCodeRepository,
		private readonly classroomGameRepository: ClassroomGameRepository,
		private readonly acquisitionEventRepository: GameAcquisitionEventRepository,
		private readonly userRepository: UserEntityRepository,
		private readonly unitOfWork: MikroOrmUnitOfWork,
	) {}

	async execute(data: CreateAdminAcquisitionCodesCommandData, issuedByUserId: string): Promise<string[]> {
		return this.unitOfWork.transactional(() => this.executeTransactional(data, issuedByUserId));
	}

	private async executeTransactional(data: CreateAdminAcquisitionCodesCommandData, issuedByUserId: string): Promise<string[]> {
		const classroomGame = await this.classroomGameRepository.findOneBy(
			{ id: data.classroomGameId },
			{ relations: { institutionGameOffer: true } },
		);
		if (!classroomGame) {
			throw new NotFoundException('Classroom game not found.');
		}
		if (classroomGame.institutionGameOffer.designatedPayor !== InstitutionGameOfferDesignatedPayor.INSTITUTION) {
			throw new BadRequestException('Acquisition codes require an institution-funded classroom game.');
		}

		const expiresAt = new Date(data.expiresAt);
		if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
			throw new BadRequestException('Expiry must be a future date.');
		}

		const codeList = Array.from({ length: data.quantity }, () => this.generateCode());
		const acquisitionCodeList = codeList.map((code) => this.acquisitionCodeRepository.create({
			codeDigest: digestAcquisitionCode(code),
			codeSuffix: getAcquisitionCodeSuffix(code),
			expiresAt,
			classroomGame,
		}));
		const actorUser = await this.userRepository.findOneBy({ id: issuedByUserId });
		if (!actorUser) {
			throw new NotFoundException('Admin user not found.');
		}
		await this.acquisitionCodeRepository.saveBatch(acquisitionCodeList);
		await this.acquisitionEventRepository.saveBatch(acquisitionCodeList.map((acquisitionCode) => GameAcquisitionEvent.create({
			acquisitionCode,
			actorType: GameAcquisitionEventActorType.ADMIN,
			actorUser,
			eventType: GameAcquisitionEventType.CODE_ISSUED,
			metadata: {
				classroomGameId: classroomGame.id,
				expiresAt: expiresAt.toISOString(),
			},
		})));

		return codeList;
	}

	private generateCode(): string {
		return randomBytes(12).toString('hex').toUpperCase().match(/.{1,6}/g)!.join('-');
	}

}