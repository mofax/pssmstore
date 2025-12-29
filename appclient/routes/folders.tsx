import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { Button, DataGrid, Dialog, TextInput } from "../components/ds";
import { randomHex } from "../../app-common/random";
import { useLiveQuery } from "@tanstack/react-db";
import { foldersCollection } from "../tn-collections/folders-collection";

export const Route = createFileRoute("/folders")({
	component: FoldersPage,
});

function FoldersPage() {
	const { data: folders } = useLiveQuery((q) => {
		return q.from({ folders: foldersCollection });
	});

	const navigate = useNavigate();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [folderName, setFolderName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleCreateFolder = async () => {
		if (!folderName.trim()) {
			setError("Folder name is required");
			return;
		}

		setError(null);
		startTransition(async () => {
			try {
				const newFolder = {
					id: randomHex(),
					name: folderName.trim(),
				};

				const tx = foldersCollection.insert(newFolder);
				await tx.isPersisted.promise;

				// Close dialog and reset form
				setIsDialogOpen(false);
				setFolderName("");
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to create folder",
				);
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
			header: "Created At",
			key: "created_at",
			render: (value: unknown) => formatDate(value as string),
		},
	];

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-foreground">Folders</h1>
				<Button onClick={() => setIsDialogOpen(true)}>Create new folder</Button>
			</div>

			<DataGrid
				columns={columns}
				data={folders}
				onRowClick={(folder) => {
					navigate({ to: "/pages", search: { folder_id: folder.id } });
				}}
			/>

			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				title="Create New Folder"
				description="Enter a name for the new folder"
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleCreateFolder();
					}}
					className="space-y-4"
				>
					<TextInput
						label="Folder Name"
						value={folderName}
						onChange={(e) => {
							setFolderName(e.target.value);
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
								setFolderName("");
								setError(null);
							}}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							Create Folder
						</Button>
					</div>
				</form>
			</Dialog>
		</div>
	);
}
