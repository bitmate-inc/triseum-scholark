import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminGameOfferListQueryData } from '../../core/feature/admin/query/get.admin.game.offer.query';
import { InstitutionGameOffer, InstitutionGameOfferDesignatedPayor } from '../../core/feature/education/model/institution.game.offer.entity';
import { GameVariantMode } from '../../core/feature/game/model/game.variant.entity';
import { PublicGameOffer } from '../../core/feature/game/model/public.game.offer.entity';
import { MoneyDto } from '../catalog/game.dto';

enum AdminGameOfferTypeFilter {
	PUBLIC = 'public',
	INSTITUTION = 'institution',
}

export class GetAdminGameOfferListQueryDto extends GetListRequestQueryParamsDto {

	@ApiProperty({ enum: AdminGameOfferTypeFilter })
	@IsEnum(AdminGameOfferTypeFilter)
	type!: AdminGameOfferTypeFilter;

	get adminFilterBy(): GetAdminGameOfferListQueryData['filterBy'] {
		return { q: this.q, type: this.type };
	}

}

class AdminGameOfferGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

}

class AdminGameOfferPublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class AdminGameOfferVersionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	publisherVersion!: string;

}

class AdminGameOfferVariantResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	language!: string;

	@ApiProperty({ enum: GameVariantMode, enumName: 'GameVariantMode' })
	mode!: GameVariantMode;

}

export class AdminGameOfferListItemResponseDto {

	@ApiProperty({ enum: ['public', 'institution'] })
	offerType!: 'public' | 'institution';

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiProperty({ type: AdminGameOfferGameResponseDto })
	game!: AdminGameOfferGameResponseDto;

	@ApiProperty({ type: AdminGameOfferPublisherResponseDto })
	publisher!: AdminGameOfferPublisherResponseDto;

	@ApiProperty({ type: AdminGameOfferVersionResponseDto })
	gameVersion!: AdminGameOfferVersionResponseDto;

	@ApiProperty({ type: AdminGameOfferVariantResponseDto })
	gameVariant!: AdminGameOfferVariantResponseDto;

	@ApiPropertyOptional()
	available?: boolean;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional({ enum: InstitutionGameOfferDesignatedPayor, enumName: 'InstitutionGameOfferDesignatedPayor' })
	designatedPayor?: InstitutionGameOfferDesignatedPayor;

	@ApiPropertyOptional({ minimum: 0 })
	allocatedLicenseQuantity?: number;

	@ApiPropertyOptional({ minimum: 1 })
	licenseDurationDays?: number;

	static fromEntity(offer: PublicGameOffer | InstitutionGameOffer): AdminGameOfferListItemResponseDto {
		const variant = offer.gameVariant;
		const version = variant.gameVersion;
		const game = version.game;
		const base = {
			game: { id: game.id!, slug: game.slug, title: game.title },
			gameVariant: { id: variant.id!, language: variant.language, mode: variant.mode },
			gameVersion: { id: version.id!, publisherVersion: version.publisherVersion },
			id: offer.id!,
			price: offer.price,
			publisher: { id: game.publisher.id!, name: game.publisher.name, slug: game.publisher.slug },
		};

		if ('isAvailable' in offer) {
			return {
				...base,
				available: offer.isAvailable,
				offerType: 'public',
				publishedAt: offer.publishedAt ?? undefined,
			};
		}

		return {
			...base,
			allocatedLicenseQuantity: offer.allocatedLicenseQuantity,
			designatedPayor: offer.designatedPayor,
			licenseDurationDays: offer.licenseDurationDays,
			offerType: 'institution',
		};
	}

}

export class GetAdminGameOfferListResponseDto {

	@ApiProperty({ type: [AdminGameOfferListItemResponseDto] })
	offerList!: AdminGameOfferListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: {
		offerList: (PublicGameOffer | InstitutionGameOffer)[];
		totalItemCount: number;
	}): GetAdminGameOfferListResponseDto {
		return {
			offerList: result.offerList.map(AdminGameOfferListItemResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}