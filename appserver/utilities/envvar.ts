export function envar(key: string): string {
	const value = process.env[key];
	if (!value) throw new Error(`Environment variable ${key} is not set`);
	return value;
}

export function envarOptional(key: string, optionalValue: string) {
	const value = process.env[key];
	if (!value) return optionalValue;
	return value;
}
