import {
	Embeddable,
	Enum,
	Property
} from '@mikro-orm/decorators/legacy';

import { StaticFactory } from '../../../../../lib/factory/static.factory';
import { Currency } from './currency';

@Embeddable()
export class Money extends StaticFactory {

	@Property({ type: 'integer' })
	minorUnitAmount!: number;

	@Enum(() => Currency)
	currency!: Currency;

}