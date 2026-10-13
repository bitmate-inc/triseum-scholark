import { Collection } from '@mikro-orm/core';
import {
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryKey,
	Property,
} from '@mikro-orm/decorators/legacy';

import { GameVersion } from './game.version.entity';
import { PublicGameListingPriceGroup } from './public.game.listing.price.group.entity';

@Entity({ tableName: 'public_game_listing' })
export class PublicGameListing {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => GameVersion, { deleteRule: 'restrict' })
	gameVersion!: GameVersion;

	@OneToMany(() => PublicGameListingPriceGroup, (priceGroup) => priceGroup.publicGameListing, { orphanRemoval: true })
	priceGroupList = new Collection<PublicGameListingPriceGroup>(this);

	@Property({ default: true })
	isAvailable = true;

	@Property({ onCreate: () => new Date() })
	createdAt?: Date;

	@Property({ nullable: true })
	publishedAt?: Date;

	@Property({ onCreate: () => new Date() })
	startAt?: Date;

	@Property({ nullable: true })
	endAt?: Date;

	isPublished(referenceDate: Date = new Date()): boolean {
		return this.publishedAt != null && this.publishedAt <= referenceDate;
	}

	isInWindow(referenceDate: Date = new Date(), endAt: Date | null | undefined = this.endAt): boolean {
		return !!this.startAt && this.startAt <= referenceDate && (endAt == null || endAt > referenceDate);
	}

	canBeAcquired(referenceDate: Date = new Date(), endAt: Date | null | undefined = this.endAt): boolean {
		return this.isAvailable && this.isPublished(referenceDate) && this.isInWindow(referenceDate, endAt);
	}

}
