import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import { User } from '../../user/model/user.entity';
import { AcquisitionCode } from './acquisition.code.entity';

@Entity({ tableName: 'acquisition_code_redemption' })
@Unique({ properties: ['acquisitionCode', 'redeemedBy'] })
export class AcquisitionCodeRedemption {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => AcquisitionCode, { deleteRule: 'restrict' })
	acquisitionCode!: AcquisitionCode;

	@ManyToOne(() => User, { deleteRule: 'restrict' })
	redeemedBy!: User;

	@Property({ onCreate: () => new Date() })
	redeemedAt?: Date;

}