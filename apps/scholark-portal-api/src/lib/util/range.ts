export const createRange = (start: number, end: number, step = 1): number[] => {
	const values = [];

	for (let i = start; i <= end; i += step) {
		values.push(i);
	}

	return values;
};
