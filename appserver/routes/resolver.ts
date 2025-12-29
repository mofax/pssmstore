import { prisma } from "../../prisma/prisma-client";

export const ResolverRoutes = {
	"/api/resolve/:folder_id/:page_id": {
		GET: async (
			req: Request & { params: { folder_id: string; page_id: string } },
		): Promise<Response> => {
			try {
				const { folder_id, page_id } = req.params;

				// Validate that the page exists and belongs to the folder
				const page = await prisma.pages.findFirst({
					where: {
						id: page_id,
						folder_id: folder_id,
					},
				});

				if (!page) {
					return Response.json(
						{ error: "Page not found or does not belong to folder" },
						{ status: 404 },
					);
				}

				// Query all secrets for the page
				const secrets = await prisma.secrets.findMany({
					where: {
						page_id: page_id,
					},
					orderBy: {
						created_at: "asc",
					},
				});

				return Response.json(secrets);
			} catch (err) {
				console.error(err);
				return Response.json(
					{ error: "Internal Server Error" },
					{ status: 500 },
				);
			}
		},
	},
};
