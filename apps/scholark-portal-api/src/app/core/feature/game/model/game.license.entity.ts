import { Collection } from '@mikro-orm/core';
import {
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { ClassroomGameLicence } from '../../education/model/classroom.game.enrollment.entity';
import { User } from '../../user/model/user.entity';
import { GameCustomization } from './game.customization.entity';
import { GameVersion } from './game.version.entity';

@Entity({ tableName: 'game_license' })
export class GameLicense {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => User, { deleteRule: 'cascade' })
	user!: User;

	@ManyToOne(() => GameVersion, { deleteRule: 'restrict' })
	gameVersion!: GameVersion;

	@ManyToOne(() => GameCustomization, { nullable: true, deleteRule: 'restrict' })
	customization?: GameCustomization;

	@OneToMany(() => ClassroomGameLicence, (enrollment) => enrollment.gameLicense)
	enrollmentList = new Collection<ClassroomGameLicence>(this);

	@Property()
	startAt!: Date;

	@Property()
	endAt!: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
