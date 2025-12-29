import { Link, useLocation, useSearch } from "@tanstack/react-router";
import { useLiveQuery } from "@tanstack/react-db";
import { foldersCollection } from "../../tn-collections/folders-collection";
import { pagesCollection } from "../../tn-collections/pages-collection";
import { eq } from "@tanstack/react-db";

interface BreadcrumbItem {
	label: string;
	href: string;
}

export function Breadcrumbs() {
	const location = useLocation();
	const pathname = location.pathname;

	// Handle /pages and /secrets routes
	let folder_id: string | undefined;
	let page_id: string | undefined;

	if (pathname === "/pages") {
		const search = useSearch({ from: "/pages" });
		folder_id = (search as any).folder_id;
	}

	if (pathname === "/secrets") {
		const search = useSearch({ from: "/secrets" });
		page_id = (search as any).page_id;
	}

	// Fetch folder name if on pages route
	const { data: folder } = useLiveQuery((q) => {
		if (!folder_id) return null;
		return q
			.from({ folders: foldersCollection })
			.where(({ folders }) => eq(folders.id, folder_id))
			.findOne();
	}, [folder_id]);

	// Fetch page name if on secrets route
	const { data: page } = useLiveQuery((q) => {
		if (!page_id) return null;
		return q
			.from({ pages: pagesCollection })
			.where(({ pages }) => eq(pages.id, page_id))
			.findOne();
	}, [page_id]);

	// Fetch folder when on secrets route using page.folder_id
	const { data: secretPageFolder } = useLiveQuery((q) => {
		if (!page?.folder_id) return null;
		return q
			.from({ folders: foldersCollection })
			.where(({ folders }) => eq(folders.id, page.folder_id))
			.findOne();
	}, [page?.folder_id]);

	const getBreadcrumbs = (): BreadcrumbItem[] => {
		const crumbs: BreadcrumbItem[] = [{ label: "Folders", href: "/folders" }];

		if (pathname === "/pages" && folder) {
			crumbs.push({
				label: folder.name,
				href: `/pages?folder_id=${folder.id}`,
			});
		}

		if (pathname === "/secrets" && page && secretPageFolder) {
			crumbs.push({
				label: secretPageFolder.name,
				href: `/pages?folder_id=${secretPageFolder.id}`,
			});
			crumbs.push({
				label: page.name,
				href: `/secrets?page_id=${page.id}`,
			});
		}

		return crumbs;
	};

	const breadcrumbs = getBreadcrumbs();

	if (pathname === "/folders" || breadcrumbs.length <= 1) {
		return null;
	}

	return (
		<nav className="px-8 py-4 bg-background/50 border-b border-border/50">
			<div className="flex items-center gap-2 text-sm">
				{breadcrumbs.map((crumb, index) => (
					<div key={crumb.href} className="flex items-center gap-2">
						{index > 0 && (
							<span className="text-secondary-foreground/50">/</span>
						)}
						<Link
							to={crumb.href}
							className={`transition-colors duration-200 ${
								index === breadcrumbs.length - 1
									? "text-foreground font-medium"
									: "text-secondary-foreground hover:text-foreground"
							}`}
						>
							{crumb.label}
						</Link>
					</div>
				))}
			</div>
		</nav>
	);
}
