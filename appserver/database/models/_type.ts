import type { Type } from "arktype";

export type ModelInterface<
	Schema extends {
		[key: string]: Type;
	},
> = {
	table: string;
	schema: Schema;
};
