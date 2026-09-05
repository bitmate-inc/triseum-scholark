// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<Type> = abstract new (...args: any[]) => Type;

export type PartialInstanceType<
	Type extends Constructor<unknown>,
> = Partial<InstanceType<Type>>;