import type { ReactNode } from "react";

export interface DataGridColumn<T> {
	header: string;
	key: keyof T | string;
	render?: (value: unknown, row: T) => ReactNode;
	className?: string;
}

export interface DataGridProps<T> {
	columns: DataGridColumn<T>[];
	data: T[];
	className?: string;
	onRowClick?: (row: T) => void;
}

export function DataGrid<T extends Record<string, unknown>>({
	columns,
	data,
	className = "",
	onRowClick,
}: DataGridProps<T>) {
	const gridTemplateColumns = `repeat(${columns.length}, minmax(0, 1fr))`;

	return (
		<div
			className={`w-full overflow-x-auto ${className}`}
			role="table"
			aria-label="Data grid"
		>
			<div
				className="grid gap-4 border-b-2 border-border pb-2 mb-2"
				style={{ gridTemplateColumns }}
				role="row"
			>
				{columns.map((column) => (
					<div
						key={String(column.key)}
						className={`font-semibold text-sm text-foreground ${
							column.className || ""
						}`}
						role="columnheader"
					>
						{column.header}
					</div>
				))}
			</div>
			{data.length === 0
				? (
					<div className="text-center py-8 text-text-secondary">
						No data available
					</div>
				)
				: (
					<div className="space-y-2">
						{data.map((row, rowIndex) => (
							<div
								key={rowIndex}
								className={`grid gap-4 py-2 border-b border-border hover:bg-foreground/5 transition-colors ${
									onRowClick ? "cursor-pointer" : ""
								}`}
								style={{ gridTemplateColumns }}
								role="row"
								onClick={() => onRowClick?.(row)}
							>
								{columns.map((column) => {
									const value = row[column.key as keyof T];
									const content = column.render
										? column.render(value, row)
										: String(value ?? "");

									return (
										<div
											key={String(column.key)}
											className={`text-foreground ${column.className || ""}`}
											role="gridcell"
										>
											{content}
										</div>
									);
								})}
							</div>
						))}
					</div>
				)}
		</div>
	);
}
