import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
	DiskHealthIndicator,
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator,
	MikroOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {

	constructor(
		private readonly health: HealthCheckService,
		private readonly database: MikroOrmHealthIndicator,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
	) { }

	@Get('alive')
	@ApiOperation({ summary: 'Check whether the API process is alive' })
	alive(): void { }

	@Get('status')
	@HttpCode(HttpStatus.OK)
	@HealthCheck()
	@ApiOperation({ summary: 'Check API service health' })
	async check() {
		return await this.health.check([
			() => this.database.pingCheck('database', { timeout: 1500 }),
			() => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9, }),
			() => this.memory.checkHeap('memory', 150 * 1024 * 1024),
		]);
	}

}