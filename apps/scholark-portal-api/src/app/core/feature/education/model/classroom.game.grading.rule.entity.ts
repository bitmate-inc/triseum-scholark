import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';
import { ClassroomGameListing } from './classroom.game.listing.entity';

export enum ClassroomGameGradingMethod {
	POINTS = 'points',
	COMPLETION_THRESHOLD = 'completion_threshold',
}

export type ClassroomGameGradingRuleConfig = {
	schemaVersion: number;
	progressSchemaVersion: number;
	method: ClassroomGameGradingMethod;
	sectionIndexList: string[];
	scoreMaximum: number;
	completionThresholdPercent?: number;
};

@Entity({ tableName: 'classroom_game_grading_rule' })
@Unique({ properties: ['classroomGameListing', 'revision'] })
export class ClassroomGameGradingRule {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => ClassroomGameListing, { deleteRule: 'restrict' })
	classroomGameListing!: ClassroomGameListing;

	@ManyToOne(() => User, { deleteRule: 'restrict' })
	createdBy!: User;

	@Property()
	revision!: number;

	@Property({ type: 'json' })
	config!: ClassroomGameGradingRuleConfig;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}