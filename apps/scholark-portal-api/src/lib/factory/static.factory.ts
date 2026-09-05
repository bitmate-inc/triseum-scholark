import { ClassConstructor, plainToInstance } from 'class-transformer';

import { Constructor, PartialInstanceType } from '../mixin/type';

export abstract class StaticFactory {

	static create<
		Type extends typeof StaticFactory,
		Data extends PartialInstanceType<Type> = PartialInstanceType<Type>,
	>(this: Type, data: Data): InstanceType<Type> {
		return createInstance(this, data);
	}

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withStaticFactory<Type extends Constructor<any>>(Base: Type) {
	abstract class WithStaticFactory extends Base {

		static create<
			Class extends Constructor<object>,
			Data extends PartialInstanceType<Class> = PartialInstanceType<Class>,
		>(this: Class, data: Data): InstanceType<Class> {
			return createInstance(this, data);
		}
	
	}

	return WithStaticFactory;
}

export function createInstance<
	Type extends Constructor<object>,
	Data extends PartialInstanceType<Type> = PartialInstanceType<Type>,
>(Class: Type, data: Data): InstanceType<Type> {
	return plainToInstance(
		Class as unknown as ClassConstructor<InstanceType<Type>>,
		data,
		{ exposeDefaultValues: true },
	);
}
