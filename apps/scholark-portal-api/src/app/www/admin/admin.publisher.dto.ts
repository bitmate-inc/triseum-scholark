import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import { GetAdminPublisherListQueryData } from '../../core/feature/admin/query/get.admin.publisher.query';
import { Game } from '../../core/feature/game/model/game.entity';
import { GameVersion } from '../../core/feature/game/model/game.version.entity';
import { Publisher } from '../../core/feature/publisher/model/publisher.entity';

export class GetAdminPublisherListQueryDto extends GetListRequestQueryParamsDto {

	get adminFilterBy(): GetAdminPublisherListQueryData['filterBy'] {
		return { q: this.q };
	}

}

export class AdminPublisherListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional({ format: 'uri' })
	websiteUrl?: string;

	static fromEntity(publisher: Publisher): AdminPublisherListItemResponseDto {
		return {
			id: publisher.id!,
			name: publisher.name,
			slug: publisher.slug,
			websiteUrl: publisher.websiteUrl,
		};
	}

}

export class AdminPublisherGameVersionResponseDto {

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

	static fromEntity(version: GameVersion): AdminPublisherGameVersionResponseDto {
		return {
			description: version.description,
			id: version.id!,
			publishedAt: version.publishedAt,
			publisherVersion: version.publisherVersion,
			runUrl: version.runUrl,
		};
	}

}

export class AdminPublisherGameResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional()
	summary?: string;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	publishedAt?: Date;

	@ApiProperty({ type: [AdminPublisherGameVersionResponseDto] })
	gameVersionList!: AdminPublisherGameVersionResponseDto[];

}

export class AdminPublisherResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

	@ApiPropertyOptional({ format: 'uri' })
	websiteUrl?: string;

	@ApiProperty({ type: [AdminPublisherGameResponseDto] })
	gameList!: AdminPublisherGameResponseDto[];

	static fromQueryResult(result: {
		gameList: Game[];
		gameVersionList: GameVersion[];
		publisher: Publisher;
	}): AdminPublisherResponseDto {
		const versionsByGameId = new Map<string, GameVersion[]>();
		for (const version of result.gameVersionList) {
			const gameId = version.game.id!;
			const versions = versionsByGameId.get(gameId) ?? [];
			versions.push(version);
			versionsByGameId.set(gameId, versions);
		}

		return {
			gameList: result.gameList.map((game) => ({
				gameVersionList: (versionsByGameId.get(game.id!) ?? []).map(AdminPublisherGameVersionResponseDto.fromEntity),
				id: game.id!,
				publishedAt: game.publishedAt,
				slug: game.slug,
				summary: game.summary,
				title: game.title,
			})),
			id: result.publisher.id!,
			name: result.publisher.name,
			slug: result.publisher.slug,
			websiteUrl: result.publisher.websiteUrl,
		};
	}

}

export class GetAdminPublisherListResponseDto {

	@ApiProperty({ type: [AdminPublisherListItemResponseDto] })
	publisherList!: AdminPublisherListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: { publisherList: Publisher[]; totalItemCount: number }): GetAdminPublisherListResponseDto {
		return {
			publisherList: result.publisherList.map(AdminPublisherListItemResponseDto.fromEntity),
			totalItemCount: result.totalItemCount,
		};
	}

}

export class GetAdminPublisherResponseDto {

	@ApiProperty({ type: AdminPublisherResponseDto })
	publisher!: AdminPublisherResponseDto;

	static fromQueryResult(result: {
		gameList: Game[];
		gameVersionList: GameVersion[];
		publisher: Publisher;
	}): GetAdminPublisherResponseDto {
		return { publisher: AdminPublisherResponseDto.fromQueryResult(result) };
	}

}