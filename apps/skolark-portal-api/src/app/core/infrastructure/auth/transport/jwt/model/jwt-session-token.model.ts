import { StaticFactory } from '../../../../../../../lib/factory/static.factory';

export class JwtSessionToken extends StaticFactory {

	accessToken!: string;
	refreshToken?: string;

}