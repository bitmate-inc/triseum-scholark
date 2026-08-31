import { StaticFactory } from '../../factory/static.factory';

export class ValidationError extends StaticFactory {

	property!: string;

	constraints?: { [property: string]: string };

	children?: ValidationError[];

	contexts?: { [property: string]: unknown };

}