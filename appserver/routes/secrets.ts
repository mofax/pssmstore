import { prisma } from "../../prisma/prisma-client";
import qs from "qs";

type Filter = {
	field: string[];
	operator: string;
	value: unknown;
};

type Sort = {
	field: string[];
	direction?: "asc" | "desc";
};

type QueryOptions = {
	filters?: Filter[];
	sorts?: Sort[];
};

export const SecretsRoutes = {
	"/api/secrets": {
		GET: async (req: Request): Promise<Response> => {
			try {
				const url = new URL(req.url);
				const queryString = url.search.substring(1);
				const parsed = qs.parse(queryString) as QueryOptions;

				const filters = parsed.filters || [];
				// const sorts = parsed.sorts || [];

				// Validate page_id requirement
				const pageIdFilter = filters.find(
					(f) =>
						f.field?.length === 1 && f.field[0] === "page_id" &&
						f.operator === "eq",
				);

				if (!pageIdFilter || !pageIdFilter.value) {
					return Response.json([]);
				}

				// Build Prisma where clause from filters
				const where: Record<string, unknown> = {};
				for (const filter of filters) {
					if (filter.field?.length === 1) {
						const fieldName = filter.field[0];
						if (filter.operator === "eq") {
							if (fieldName) where[fieldName] = filter.value;
						}
						// Add more operators as needed
					}
				}

				// Build Prisma orderBy clause from sorts
				let orderBy: Record<string, "asc" | "desc"> = {
					created_at: "asc", // default
				};

				// if (sorts.length > 0) {
				//     const sort = sorts[0]; // Use first sort for now
				//     if (sort.field?.length === 1) {
				//         orderBy = {
				//             [sort.field[0]]: sort.direction || "asc",
				//         };
				//     }
				// }

				const secrets = await prisma.secrets.findMany({
					where,
					orderBy,
				});
				return Response.json(secrets);
			} catch (err) {
				console.error(err);
				return Response.json(
					{ error: "Internal Server Error" },
					{
						status: 500,
					},
				);
			}
		},
		POST: async (req: Request): Promise<Response> => {
			try {
				const body = await req.json();
				const created = await prisma.secrets.create({ data: body as any });
				return Response.json(created);
			} catch (err) {
				console.error(err);
				return Response.json(
					{ error: "Internal Server Error" },
					{
						status: 500,
					},
				);
			}
		},
	},
};
