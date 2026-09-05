import { StaticFactory } from '../../../../../lib/factory/static.factory';
import type { AuthUser } from './auth.user.model';

export class AuthSessionData extends StaticFactory {

	user!: AuthUser;

}