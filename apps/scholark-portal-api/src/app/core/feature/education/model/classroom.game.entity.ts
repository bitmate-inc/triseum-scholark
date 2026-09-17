import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { GameCustomization } from '../../game/model/game.customization.entity';
import { Classroom } from './classroom.entity';
import { InstitutionContractGameVersion } from './institution.contract.game.version.entity';

@Entity({ tableName: 'classroom_game' })
export class ClassroomGame {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Classroom, { deleteRule: 'cascade' })
	classroom!: Classroom;

	@ManyToOne(() => InstitutionContractGameVersion, { deleteRule: 'restrict' })
	contractGameVersion!: InstitutionContractGameVersion;

	@ManyToOne(() => GameCustomization, { nullable: true, deleteRule: 'restrict' })
	customization?: GameCustomization;

	@Property()
	startAt!: Date;

	@Property()
	endAt!: Date;

	@Property({ nullable: true })
	publishedAt?: Date;

	isPublished(referenceDate: Date = new Date()): boolean {
		return this.publishedAt != null && this.publishedAt <= referenceDate;
	}

	isExpired(referenceDate: Date = new Date()): boolean {
		return this.endAt < referenceDate;
	}

	isActive(referenceDate: Date = new Date()): boolean {
		return this.startAt <= referenceDate && !this.isExpired(referenceDate);
	}

	isAvailable(referenceDate: Date = new Date()): boolean {
		return this.isPublished(referenceDate) && this.isActive(referenceDate);
	}

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}
