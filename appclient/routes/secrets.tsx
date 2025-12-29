import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { Button, DataGrid, Dialog, Select, TextInput } from "../components/ds";
import { randomHex } from "../../app-common/random";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { secretsCollection } from "../tn-collections/secrets-collection";
import { pagesCollection } from "../tn-collections/pages-collection";

function RevealableValue({ value }: { value: string }) {
	const [isRevealed, setIsRevealed] = useState(false);

	return (
		<button
			type="button"
			onClick={() => setIsRevealed(!isRevealed)}
			className="px-2 py-1 rounded text-sm font-mono hover:bg-secondary/20 transition-colors"
		>
			{isRevealed ? value : "••••••••"}
		</button>
	);
}

type SecretsSearch = {
	page_id?: string;
};

export const Route = createFileRoute("/secrets")({
	component: SecretsPage,
	validateSearch: (search: Record<string, unknown>): SecretsSearch => {
		return {
			page_id: typeof search.page_id === "string" ? search.page_id : undefined,
		};
	},
});

function SecretsPage() {
	const { page_id } = useSearch({ from: "/secrets" });
	const navigate = useNavigate();

	// Query current page to get folder_id
	const { data: currentPage } = useLiveQuery((q) => {
		if (!page_id) return null;
		return q
			.from({
				pages: pagesCollection,
			})
			.where(({ pages }) => eq(pages.id, page_id))
			.orderBy(({ pages }) => pages.id, "desc")
			.findOne();
	}, [page_id]);

	// Query all pages from the same folder
	const { data: pages } = useLiveQuery((q) => {
		if (!currentPage?.folder_id) return null;
		return q
			.from({
				pages: pagesCollection,
			})
			.where(({ pages }) => eq(pages.folder_id, currentPage.folder_id))
			.orderBy(({ pages }) => pages.created_at, "desc");
	}, [currentPage?.folder_id]);

	const { data: secrets } = useLiveQuery((q) => {
		if (!currentPage) return null;
		return q
			.from({
				secrets: secretsCollection,
			})
			.where(({ secrets }) => eq(secrets.page_id, currentPage.id))
			.orderBy(({ secrets }) => secrets.created_at, "desc");
	}, [currentPage?.id]);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [secretKey, setSecretKey] = useState("");
	const [secretValue, setSecretValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleCreateSecret = async () => {
		if (!secretKey.trim()) {
			setError("Secret key is required");
			return;
		}

		if (!secretValue.trim()) {
			setError("Secret value is required");
			return;
		}

		if (!page_id) {
			setError("Page ID is required");
			return;
		}

		setError(null);
		startTransition(async () => {
			try {
				const newSecret = {
					id: randomHex(),
					key: secretKey.trim(),
					value: secretValue.trim(),
					page_id: page_id,
				};

				const tx = secretsCollection.insert(newSecret);
				await tx.isPersisted.promise;

				// Close dialog and reset form
				setIsDialogOpen(false);
				setSecretKey("");
				setSecretValue("");
				setError(null);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to create secret",
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
			header: "Key",
			key: "key",
		},
		{
			header: "Value",
			key: "value",
			render: (value: unknown) => <RevealableValue value={value as string} />,
		},
		{
			header: "Page ID",
			key: "page_id",
			render: (value: unknown) => value as string,
		},
		{
			header: "Created At",
			key: "created_at",
			render: (value: unknown) => formatDate(value as string),
		},
	];

	const handlePageChange = (newPageId: string) => {
		navigate({ to: "/secrets", search: { page_id: newPageId } });
	};

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="">
				<div className="flex items-center justify-center pb-4">
					<div className="w-64 ">
						{pages && (
							<Select
								label=""
								value={page_id || ""}
								onChange={(e) => handlePageChange(e.target.value)}
							>
								<option value="">Select a page</option>
								{pages.map((page) => (
									<option key={page.id} value={page.id}>
										{page.name}
									</option>
								))}
							</Select>
						)}
					</div>
					<div className="flex-1"></div>
					<div>
						<Button onClick={() => setIsDialogOpen(true)}>Create Secret</Button>
					</div>
				</div>
			</div>

			<DataGrid columns={columns} data={secrets ?? []} />

			<Dialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				title="Create New Secret"
				description="Enter a key and value for the new secret"
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleCreateSecret();
					}}
					className="space-y-4"
				>
					<TextInput
						label="Secret Key"
						value={secretKey}
						onChange={(e) => {
							setSecretKey(e.target.value);
							setError(null);
						}}
						error={error || undefined}
						required
						autoFocus
					/>

					<TextInput
						label="Secret Value"
						value={secretValue}
						onChange={(e) => {
							setSecretValue(e.target.value);
							setError(null);
						}}
						error={error || undefined}
						required
					/>

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setIsDialogOpen(false);
								setSecretKey("");
								setSecretValue("");
								setError(null);
							}}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" loading={isPending}>
							Create Secret
						</Button>
					</div>
				</form>
			</Dialog>
		</div>
	);
}
