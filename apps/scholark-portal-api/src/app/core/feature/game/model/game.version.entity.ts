import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { Game } from './game.entity';
import type { GameProgressStructure } from './game.progress.structure';

@Entity({ tableName: 'game_version' })
@Unique({ properties: ['game', 'publisherVersion'] })
export class GameVersion {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Game, { deleteRule: 'cascade' })
	game!: Game;

	@Property({ nullable: true, type: 'text' })
	description?: string;

	@Property()
	publisherVersion!: string;

	@Property()
	runUrl!: string;

	@Property({ nullable: true, type: 'json' })
	progressStructure?: GameProgressStructure;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	publishedAt?: Date;

	isPublished(referenceDate: Date = new Date()): boolean {
		return this.publishedAt != null && this.publishedAt <= referenceDate;
	}

}
