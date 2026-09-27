import {
	Entity,
	Enum,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { AcquisitionCode } from '../../education/model/acquisition.code.entity';
import { User } from '../../user/model/user.entity';
import { GameAcquisition } from './game.acquisition.entity';

export enum GameAcquisitionEventType {
	PAYMENT_FULFILLED = 'payment_fulfilled',
	CODE_REDEEMED = 'code_redeemed',
	CODE_ISSUED = 'code_issued',
	CODE_REVOKED = 'code_revoked',
}

export enum GameAcquisitionEventActorType {
	SYSTEM = 'system',
	USER = 'user',
	ADMIN = 'admin',
	STRIPE = 'stripe',
}

@Entity({ tableName: 'game_acquisition_event' })
export class GameAcquisitionEvent extends StaticFactory {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameAcquisition, { nullable: true, deleteRule: 'restrict' })
	acquisition?: GameAcquisition;

	@ManyToOne(() => AcquisitionCode, { nullable: true, deleteRule: 'restrict' })
	acquisitionCode?: AcquisitionCode;

	@Enum(() => GameAcquisitionEventType)
	eventType!: GameAcquisitionEventType;

	@Enum(() => GameAcquisitionEventActorType)
	actorType!: GameAcquisitionEventActorType;

	@ManyToOne(() => User, { nullable: true, deleteRule: 'restrict' })
	actorUser?: User;

	@Property({ nullable: true, type: 'text' })
	reason?: string;

	@Property({ nullable: true })
	providerReference?: string;

	@Property({ nullable: true })
	correlationId?: string;

	@Property({ type: 'json', nullable: true })
	metadata?: Record<string, unknown>;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}