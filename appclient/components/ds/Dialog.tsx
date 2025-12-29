import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

export interface DialogProps extends ComponentPropsWithoutRef<"div"> {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
	description?: string;
}

export function Dialog({
	open,
	onOpenChange,
	title,
	children,
	description,
	className = "",
	...props
}: DialogProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const baseId = useId();
	const titleId = `${baseId}-title`;
	const descriptionId = description ? `${baseId}-description` : undefined;

	// Focus trap and escape key handling
	useEffect(() => {
		if (!open) return;

		const dialog = dialogRef.current;
		if (!dialog) return;

		// Focus the dialog
		const focusableElements = dialog.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		const firstFocusable = focusableElements[0];
		if (firstFocusable) {
			firstFocusable.focus();
		}

		// Handle escape key
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onOpenChange(false);
			}
		};

		// Handle focus trap
		const handleTab = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			if (focusableElements.length === 0) {
				e.preventDefault();
				return;
			}

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement?.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		};

		document.addEventListener("keydown", handleEscape);
		document.addEventListener("keydown", handleTab);

		// Prevent body scroll
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.removeEventListener("keydown", handleTab);
			document.body.style.overflow = "";
		};
	}, [open, onOpenChange]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			role="presentation"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onOpenChange(false);
				}
			}}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				aria-hidden="true"
			/>

			{/* Dialog */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				className={`relative bg-background border-2 border-border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}
				{...props}
			>
				{/* Title */}
				<h2
					id={titleId}
					className="text-xl font-semibold text-foreground mb-2"
				>
					{title}
				</h2>

				{/* Description */}
				{description && (
					<p
						id={descriptionId}
						className="text-sm text-text-secondary mb-4"
					>
						{description}
					</p>
				)}

				{/* Content */}
				<div>{children}</div>
			</div>
		</div>
	);
}
