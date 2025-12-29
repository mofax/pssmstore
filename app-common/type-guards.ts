export function tryNumber(val: unknown): number {
	if (typeof val !== "number") {
		throw new Error(`Value - ${val} - is not a number`);
	}
	return val;
}

export function tryRecord<T extends Record<string, unknown>>(
	val: T | unknown,
): T {
	if (typeof val !== "object" || val === null) {
		throw new Error(`Value - ${val} - is not a record`);
	}
	return val as T;
}
