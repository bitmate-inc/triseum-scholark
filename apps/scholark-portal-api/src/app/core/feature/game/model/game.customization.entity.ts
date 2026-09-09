import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { GameVersion } from './game.version.entity';

@Entity({ tableName: 'game_customization' })
export class GameCustomization {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameVersion, { deleteRule: 'cascade' })
	gameVersion!: GameVersion;

	@Property({ type: 'json' })
	content: Record<string, unknown> = {};

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	publishedAt?: Date;

}
