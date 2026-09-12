import { isNullOrUndefined } from '../typescript/type-guard';

export const randomize = (array: unknown[]) => array[Math.floor(Math.random() * array.length)];

export const randomInRange = (from: number, to: number, step?: number) => {
	const isWithStep = !isNullOrUndefined(step);

	if (from > to) {
		throw new Error('"from" must be less than or equal to "to"');
	}
	if(isWithStep && step <= 0){
		throw new Error('"step" must be a positive number');
	}

	if(!isWithStep){
		return Math.floor(Math.random() * (to - from + 1)) + from;
	}

	const count = Math.floor((to - from) / step);
	return from + Math.floor(Math.random() * (count + 1)) * step;
}