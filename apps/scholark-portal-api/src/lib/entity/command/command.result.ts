import { createInstance } from '../../factory/static.factory';
import { PartialInstanceType } from '../../mixin/type';
import { ValidationResult } from '../../validator/model/validation.result';

export abstract class CommandResult {

	isNotFound?: boolean;

	validationResult?: ValidationResult;

	static success<Type extends typeof CommandResult>(
		this: Type,
		data?: Omit<InstanceType<Type>, keyof CommandResult>,
	): InstanceType<Type> {
		return createInstance(this, (data || {}) as PartialInstanceType<Type>);
	}

	static fail(
		data: { validationResult: ValidationResult } | { isNotFound: true },
	) {
		return createInstance(this, data);
	}

	isSuccess() {
		return !this.validationResult && !this.isNotFound;
	}

}