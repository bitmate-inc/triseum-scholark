import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { InstitutionGameOffer } from '../../education/model/institution.game.offer.entity';

export interface CreateAdminClassroomGameCommandData {
	classroomId: string;
	endAt: Date;
	institutionGameOfferId: string;
	publishedAt?: Date;
	startAt: Date;
}

@Injectable()
export class CreateAdminClassroomGameCommand {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
		@InjectRepository(ClassroomGame)
		private readonly classroomGameRepository: EntityRepository<ClassroomGame>,
		@InjectRepository(InstitutionGameOffer)
		private readonly institutionGameOfferRepository: EntityRepository<InstitutionGameOffer>,
	) {}

	async execute(data: CreateAdminClassroomGameCommandData): Promise<ClassroomGame> {
		const classroom = await this.classroomRepository.findOne({ id: data.classroomId });
		if (!classroom) {
			throw new NotFoundException('Classroom not found.');
		}

		const institutionGameOffer = await this.institutionGameOfferRepository.findOne({ id: data.institutionGameOfferId });
		if (!institutionGameOffer) {
			throw new NotFoundException('Institution game offer not found.');
		}

		if (data.endAt.getTime() <= data.startAt.getTime()) {
			throw new BadRequestException('Assignment end date must be after its start date.');
		}

		const classroomGame = this.classroomGameRepository.create({
			classroom,
			endAt: data.endAt,
			institutionGameOffer,
			publishedAt: data.publishedAt,
			startAt: data.startAt,
		});
		const entityManager = this.classroomGameRepository.getEntityManager();
		entityManager.persist(classroomGame);
		await entityManager.flush();
		return classroomGame;
	}

}