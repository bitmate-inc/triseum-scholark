import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type {
	CookieOptions,
	Request,
	Response
} from 'express';

import authConfig from '../../../../../config/auth';

@Injectable()
export class SessionCookieService {

	constructor(
		@Inject(authConfig.KEY)
		private readonly config: ConfigType<typeof authConfig>,
	) {}

	read(request: Request): string | undefined {
		const cookie = request.headers.cookie
			?.split(';')
			.map((value) => value.trim().split('='))
			.find(([name]) => name === this.config.cookie.name);

		return cookie?.[1] ? decodeURIComponent(cookie[1]) : undefined;
	}

	set(response: Response, value: string): void {
		response.cookie(this.config.cookie.name, value, {
			...this.options,
			maxAge: this.config.sessionTtlSeconds * 1000,
		});
	}

	clear(response: Response): void {
		response.clearCookie(this.config.cookie.name, this.options);
	}

	private get options(): CookieOptions {
		return {
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			secure: this.config.cookie.secure,
		};
	}

}