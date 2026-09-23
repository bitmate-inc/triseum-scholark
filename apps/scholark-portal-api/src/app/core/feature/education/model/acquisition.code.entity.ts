import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { InstitutionGameOffer } from './institution.game.offer.entity';

@Entity({ tableName: 'acquisition_code' })
export class AcquisitionCode {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property({ unique: true })
	code!: string;

	@ManyToOne(() => InstitutionGameOffer, { deleteRule: 'restrict' })
	institutionGameOffer!: InstitutionGameOffer;

	@Property()
	expiresAt!: Date;

	@Property({ nullable: true })
	revokedAt?: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
