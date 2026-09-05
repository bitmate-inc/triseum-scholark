import { Type } from 'class-transformer';
import {
	IsArray,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

import { StaticFactory } from '../../../../lib/factory/static.factory';

export class AuthJwtConfig extends StaticFactory {

	@IsString()
	@IsNotEmpty()
	secret!: string;

	@IsOptional()
	@IsString()
	accessTokenExpiresIn?: string;

	@IsOptional()
	@IsString()
	refreshTokenExpiresIn?: string;

}

export class AuthGoogleConfig extends StaticFactory {

	@IsOptional() @IsString() clientId?: string;
	@IsOptional() @IsString() clientSecret?: string;
	@IsOptional() @IsString() callbackUrl?: string;
	@IsOptional() @IsArray() @IsString({ each: true }) scope?: string[];

}

export class AuthMicrosoftConfig extends StaticFactory {

	@IsOptional() @IsString() clientId?: string;
	@IsOptional() @IsString() clientSecret?: string;
	@IsOptional() @IsString() callbackUrl?: string;
	@IsOptional() @IsString() tenantId?: string;
	@IsOptional() @IsString() authorizationUrl?: string;
	@IsOptional() @IsString() tokenUrl?: string;
	@IsOptional() @IsString() userInfoUrl?: string;
	@IsOptional() @IsArray() @IsString({ each: true }) scope?: string[];

}

export class AuthModuleConfig extends StaticFactory {

	@IsObject()
	@ValidateNested()
	@Type(() => AuthJwtConfig)
	jwt!: AuthJwtConfig;

	@IsOptional() @IsObject() @ValidateNested() @Type(() => AuthGoogleConfig)
	google?: AuthGoogleConfig;

	@IsOptional() @IsObject() @ValidateNested() @Type(() => AuthMicrosoftConfig)
	microsoft?: AuthMicrosoftConfig;

}