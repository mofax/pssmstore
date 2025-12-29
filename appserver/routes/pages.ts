import { prisma } from "../../prisma/prisma-client";
import qs from "qs";

export const PagesRoutes = {
	"/api/pages": {
		GET: async (req: Request): Promise<Response> => {
			try {
				const url = new URL(req.url);
				const queryString = url.search.substring(1);
				const parsed = qs.parse(queryString) as QueryOptions;
				type FindManyArg = Parameters<typeof prisma.pages.findMany>[0];
				const findManyArg = {
					where: {} as POJO,
					orderBy: {},
				};
				parsed.filters?.forEach((filter) => {
					const field = filter.field;
					const op = filter.operator;
					const value = filter.value;
					switch (op) {
						case "eq": {
							findManyArg.where[field[0]!] = {
								equals: value,
							};
							break;
						}
						default:
							// no-op
					}
				});

				// Build Prisma orderBy clause from sorts
				let orderBy: Record<string, "asc" | "desc"> = {
					created_at: "asc", // default
				};

				const pages = await prisma.pages.findMany({
					where: findManyArg.where,
					orderBy,
				});
				return Response.json(pages);
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
				const created = await prisma.pages.create({ data: body as any });
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
