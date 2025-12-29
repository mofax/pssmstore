import { type } from "arktype";

export const accessCredentials = {
	table: "access_credentials",
	schema: {
		id: type("number.integer"),
		username: type("string"),
		email: type("string.email"),
		passwordHash: type("string"),
	},
};
