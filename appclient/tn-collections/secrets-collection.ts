import { createCollection, parseLoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { tnQueryClient } from "./query-client";
import { type } from "arktype";
import qs from "qs";

const secretSchema = type({
	id: "string",
	page_id: "string",
	key: "string",
	value: "string",
	created_at: "string.date?",
	updated_at: "string.date?",
});

export const secretsCollection = createCollection(
	queryCollectionOptions({
		queryKey: ["secrets"],
		syncMode: "on-demand",
		schema: secretSchema,
		queryFn: async (ctx) => {
			const options = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);
			const queryString = qs.stringify(options);
			const url = `/api/secrets?${queryString}`;
			const response = await fetch(url);
			return response.json();
		},
		queryClient: tnQueryClient,
		getKey: (item: { id: string }) => item.id,
		onInsert: async (ctx) => {
			const transaction = ctx.transaction;
			const mutations = transaction.mutations.map(async (mutation) => {
				const response = await fetch("/api/secrets", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(mutation.modified),
				});
				if (!response.ok) {
					throw new Error("Failed to create secret");
				}
			});
			await Promise.all(mutations);
		},
	}),
);
