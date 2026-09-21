import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserLibraryItem } from '../../core/feature/catalog/query/get.user.library.query';

class UserLibraryGameResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	slug!: string;

}

class UserLibraryVersionResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty()
	publisherVersion!: string;

	@ApiProperty({ format: 'uri' })
	runUrl!: string;

}

class UserLibraryVariantResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

}

class UserLibraryClassroomResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	slug!: string;

}

class UserLibraryItemResponseDto {

	@ApiProperty()
	id!: string;

	@ApiProperty({ type: UserLibraryGameResponseDto })
	game!: UserLibraryGameResponseDto;

	@ApiProperty({ type: UserLibraryVersionResponseDto })
	gameVersion!: UserLibraryVersionResponseDto;

	@ApiProperty({ type: UserLibraryVariantResponseDto })
	gameVariant!: UserLibraryVariantResponseDto;

	@ApiPropertyOptional()
	customizationId?: string;

	@ApiPropertyOptional({ type: UserLibraryClassroomResponseDto })
	classroom?: UserLibraryClassroomResponseDto;

	@ApiPropertyOptional()
	classroomGameId?: string;

	@ApiProperty()
	startAt!: Date;

	@ApiProperty()
	endAt!: Date;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	isActive!: boolean;

	@ApiProperty({ enum: ['active', 'scheduled', 'expired'] })
	status!: 'active' | 'scheduled' | 'expired';

}

export class UserLibraryResponseDto {

	@ApiProperty({ type: [UserLibraryItemResponseDto] })
	itemList!: UserLibraryItemResponseDto[];

	static fromQueryResult(result: UserLibraryItem[]): UserLibraryResponseDto {
		const now = new Date();

		return {
			itemList: result.map(({ license }) => {
				const classroomGame = license.classroomGame;

				return {
					classroom: classroomGame ? {
						id: classroomGame.classroom.id!,
						name: classroomGame.classroom.name,
						slug: classroomGame.classroom.slug,
					} : undefined,
					classroomGameId: classroomGame?.id,
					customizationId: license.customization?.id,
					endAt: license.endAt,
					createdAt: license.createdAt!,
					game: {
						id: license.gameVariant.gameVersion.game.id!,
						slug: license.gameVariant.gameVersion.game.slug,
						title: license.gameVariant.gameVersion.game.title,
					},
					gameVersion: {
						id: license.gameVariant.gameVersion.id!,
						publisherVersion: license.gameVariant.gameVersion.publisherVersion,
						runUrl: license.gameVariant.gameVersion.runUrl,
					},
					gameVariant: {
						id: license.gameVariant.id!,
					},
					id: license.id!,
					isActive: license.isActive(),
					startAt: license.startAt,
					status: license.isActive(now) ? 'active' : license.startAt > now ? 'scheduled' : 'expired',
				};
			}),
		};
	}

}
