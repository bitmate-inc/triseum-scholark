import { Injectable } from '@nestjs/common';
import type { ValidatorOptions } from 'class-validator';
import { validate, ValidationError as ClassValidatorValidationError } from 'class-validator';

import { ValidationError } from '../../../../../lib/validator/model/validation.error';
import { ValidationResult } from '../../../../../lib/validator/model/validation.result';

@Injectable()
export class Validator {

	private readonly validatorOptions: ValidatorOptions = {
		validationError: {
			target: false,
			value: false,
		},
		whitelist: true,
	};

	async validate(object: object, validatorOptions?: ValidatorOptions): Promise<ValidationResult | undefined> {
		validatorOptions = {
			...this.validatorOptions,
			...(validatorOptions || {}),
			validationError: {
				...this.validatorOptions.validationError,
				...(validatorOptions?.validationError || {}),
			},
		};

		const errorList = await validate(object, validatorOptions);

		if (errorList.length > 0) {
			return ValidationResult.createFromErrorList(errorList.map(mapValidationError));
		}
	}

	async validateIdList<Type extends { id?: string | number }>(idList: Array<string | number>, itemList: Type[]) {
		const invalidIdList = idList.filter(
			(id) => !itemList.find((item) => item.id === id),
		);

		if (invalidIdList.length > 0) {
			return ValidationResult.createFromErrorMessage(
				`Invalid ID(s) "${invalidIdList.join(', ')}"`,
			);
		}

		return undefined;
	}

}

function mapValidationError(error: ClassValidatorValidationError): ValidationError {
	return {
		children: error.children?.map(mapValidationError),
		constraints: error.constraints,
		contexts: error.contexts,
		property: error.property,
	};
}
