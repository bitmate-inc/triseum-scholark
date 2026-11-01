import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameLicense } from './game.license.entity';

export type GameProgressMetricMap = Record<string, number | null>;

export type GameProgressSummary = {
	playTimeSeconds?: number | null;
	sessionCount?: number | null;
	completionPercent?: number | null;
	completed?: boolean | null;
	metrics?: GameProgressMetricMap | null;
};

export type GameProgressSection = {
	sectionIndex: string;
	metrics?: GameProgressMetricMap | null;
	completionPercent?: number | null;
	completed?: boolean | null;
};

export type GameProgressSnapshotContent = {
	summary?: GameProgressSummary | null;
	sectionList?: GameProgressSection[];
};

@Entity({ tableName: 'game_progress_snapshot' })
@Unique({ properties: ['gameLicense'] })
export class GameProgressSnapshot {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	gameLicense!: GameLicense;

	@Property()
	schemaVersion!: number;

	@Property({ type: 'json' })
	content!: GameProgressSnapshotContent;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}