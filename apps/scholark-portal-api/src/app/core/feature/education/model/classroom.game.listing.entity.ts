import {
	Embedded,
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { Money } from '../../../shared/commerce/model/money.entity';
import { GameCustomization } from '../../game/model/game.customization.entity';
import { GameVersion } from '../../game/model/game.version.entity';
import { Classroom } from './classroom.entity';

export enum ClassroomGameListingDesignatedPayor {
	STUDENT = 'student',
	INSTITUTION = 'institution',
}

@Entity({ tableName: 'classroom_game_listing' })
export class ClassroomGameListing {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Classroom, { deleteRule: 'cascade' })
	classroom!: Classroom;

	@ManyToOne(() => GameVersion, { deleteRule: 'restrict' })
	gameVersion!: GameVersion;

	@Property()
	language!: string;

	@Property({ type: 'string' })
	courseType!: Classroom['courseType'];

	@Property({ type: 'string' })
	designatedPayor!: ClassroomGameListingDesignatedPayor;

	@Embedded(() => Money, { nullable: true, prefix: 'price_' })
	price?: Money;

	@Property({ nullable: true })
	includedLicenseQuantity?: number;

	@Property()
	licenseDurationDays!: number;

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
		return this.endAt <= referenceDate;
	}

	isActive(referenceDate: Date = new Date()): boolean {
		return this.startAt <= referenceDate && !this.isExpired(referenceDate);
	}

	isAvailable(referenceDate: Date = new Date()): boolean {
		return this.isPublished(referenceDate) && this.isActive(referenceDate);
	}

	canBeAcquired(referenceDate: Date = new Date()): boolean {
		return this.isAvailable(referenceDate)
			&& this.gameVersion.isPublished(referenceDate)
			&& this.gameVersion.game.isPublished(referenceDate);
	}

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}
