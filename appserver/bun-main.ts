import { serve } from "bun";
import { FolderRoutes } from "./routes/folders";
import { PagesRoutes } from "./routes/pages";
import { SecretsRoutes } from "./routes/secrets";
import { ResolverRoutes } from "./routes/resolver";
import { AuthRoutes } from "./routes/auth";
import { envarOptional } from "./utilities/envvar";
import html from "../appclient/index.html";

async function main() {
	return serve({
		development: true,
		port: envarOptional("PORT", "8783"),
		routes: {
			"/hello": new Response("Hello, world!"),
			"/*": html,
			...AuthRoutes,
			...FolderRoutes,
			...PagesRoutes,
			...SecretsRoutes,
			...ResolverRoutes,
		},
	});
}

main().then((server) => {
	console.log(`Listening on http://localhost:${server.port}`);
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
