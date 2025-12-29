export class APIError extends Error {
	errors: string[];
	status: number;
	constructor(message: string, errors: string[], status = 400) {
		super(message);
		this.errors = errors;
		this.status = status;
	}
	toJSON() {
		return {
			message: this.message,
			errors: this.errors,
			status: this.status,
		};
	}
}
