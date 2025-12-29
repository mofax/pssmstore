import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { Button, DataGrid, Dialog, TextInput } from "../components/ds";
import { randomHex } from "../../app-common/random";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { pagesCollection } from "../tn-collections/pages-collection";
import { foldersCollection } from "../tn-collections/folders-collection";

type PagesSearch = {
	folder_id?: string;
};

export const Route = createFileRoute("/pages")({
	component: PagesPage,
	validateSearch: (search: Record<string, unknown>): PagesSearch => {
		return {
			folder_id: typeof search.folder_id === "string"
				? search.folder_id
				: undefined,
		};
	},
});

function PagesPage() {
	const { folder_id } = useSearch({ from: "/pages" });
	const navigate = useNavigate();

	const { data: folder } = useLiveQuery((q) => {
		if (!folder_id) return null;
		return q
			.from({
				folders: foldersCollection,
			})
			.where(({ folders }) => eq(folders.id, folder_id))
			.orderBy(({ folders }) => folders.id, "desc")
			.findOne();
	});

	const { data: pages } = useLiveQuery((q) => {
		return q
			.from({
				pages: pagesCollection,
			})
			.where(({ pages }) => eq(pages.folder_id, folder_id))
			.orderBy(({ pages }) => pages.created_at, "desc");
	});
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [pageName, setPageName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleCreatePage = async () => {
		if (!pageName.trim()) {
			setError("Page name is required");
			return;
		}

		if (!folder_id) {
			setError("Folder ID is required");
			return;
		}

		setError(null);
		startTransition(async () => {
			try {
				const newPage = {
					id: randomHex(),
					name: pageName.trim(),
					folder_id: folder_id,
				};

				const tx = pagesCollection.insert(newPage);
				await tx.isPersisted.promise;

				// Close dialog and reset form
				setIsDialogOpen(false);
				setPageName("");
				setError(null);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to create page");
			}
		});
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const columns = [
		{
			header: "Name",
			key: "name",
		},
		{
			header: "Folder ID",
			key: "folder_id",
			render: (value: unknown) => value as string,
		},
		{
			header: "Created At",
			key: "created_at",
			render: (value: unknown) => formatDate(value as string),
		},
	];

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-foreground">{folder?.name}</h1>
				</div>
				<Button onClick={() => setIsDialogOpen(true)}>Create Page</Button>
			</div>

			<DataGrid
				columns={columns}
				data={pages ?? []}
				onRowClick={(page) => {
					navigate({ to: "/secrets", search: { page_id: page.id } });
				}}
			/>

			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				title="Create New Page"
				description="Enter a name for the new page"
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleCreatePage();
					}}
					className="space-y-4"
				>
					<TextInput
						label="Page Name"
						value={pageName}
						onChange={(e) => {
							setPageName(e.target.value);
							setError(null);
						}}
						error={error || undefined}
						required
						autoFocus
					/>

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsDialogOpen(false);
								setPageName("");
								setError(null);
							}}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							Create Page
						</Button>
					</div>
				</form>
			</Dialog>
		</div>
	);
}
