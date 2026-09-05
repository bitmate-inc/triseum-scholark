import { bootstrap } from './app/server';

bootstrap().catch((err) => {
	console.error(err);
	process.exit(1);
});
