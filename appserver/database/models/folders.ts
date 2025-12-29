import { type } from "arktype";
import type { ModelInterface } from "./_type";

export const folders = {
	table: "folders",
	schema: {
		id: type("string.hex"),
		name: type("string"),
		createdByUserId: type("number.integer"),
	},
};

export const pages = {
	table: "pages",
	schema: {
		id: type("number.integer"),
		name: type("string"),
		folderId: type("number.integer"),
		content: type({
			key: type("string"),
			value: type("string"),
		}),
		createdByUserId: type("number.integer"),
	},
};
