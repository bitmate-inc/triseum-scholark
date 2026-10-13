import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from '@mikro-orm/decorators/legacy';

import type { PublicGameListing } from './public.game.listing.entity';
import type { PublicGameListingPriceGroup } from './public.game.listing.price.group.entity';

@Entity({ tableName: 'public_game_listing_price_group_language' })
@Unique({ properties: ['publicGameListing', 'language'] })
export class PublicGameListingPriceGroupLanguage {

	@PrimaryKey({ defaultRaw: 'gen_random_uuid()', type: 'uuid' })
	id?: string;

	@ManyToOne(() => 'PublicGameListing' as never, { deleteRule: 'cascade' })
	publicGameListing!: PublicGameListing;

	@ManyToOne(() => 'PublicGameListingPriceGroup' as never, { deleteRule: 'cascade' })
	priceGroup!: PublicGameListingPriceGroup;

	@Property()
	language!: string;

}