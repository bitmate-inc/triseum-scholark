import { Collection } from '@mikro-orm/core';
import {
	Embedded,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryKey,
} from '@mikro-orm/decorators/legacy';

import { Money } from '../../../shared/commerce/model/money.entity';
import type { PublicGameListing } from './public.game.listing.entity';
import { PublicGameListingPriceGroupLanguage } from './public.game.listing.price.group.language.entity';

@Entity({ tableName: 'public_game_listing_price_group' })
export class PublicGameListingPriceGroup {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => 'PublicGameListing' as never, { deleteRule: 'cascade' })
	publicGameListing!: PublicGameListing;

	@Embedded(() => Money, { prefix: 'price_' })
	price!: Money;

	@OneToMany(() => PublicGameListingPriceGroupLanguage, (language) => language.priceGroup, { orphanRemoval: true })
	languageList = new Collection<PublicGameListingPriceGroupLanguage>(this);

}