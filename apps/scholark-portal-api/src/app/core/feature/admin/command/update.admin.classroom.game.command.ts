import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { Classroom } from '../../education/model/classroom.entity';
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { InstitutionGameOffer } from '../../education/model/institution.game.offer.entity';

export interface UpdateAdminClassroomGameCommandData {
	classroomId?: string;
	endAt?: Date;
	institutionGameOfferId?: string;
	publishedAt?: Date | null;
	startAt?: Date;
}

@Injectable()
export class UpdateAdminClassroomGameCommand {

	constructor(
		@InjectRepository(Classroom)
		private readonly classroomRepository: EntityRepository<Classroom>,
		@InjectRepository(ClassroomGame)
		private readonly classroomGameRepository: EntityRepository<ClassroomGame>,
		@InjectRepository(InstitutionGameOffer)
		private readonly institutionGameOfferRepository: EntityRepository<InstitutionGameOffer>,
	) {}

	async execute(id: string, data: UpdateAdminClassroomGameCommandData): Promise<ClassroomGame> {
		if (Object.keys(data).length === 0) {
			throw new BadRequestException('At least one assignment field must be provided.');
		}
		const classroomGame = await this.classroomGameRepository.findOne({ id });
		if (!classroomGame) {
			throw new NotFoundException('Classroom game assignment not found.');
		}
		if (classroomGame.isPublished()) {
			throw new ConflictException('Published classroom game assignments are immutable. Create a replacement instead.');
		}

		const startAt = data.startAt ?? classroomGame.startAt;
		const endAt = data.endAt ?? classroomGame.endAt;
		if (endAt.getTime() <= startAt.getTime()) {
			throw new BadRequestException('Assignment end date must be after its start date.');
		}
		if (data.classroomId !== undefined) {
			const classroom = await this.classroomRepository.findOne({ id: data.classroomId });
			if (!classroom) {
				throw new NotFoundException('Classroom not found.');
			}
			classroomGame.classroom = classroom;
		}
		if (data.institutionGameOfferId !== undefined) {
			const offer = await this.institutionGameOfferRepository.findOne({ id: data.institutionGameOfferId });
			if (!offer) {
				throw new NotFoundException('Institution game offer not found.');
			}
			classroomGame.institutionGameOffer = offer;
		}
		classroomGame.startAt = startAt;
		classroomGame.endAt = endAt;
		if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
			classroomGame.publishedAt = data.publishedAt ?? undefined;
		}

		await this.classroomGameRepository.getEntityManager().flush();
		return classroomGame;
	}

}