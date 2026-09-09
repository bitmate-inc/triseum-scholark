import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameLicense } from '../../game/model/game.license.entity';
import { ClassroomGame } from './classroom.game.entity';

@Entity({ tableName: 'classroom_game_enrollment' })
@Unique({ properties: ['classroomGame', 'gameLicense'] })
export class ClassroomGameLicence {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => ClassroomGame, { deleteRule: 'cascade' })
	classroomGame!: ClassroomGame;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	gameLicense!: GameLicense;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
