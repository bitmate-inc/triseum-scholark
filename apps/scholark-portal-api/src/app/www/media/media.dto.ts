import { ApiProperty } from '@nestjs/swagger';

import type { Media } from '../../core/feature/media/model/media';

export class MediaResponseDto implements Media {

	@ApiProperty({ enum: ['image', 'video'] })
	type!: 'image' | 'video';

	@ApiProperty()
	src!: string;

	@ApiProperty()
	alt!: string;

}