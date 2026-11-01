import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { GameLicense } from '../../game/model/game.license.entity';
import { GameProgressSnapshot, type GameProgressSnapshotContent } from '../../game/model/game.progress.snapshot.entity';
import { ClassroomGameGradingRule } from './classroom.game.grading.rule.entity';

export type GameGradeActivityProgress = 'unknown' | 'in_progress' | 'completed';
export type GameGradeProgress = 'not_ready' | 'pending' | 'fully_graded' | 'incompatible';

export type GameGradeSectionResult = {
	sectionIndex: string;
	label: string;
	points: number;
	pointsPossible: number;
	percentage: number;
};

export type GameGradeResultContent = {
	scoreGiven: number | null;
	scoreMaximum: number;
	percentage: number | null;
	activityProgress: GameGradeActivityProgress;
	gradingProgress: GameGradeProgress;
	sectionResultList: GameGradeSectionResult[];
};

@Entity({ tableName: 'game_grade_result' })
@Unique({ properties: ['gameLicense', 'gradingRule', 'sourceProgressHash'] })
export class GameGradeResult {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameLicense, { deleteRule: 'restrict' })
	gameLicense!: GameLicense;

	@ManyToOne(() => ClassroomGameGradingRule, { deleteRule: 'restrict' })
	gradingRule!: ClassroomGameGradingRule;

	@ManyToOne(() => GameProgressSnapshot, { deleteRule: 'restrict' })
	progressSnapshot!: GameProgressSnapshot;

	@Property()
	sourceProgressUpdatedAt!: Date;

	@Property({ length: 64 })
	sourceProgressHash!: string;

	@Property({ type: 'json' })
	sourceProgressContent!: GameProgressSnapshotContent;

	@Property({ type: 'json' })
	content!: GameGradeResultContent;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}