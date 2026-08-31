import { StaticFactory } from '../../factory/static.factory';
import { ValidationError } from './validation.error';

export class ValidationResult extends StaticFactory {

	errorList?: ValidationError[];

	errorMessage?: string;

	static createFromErrorList(errorList: ValidationResult['errorList']) {
		return ValidationResult.create({ errorList });
	}

	static createFromErrorMessage(errorMessage: ValidationResult['errorMessage']) {
		return ValidationResult.create({ errorMessage });
	}

	static createFromError(error: unknown) {
		return ValidationResult.create({ errorMessage: String(error) });
	}

}