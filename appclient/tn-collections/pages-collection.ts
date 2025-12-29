import { createCollection, parseLoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { tnQueryClient } from "./query-client";
import { type } from "arktype";
import qs from "qs";

const pageSchema = type({
	id: "string",
	name: "string",
	folder_id: "string",
	created_at: "string.date?",
	updated_at: "string.date?",
});

export const pagesCollection = createCollection(
	queryCollectionOptions({
		queryKey: ["pages"],
		syncMode: "on-demand",
		schema: pageSchema,
		queryFn: async (ctx) => {
			const options = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
			const queryString = qs.stringify(options);
			const url = `/api/pages?${queryString}`;
			const response = await fetch(url);
			return response.json();
		},
		queryClient: tnQueryClient,
		getKey: (item: { id: string }) => item.id,
		onInsert: async (ctx) => {
			const transaction = ctx.transaction;
			const mutations = transaction.mutations.map(async (mutation) => {
				const response = await fetch("/api/pages", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(mutation.modified),
				});
				if (!response.ok) {
					throw new Error("Failed to create page");
				}
			});
			await Promise.all(mutations);
		},
	}),
);
