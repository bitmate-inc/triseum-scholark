import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsDate,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

import { GetListFilterByDto, PaginationDto } from '../entity/query/query.dto';
import { isNullOrUndefined } from '../typescript/type-guard';
import { trimAndNullEmptyString } from '../util/string';

export class GetListRequestQueryParamsDto {

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	limit?: number;

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	offset?: number;

	@IsOptional()
	@IsString()
	q?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => transformArrayParamValue(value))
	id?: string[];

	get pagination(): PaginationDto | undefined {
		if (!this.limit && !this.offset) {
			return undefined;
		}

		return PaginationDto.create({
			limit: this.limit,
			offset: this.offset,
		});
	}

	get filterBy(): GetListFilterByDto {
		return GetListFilterByDto.create({
			id: this.id,
			q: this.q,
		});
	}

}

export class DateTimeRangeDto {

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	gte?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	gt?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	lte?: Date;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	lt?: Date;

	static createApiPropertyType(): typeof DateTimeRangeDto {
		class ApiDateTimeRangeDto extends DateTimeRangeDto {

			@IsOptional()
			@IsDate()
			@Type(() => Date)
			declare gte?: Date;

			@IsOptional()
			@IsDate()
			@Type(() => Date)
			declare gt?: Date;

			@IsOptional()
			@IsDate()
			@Type(() => Date)
			declare lte?: Date;

			@IsOptional()
			@IsDate()
			@Type(() => Date)
			declare lt?: Date;

		}

		return ApiDateTimeRangeDto;
	}

}

export function transformArrayParamValue(
	value: string | unknown,
): string[] | undefined | unknown {
	if (isNullOrUndefined(trimAndNullEmptyString(value as string))) {
		return undefined;
	}

	return typeof value === 'string'
		? value.split(',').map((item) => item.trim()).filter((item) => item.length > 0)
		: value;
}
