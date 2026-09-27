import { Injectable, NestMiddleware } from '@nestjs/common';
import type {
	NextFunction,
	Request,
	Response
} from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { GameLicense } from '../../core/feature/game/model/game.license.entity';
import { GameLaunchSessionService } from './game-launch-session.service';

type GameProxyRequest = Request & {
	gameProxyLicense?: GameLicense;
	gameProxyUpstreamRequestUrl?: string;
};

@Injectable()
export class GameContentProxyMiddleware implements NestMiddleware {

	private readonly proxyMiddleware = createProxyMiddleware<GameProxyRequest, Response>({
		changeOrigin: true,
		pathRewrite: (path, request) => rewriteProxyPath(path, request),
		router: (request) => {
			const license = request.gameProxyLicense;
			if (!license) {
				throw new Error('Game license was not authorized');
			}

			return this.gameLaunchSessionService.getLicensedUpstream(license).origin;
		},
		on: {
			error: (_error, _request, response) => {
				const expressResponse = response as Response;
				if (!expressResponse.headersSent) {
					expressResponse.status(502).send('Game upstream is unavailable');
				}
			},
			proxyReq: (proxyRequest, request) => {
				const upstream = this.gameLaunchSessionService.getLicensedUpstream(request.gameProxyLicense!);
				proxyRequest.removeHeader('authorization');
				proxyRequest.setHeader('origin', upstream.origin);
				proxyRequest.setHeader('referer', `${upstream.origin}/`);
				const upstreamCookie = removeCookie(request.headers.cookie, this.cookieName);
				if (upstreamCookie) {
					proxyRequest.setHeader('cookie', upstreamCookie);
				} else {
					proxyRequest.removeHeader('cookie');
				}
			},
			proxyRes: (proxyResponse, request) => {
				const license = request.gameProxyLicense!;
				const upstream = this.gameLaunchSessionService.getLicensedUpstream(license);
				const location = proxyResponse.headers.location;
				if (location) {
					const redirectUrl = new URL(location.toString(), request.gameProxyUpstreamRequestUrl);
					if (redirectUrl.origin !== upstream.origin) {
						proxyResponse.statusCode = 502;
						delete proxyResponse.headers.location;
					} else {
						proxyResponse.headers.location = rewriteRedirectUrl(redirectUrl, upstream, license.id!);
					}
				}

				const setCookieHeader = proxyResponse.headers['set-cookie'];
				if (setCookieHeader) {
					proxyResponse.headers['set-cookie'] = rewriteSetCookieHeader(
						setCookieHeader,
						this.cookieName,
						`/api/v1/game/content/${license.id}/`,
					);
				}
			},
		},
	});

	constructor(private readonly gameLaunchSessionService: GameLaunchSessionService) {}

	private get cookieName(): string {
		return this.gameLaunchSessionService.gameSessionCookieName;
	}

	async use(request: Request, response: Response, next: NextFunction): Promise<void> {
		try {
			if (request.method !== 'GET' && request.method !== 'HEAD') {
				response.sendStatus(405);
				return;
			}

			const license = await this.gameLaunchSessionService.authorizeGameSession(request.headers.cookie);
			const requestedLicenseId = request.originalUrl.match(/^\/api\/v1\/game\/content\/([^/?#]+)/)?.[1];
			if (!requestedLicenseId || requestedLicenseId !== license.id) {
				response.sendStatus(404);
				return;
			}

			const upstream = this.gameLaunchSessionService.getLicensedUpstream(license);
			const proxyRequest = request as GameProxyRequest;
			proxyRequest.gameProxyLicense = license;
			proxyRequest.gameProxyUpstreamRequestUrl = new URL(rewriteProxyPath(request.originalUrl, proxyRequest), upstream.origin).toString();
			this.proxyMiddleware(request, response, next);
		} catch (error) {
			response.sendStatus(error instanceof Error && error.name === 'UnauthorizedException' ? 401 : 502);
		}
	}

}

function rewriteProxyPath(path: string, request: GameProxyRequest): string {
	const license = request.gameProxyLicense;
	if (!license) {
		throw new Error('Game license was not authorized');
	}

	const requestUrl = new URL(path, 'http://proxy.invalid');
	const prefix = `/api/v1/game/content/${license.id}`;
	if (!requestUrl.pathname.startsWith(`${prefix}/`) && requestUrl.pathname !== prefix) {
		throw new Error('Game content path does not match its license');
	}

	const upstream = new URL(license.gameVariant.gameVersion.runUrl);
	const basePath = upstream.pathname.endsWith('/') ? upstream.pathname : `${upstream.pathname}/`;
	const suffix = requestUrl.pathname.slice(prefix.length).replace(/^\/+/, '');
	return `${basePath}${suffix}${requestUrl.search}`;
}

function rewriteRedirectUrl(redirectUrl: URL, upstream: URL, licenseId: string): string {
	const basePath = upstream.pathname.endsWith('/') ? upstream.pathname : `${upstream.pathname}/`;
	const suffix = redirectUrl.pathname.startsWith(basePath)
		? redirectUrl.pathname.slice(basePath.length)
		: redirectUrl.pathname.replace(/^\/+/, '');
	return `/api/v1/game/content/${licenseId}/${suffix}${redirectUrl.search}`;
}

function removeCookie(cookieHeader: string | undefined, cookieName: string): string | undefined {
	const filteredCookieList = cookieHeader?.split(';').map((cookie) => cookie.trim()).filter((cookie) => {
		const separatorIndex = cookie.indexOf('=');
		return separatorIndex >= 0 && cookie.slice(0, separatorIndex).trim() !== cookieName;
	});
	return filteredCookieList?.length ? filteredCookieList.join('; ') : undefined;
}

function rewriteSetCookieHeader(header: string | string[], proxyCookieName: string, path: string): string[] {
	const headerList = Array.isArray(header) ? header : [header];
	return headerList
		.filter((cookie) => cookie.slice(0, cookie.indexOf('=')).trim() !== proxyCookieName)
		.map((cookie) => {
			const withoutDomain = cookie.replace(/;\s*Domain=[^;]*/ig, '');
			const withoutPath = withoutDomain.replace(/;\s*Path=[^;]*/ig, '');
			return `${withoutPath}; Path=${path}`;
		});
}