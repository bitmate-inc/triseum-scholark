import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { TaxonomyTerm } from './model/taxonomy.term.entity';

@Global()
@Module({
	exports: [MikroOrmModule],
	imports: [MikroOrmModule.forFeature([TaxonomyTerm])],
})
export class TaxonomyModule {}