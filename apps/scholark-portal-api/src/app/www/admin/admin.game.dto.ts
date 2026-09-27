import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEnum,
	IsOptional,
	IsUUID
} from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminGameListQueryData } from '../../core/feature/admin/query/get.admin.game.query';
import { InstitutionGameOffer, InstitutionGameOfferDesignatedPayor } from '../../core/feature/education/model/institution.game.offer.entity';
import { Game } from '../../core/feature/game/model/game.entity';
import { GameVariant, GameVariantMode } from '../../core/feature/game/model/game.variant.entity';
import { GameVersion } from '../../core/feature/game/model/game.version.entity';
import { PublicGameOffer } from '../../core/feature/game/model/public.game.offer.entity';
import { MoneyDto } from '../catalog/game.dto';

enum GamePublicationFilter {
	PUBLISHED = 'published',
	UNPUBLISHED = 'unpublished',
	SCHEDULED = 'scheduled',
}

export class GetAdminGameListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ format: 'uuid' })
	@IsOptional()
	@IsUUID()
	publisherId?: string;

	@ApiPropertyOptional({ enum: GamePublicationFilter })
	@IsOptional()
	@IsEnum(GamePublicationFilter)
	publication?: GamePublicationFilter;

	get adminFilterBy(): GetAdminGameListQueryData['filterBy'] {
		return { publication: this.publication, publisherId: this.publisherId, q: this.q };
	}

}

class AdminGamePublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

export class AdminGameListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

	@ApiProperty({ type: () => AdminGamePublisherResponseDto })
	publisher!: AdminGamePublisherResponseDto;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional()
	featured?: boolean;

	static fromEntity(game: Game): AdminGameListItemResponseDto {
		return {
			featured: game.isFeatured,
			id: game.id!,
			publishedAt: game.publishedAt,
			publisher: { id: game.publisher.id!, name: game.publisher.name, slug: game.publisher.slug },
			slug: game.slug,
			title: game.title,
		};
	}

}

export class AdminGamePublicOfferResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiProperty()
	available!: boolean;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	static fromEntity(offer: PublicGameOffer): AdminGamePublicOfferResponseDto {
		return { available: offer.isAvailable, id: offer.id!, price: offer.price, publishedAt: offer.publishedAt ?? undefined };
	}

}

export class AdminGameInstitutionOfferResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty({ enum: InstitutionGameOfferDesignatedPayor, enumName: 'InstitutionGameOfferDesignatedPayor' })
	designatedPayor!: InstitutionGameOfferDesignatedPayor;

	@ApiProperty({ type: MoneyDto })
	price!: MoneyDto;

	@ApiPropertyOptional({ minimum: 0 })
	allocatedLicenseQuantity?: number;

	@ApiProperty({ minimum: 1 })
	licenseDurationDays!: number;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	static fromEntity(offer: InstitutionGameOffer): AdminGameInstitutionOfferResponseDto {
		return {
			allocatedLicenseQuantity: offer.allocatedLicenseQuantity,
			designatedPayor: offer.designatedPayor,
			id: offer.id!,
			licenseDurationDays: offer.licenseDurationDays,
			price: offer.price,
			publishedAt: offer.publishedAt,
		};
	}

}

export class AdminGameVariantResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	language!: string;

	@ApiProperty({ enum: GameVariantMode, enumName: 'GameVariantMode' })
	mode!: GameVariantMode;

	@ApiProperty({ type: [AdminGamePublicOfferResponseDto] })
	publicOfferList!: AdminGamePublicOfferResponseDto[];

	@ApiProperty({ type: [AdminGameInstitutionOfferResponseDto] })
	institutionOfferList!: AdminGameInstitutionOfferResponseDto[];

}

export class AdminGameVersionResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ format: 'uri' })
	runUrl!: string;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiProperty({ type: [AdminGameVariantResponseDto] })
	variantList!: AdminGameVariantResponseDto[];

}

export class AdminGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional()
	summary?: string;

	@ApiPropertyOptional()
	description?: string;

	@ApiProperty({ type: () => AdminGamePublisherResponseDto })
	publisher!: AdminGamePublisherResponseDto;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiPropertyOptional()
	featured?: boolean;

	@ApiProperty({ type: [AdminGameVersionResponseDto] })
	versionList!: AdminGameVersionResponseDto[];

	static fromQueryResult(result: {
		game: Game;
		gameVersionList: GameVersion[];
		gameVariantList: GameVariant[];
		institutionGameOfferList: InstitutionGameOffer[];
		publicGameOfferList: PublicGameOffer[];
	}): AdminGameResponseDto {
		const variantsByVersionId = new Map<string, GameVariant[]>();
		for (const variant of result.gameVariantList) {
			const versionId = variant.gameVersion.id!;
			const variants = variantsByVersionId.get(versionId) ?? [];
			variants.push(variant);
			variantsByVersionId.set(versionId, variants);
		}
		const publicOffersByVariantId = new Map<string, PublicGameOffer[]>();
		for (const offer of result.publicGameOfferList) {
			const variantId = offer.gameVariant.id!;
			const offers = publicOffersByVariantId.get(variantId) ?? [];
			offers.push(offer);
			publicOffersByVariantId.set(variantId, offers);
		}
		const institutionOffersByVariantId = new Map<string, InstitutionGameOffer[]>();
		for (const offer of result.institutionGameOfferList) {
			const variantId = offer.gameVariant.id!;
			const offers = institutionOffersByVariantId.get(variantId) ?? [];
			offers.push(offer);
			institutionOffersByVariantId.set(variantId, offers);
		}

		return {
			description: result.game.description,
			featured: result.game.isFeatured,
			id: result.game.id!,
			publishedAt: result.game.publishedAt,
			publisher: {
				id: result.game.publisher.id!,
				name: result.game.publisher.name,
				slug: result.game.publisher.slug,
			},
			slug: result.game.slug,
			summary: result.game.summary,
			title: result.game.title,
			versionList: result.gameVersionList.map((version) => ({
				description: version.description,
				id: version.id!,
				publishedAt: version.publishedAt,
				publisherVersion: version.publisherVersion,
				runUrl: version.runUrl,
				variantList: (variantsByVersionId.get(version.id!) ?? []).map((variant) => ({
					id: variant.id!,
					institutionOfferList: (institutionOffersByVariantId.get(variant.id!) ?? []).map(AdminGameInstitutionOfferResponseDto.fromEntity),
					language: variant.language,
					mode: variant.mode,
					publicOfferList: (publicOffersByVariantId.get(variant.id!) ?? []).map(AdminGamePublicOfferResponseDto.fromEntity),
				})),
			})),
		};
	}

}

export class GetAdminGameListResponseDto {

	@ApiProperty({ type: [AdminGameListItemResponseDto] })
	gameList!: AdminGameListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { gameList: Game[]; totalItemCount: number }): GetAdminGameListResponseDto {
		return { gameList: result.gameList.map(AdminGameListItemResponseDto.fromEntity), totalItemCount: result.totalItemCount };
	}

}

export class GetAdminGameResponseDto {

	@ApiProperty({ type: AdminGameResponseDto })
	game!: AdminGameResponseDto;

	static fromQueryResult(result: Parameters<typeof AdminGameResponseDto.fromQueryResult>[0]): GetAdminGameResponseDto {
		return { game: AdminGameResponseDto.fromQueryResult(result) };
	}

}