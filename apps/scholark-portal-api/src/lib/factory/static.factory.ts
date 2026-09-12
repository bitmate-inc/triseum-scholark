import { ClassConstructor, plainToInstance } from 'class-transformer';

import { Constructor, PartialInstanceType } from '../mixin/type';

export abstract class StaticFactory {

	static create<
		Type extends typeof StaticFactory,
		Data extends PartialInstanceType<Type> = PartialInstanceType<Type>,
	>(this: Type, data: Data): InstanceType<Type> {
		return createShallowInstance(this, data);
	}

}

export abstract class DeepStaticFactory {

	static create<
		Type extends typeof StaticFactory,
		Data extends PartialInstanceType<Type> = PartialInstanceType<Type>,
	>(this: Type, data: Data): InstanceType<Type> {
		return createDeepInstance(this, data);
	}

}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withStaticFactory<Type extends Constructor<any>>(Base: Type, deep: boolean = false) {
	abstract class WithStaticFactory extends Base {

		static create<
			Class extends Constructor<object>,
			Data extends PartialInstanceType<Class> = PartialInstanceType<Class>,
		>(this: Class, data: Data): InstanceType<Class> {
			if (deep){
				return createDeepInstance(this, data);
			}

			return createShallowInstance(this, data);
		}
	
	}

	return WithStaticFactory;
}

export function createShallowInstance<
	Type extends Constructor<object>,
	Data extends PartialInstanceType<Type> = PartialInstanceType<Type>,
>(Class: Type, data: Data): InstanceType<Type> {
	let instance: InstanceType<Type>;

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		instance = new (Class as any)();
	} catch (error) {
		throw new Error(
			`Failed to instantiate ${Class.name} with createInstance(): ` +
			`the class must be constructable without arguments. ` +
			`Constructor parameters are not supported.`,
			{ cause: error },
		);
	}

	return Object.assign(instance, data);
}

export function createDeepInstance<
	Type extends Constructor<object>,
	Data extends PartialInstanceType<Type> = PartialInstanceType<Type>,
>(Class: Type, data: Data): InstanceType<Type> {
	return plainToInstance(
		Class as unknown as ClassConstructor<InstanceType<Type>>,
		data,
		{ 
			exposeDefaultValues: true, 
			enableCircularCheck: true, 
			enableImplicitConversion: true
		},
	);
}
