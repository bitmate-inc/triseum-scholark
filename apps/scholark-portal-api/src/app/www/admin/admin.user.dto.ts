import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { GetListRequestQueryParamsDto } from '../../../lib/http/request-query.dto';
import type { GetAdminUserListQueryData } from '../../core/feature/admin/query/get.admin.user.list.query';
import { User, UserStatus } from '../../core/feature/user/model/user.entity';

export class GetAdminUserListQueryDto extends GetListRequestQueryParamsDto {

	@ApiPropertyOptional({ enum: UserStatus, enumName: 'UserStatus' })
	@IsOptional()
	@IsEnum(UserStatus)
	status?: UserStatus;

	get adminFilterBy(): GetAdminUserListQueryData['filterBy'] {
		return { q: this.q, status: this.status };
	}

}

export class AdminUserListItemResponseDto {

	@ApiProperty({ format: 'uuid' })
	id!: string;

	@ApiProperty()
	email!: string;

	@ApiPropertyOptional()
	firstName?: string;

	@ApiPropertyOptional()
	lastName?: string;

	@ApiProperty({ enum: UserStatus, enumName: 'UserStatus' })
	status!: UserStatus;

	@ApiPropertyOptional({ format: 'date-time', type: String })
	createdAt?: Date;

	@ApiProperty()
	isAdmin!: boolean;

	static fromEntity(user: User, isAdmin: boolean): AdminUserListItemResponseDto {
		return {
			createdAt: user.createdAt,
			email: user.email,
			firstName: user.firstName,
			id: user.id!,
			isAdmin,
			lastName: user.lastName,
			status: user.status,
		};
	}

}

export class GetAdminUserListResponseDto {

	@ApiProperty({ type: [AdminUserListItemResponseDto] })
	userList!: AdminUserListItemResponseDto[];

	@ApiProperty({ minimum: 0 })
	totalItemCount!: number;

	static fromQueryResult(result: {
		adminUserIdSet: Set<string>;
		totalItemCount: number;
		userList: User[];
	}): GetAdminUserListResponseDto {
		return {
			totalItemCount: result.totalItemCount,
			userList: result.userList.map((user) => AdminUserListItemResponseDto.fromEntity(user, result.adminUserIdSet.has(user.id!))),
		};
	}

}