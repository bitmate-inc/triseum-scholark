import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameLicense } from './game.license.entity';
import { GameVersion } from './game.version.entity';

@Entity({ tableName: 'game_state' })
@Unique({ properties: ['gameLicense'] })
export class GameState {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	gameLicense!: GameLicense;

	@ManyToOne(() => GameVersion, { deleteRule: 'restrict' })
	gameVersion!: GameVersion;

	@Property()
	schemaVersion!: number;

	@Property({ type: 'json' })
	content!: Record<string, unknown>;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	savedAt?: Date;

}
