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

	@ApiProperty()
	language!: string;

	@ApiProperty()
	courseType!: string;

	@ApiPropertyOptional()
	customizationId?: string;

	@ApiPropertyOptional({ type: UserLibraryClassroomResponseDto })
	classroom?: UserLibraryClassroomResponseDto;

	@ApiPropertyOptional()
	classroomGameListingId?: string;

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

	@ApiProperty()
	acquisitionMechanism!: string;

}

export class UserLibraryResponseDto {

	@ApiProperty({ type: [UserLibraryItemResponseDto] })
	itemList!: UserLibraryItemResponseDto[];

	static fromQueryResult(result: UserLibraryItem[]): UserLibraryResponseDto {
		const now = new Date();

		return {
			itemList: result.map(({ license, acquisition }) => {
				const classroomGameListing = license.classroomGameListing;

				return {
					classroom: classroomGameListing ? {
						id: classroomGameListing.classroom.id!,
						name: classroomGameListing.classroom.name,
						slug: classroomGameListing.classroom.slug,
					} : undefined,
					classroomGameListingId: classroomGameListing?.id,
					customizationId: license.customization?.id,
					endAt: license.endAt,
					createdAt: license.createdAt!,
					game: {
						id: license.gameVersion.game.id!,
						slug: license.gameVersion.game.slug,
						title: license.gameVersion.game.title,
					},
					gameVersion: {
						id: license.gameVersion.id!,
						publisherVersion: license.gameVersion.publisherVersion,
						runUrl: license.gameVersion.runUrl,
					},
					id: license.id!,
					isActive: license.isActive(),
					language: license.language,
					courseType: license.courseType,
					startAt: license.startAt,
					status: license.isActive(now) ? 'active' : license.startAt > now ? 'scheduled' : 'expired',
					acquisitionMechanism: acquisition?.mechanism ?? 'unknown',
				};
			}),
		};
	}

}
