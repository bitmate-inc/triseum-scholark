import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { ClassroomGame } from '../../education/model/classroom.game.entity';
import { User } from '../../user/model/user.entity';
import { GameCustomization } from './game.customization.entity';
import { GameVariant } from './game.variant.entity';

@Entity({ tableName: 'game_license' })
export class GameLicense extends StaticFactory {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'cascade' })
	user!: User;

	@ManyToOne(() => ClassroomGame, { nullable: true, deleteRule: 'restrict' })
	classroomGame?: ClassroomGame;

	@ManyToOne(() => GameVariant, { deleteRule: 'restrict' })
	gameVariant!: GameVariant;

	@ManyToOne(() => GameCustomization, { nullable: true, deleteRule: 'restrict' })
	customization?: GameCustomization;

	@Property()
	startAt!: Date;

	@Property()
	endAt!: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	isExpired(referenceDate: Date = new Date()): boolean {
		return this.endAt <= referenceDate;
	}

	isActive(referenceDate: Date = new Date()): boolean {
		return this.startAt <= referenceDate && !this.isExpired(referenceDate);
	}

	static createForDuration(durationDays: number, data: Partial<GameLicense> = {}): GameLicense {
		const startAt = new Date();
		const endAt = new Date(startAt);
		endAt.setDate(endAt.getDate() + durationDays);

		const license = GameLicense.create(data);
		license.startAt = startAt;
		license.endAt = endAt;

		return license;
	}

}