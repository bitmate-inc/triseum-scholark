import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { Institution } from './institution.entity';

export enum InstitutionContractType {
	ADOPTION = 'adoption',
	AMBASSADOR = 'ambassador',
	DEMO = 'demo',
	INTERNAL = 'internal',
	NATIONAL = 'national',
	NON_SALES_EVALUATION = 'non_sales_evaluation',
	PILOT = 'pilot',
	RESEARCH_IRB = 'research_irb',
	RESEARCH_NON_IRB = 'research_non_irb',
	TRIAL = 'trial',
}

export enum InstitutionContractDesignatedPayor {
	STUDENT = 'student',
	INSTITUTION = 'institution',
}

export enum InstitutionContractStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

@Entity({ tableName: 'institution_contract' })
export class InstitutionContract {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => Institution, { deleteRule: 'cascade' })
	institution!: Institution;

	@Property({ type: 'string' })
	type!: InstitutionContractType;

	@Property({ type: 'string' })
	designatedPayor!: InstitutionContractDesignatedPayor;

	@Property({ default: InstitutionContractStatus.ACTIVE, type: 'string' })
	status: InstitutionContractStatus = InstitutionContractStatus.ACTIVE;

	@Property()
	startAt!: Date;

	@Property()
	endAt!: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
	updatedAt?: Date;

}
