import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { ClassroomGameListing } from './classroom.game.listing.entity';

@Entity({ tableName: 'acquisition_code' })
export class AcquisitionCode {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@Property({ unique: true })
	codeDigest!: string;

	@Property({ length: 4 })
	codeSuffix!: string;

	@ManyToOne(() => ClassroomGameListing, { nullable: true, deleteRule: 'restrict' })
	classroomGameListing?: ClassroomGameListing;

	@Property()
	expiresAt!: Date;

	@Property({ nullable: true })
	revokedAt?: Date;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

}
