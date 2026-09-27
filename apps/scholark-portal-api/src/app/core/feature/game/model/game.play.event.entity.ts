import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameLicense } from './game.license.entity';
import { GameVersion } from './game.version.entity';

@Entity({ tableName: 'game_play_event' })
@Unique({ properties: ['gameLicense', 'eventId'] })
export class GamePlayEvent {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	gameLicense!: GameLicense;

	@ManyToOne(() => GameVersion, { deleteRule: 'restrict' })
	gameVersion!: GameVersion;

	@Property({ length: 200 })
	eventId!: string;

	@Property({ length: 200 })
	eventType!: string;

	@Property()
	schemaVersion!: number;

	@Property({ type: 'json' })
	payload!: Record<string, unknown>;

	@Property()
	occurredAt!: Date;

	@Property({ onCreate: () => new Date() })
	receivedAt?: Date;

}