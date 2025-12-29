import qs from "qs";
import { prisma } from "../../prisma/prisma-client";

export const FolderRoutes = {
	"/api/folders": {
		POST: async (req: Request): Promise<Response> => {
			try {
				const body = await req.json();
				const created = await prisma.folders.create({ data: body as any });
				return Response.json(created);
			} catch (err) {
				console.error(err);
				return Response.json({ error: "Internal Server Error" }, {
					status: 500,
				});
			}
		},
		GET: async (req: Request): Promise<Response> => {
			try {
				const url = new URL(req.url);
				const queryString = url.search.substring(1);
				const parsed = qs.parse(queryString) as QueryOptions;
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
				const folders = await prisma.folders.findMany({
					where: findManyArg.where,
				});
				return Response.json(folders);
			} catch (err) {
				console.error(err);
				return Response.json({ error: "Internal Server Error" }, {
					status: 500,
				});
			}
		},
	},
};
