import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module } from '@nestjs/common';

import { TaxonomyTerm } from './model/taxonomy.term.entity';
import { TaxonomyTermRepository } from './repository/taxonomy.term.repository';

@Global()
@Module({
	exports: [MikroOrmModule, TaxonomyTermRepository],
	imports: [MikroOrmModule.forFeature([TaxonomyTerm])],
	providers: [TaxonomyTermRepository],
})
export class TaxonomyModule {}