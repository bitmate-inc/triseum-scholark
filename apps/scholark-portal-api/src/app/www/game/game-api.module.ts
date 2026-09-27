import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';

import { GamePlayEvent } from '../../core/feature/game/model/game.play.event.entity';
import { GameState } from '../../core/feature/game/model/game.state.entity';
import { GameApiController } from './game-api.controller';
import { GameContentProxyMiddleware } from './game-content-proxy.middleware';
import { GameInteractionService } from './game-interaction.service';
import { GameLaunchSessionService } from './game-launch-session.service';

@Module({
	controllers: [GameApiController],
	imports: [MikroOrmModule.forFeature([GamePlayEvent, GameState])],
	providers: [GameContentProxyMiddleware, GameInteractionService, GameLaunchSessionService],
})
export class GameApiModule implements NestModule {

	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(GameContentProxyMiddleware).forRoutes({
			method: RequestMethod.ALL,
			path: 'api/v1/game/content/{*path}',
		});
	}

}