import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameVersion } from './game.version.entity';

export enum GameVariantMode {
	DEFAULT = 'default',
	GAME_BASED_COURSE = 'game_based_course',
}

@Entity({ tableName: 'game_variant' })
@Unique({ properties: ['gameVersion', 'language', 'mode'] })
export class GameVariant {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameVersion, { deleteRule: 'cascade' })
	gameVersion!: GameVersion;

	@Property()
	language!: string;

	@Property({ type: 'string' })
	mode!: GameVariantMode;

	@Property({ type: 'json' })
	runtimeConfiguration: Record<string, unknown> = {};

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
