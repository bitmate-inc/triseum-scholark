import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Game } from '../../game/model/game.entity';
import { Classroom } from './classroom.entity';

@Entity({ tableName: 'classroom_game' })
@Unique({ properties: ['classroom', 'game'] })
export class ClassroomGame {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Classroom, { deleteRule: 'cascade' })
	classroom!: Classroom;

	@ManyToOne(() => Game, { deleteRule: 'cascade' })
	game!: Game;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}