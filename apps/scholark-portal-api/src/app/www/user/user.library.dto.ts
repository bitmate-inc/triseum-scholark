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

	@ApiPropertyOptional()
	customizationId?: string;

	@ApiPropertyOptional({ type: UserLibraryClassroomResponseDto })
	classroom?: UserLibraryClassroomResponseDto;

	@ApiProperty()
	startAt!: Date;

	@ApiProperty()
	endAt!: Date;

	@ApiProperty()
	isActive!: boolean;

}

export class UserLibraryResponseDto {

	@ApiProperty({ type: [UserLibraryItemResponseDto] })
	itemList!: UserLibraryItemResponseDto[];

	static fromQueryResult(result: UserLibraryItem[]): UserLibraryResponseDto {
		return {
			itemList: result.flatMap(({ enrollmentList, license }) => {
				const enrollmentListOrStandalone = enrollmentList.length ? enrollmentList : [undefined];
				return enrollmentListOrStandalone.map((enrollment) => {
					const customizationId = license.customization?.id;

					return {
						classroom: enrollment ? {
							id: enrollment.classroomGame.classroom.id!,
							name: enrollment.classroomGame.classroom.name,
							slug: enrollment.classroomGame.classroom.slug,
						} : undefined,
						customizationId,
						endAt: license.endAt,
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
						id: enrollment ? `${license.id}:${enrollment.classroomGame.id}` : license.id!,
						isActive: license.startAt <= new Date() && license.endAt >= new Date(),
						startAt: license.startAt,
					};
				});
			}),
		};
	}

}
