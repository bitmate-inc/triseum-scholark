import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { User } from '../../core/feature/user/model/user.entity';

export interface AuthenticatedRequest extends Request {
	user: User;
}

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {

	constructor() {
		super();
	}

}