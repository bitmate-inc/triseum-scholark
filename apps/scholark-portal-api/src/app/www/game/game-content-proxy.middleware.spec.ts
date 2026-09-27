import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import express from 'express';

import { GameLicense } from '../../core/feature/game/model/game.license.entity';
import { GameContentProxyMiddleware } from './game-content-proxy.middleware';
import { GameLaunchSessionService } from './game-launch-session.service';

const licenseId = '00000000-0000-4000-8000-000000000002';

describe(GameContentProxyMiddleware.name, () => {
	it('streams GET requests to the licensed upstream path without forwarding the game session cookie', async () => {
		let upstreamPath: string | undefined;
		let upstreamCookie: string | undefined;
		const upstreamServer = createServer((request, response) => {
			upstreamPath = request.url;
			upstreamCookie = request.headers.cookie;
			response.setHeader('content-type', 'application/javascript');
			response.end('globalThis.gameReady = true;');
		});
		await new Promise<void>((resolve) => upstreamServer.listen(0, '127.0.0.1', resolve));
		const upstreamPort = (upstreamServer.address() as AddressInfo).port;
		const runUrl = `http://127.0.0.1:${upstreamPort}/mecenas/2.0/`;
		const license = {
			gameVariant: { gameVersion: { runUrl } },
			id: licenseId,
		} as GameLicense;
		const gameLaunchSessionService = {
			authorizeGameSession: jest.fn().mockResolvedValue(license),
			gameSessionCookieName: 'scholark_game',
			getLicensedUpstream: jest.fn().mockReturnValue(new URL(runUrl)),
		} as unknown as GameLaunchSessionService;
		const middleware = new GameContentProxyMiddleware(gameLaunchSessionService);
		const app = express();
		app.use((request, response, next) => {
			void middleware.use(request, response, next);
		});
		const proxyServer = app.listen(0, '127.0.0.1');
		await new Promise<void>((resolve) => proxyServer.once('listening', resolve));
		const proxyPort = (proxyServer.address() as AddressInfo).port;

		try {
			const response = await fetch(`http://127.0.0.1:${proxyPort}/api/v1/game/content/${licenseId}/scripts/main.js`, {
				headers: { cookie: 'scholark_game=secret-session; game=value' },
			});

			expect(response.status).toBe(200);
			expect(await response.text()).toBe('globalThis.gameReady = true;');
			expect(upstreamPath).toBe('/mecenas/2.0/scripts/main.js');
			expect(upstreamCookie).toBe('game=value');
		} finally {
			await Promise.all([
				new Promise<void>((resolve, reject) => upstreamServer.close((error) => error ? reject(error) : resolve())),
				new Promise<void>((resolve, reject) => proxyServer.close((error) => error ? reject(error) : resolve())),
			]);
		}
	});
});