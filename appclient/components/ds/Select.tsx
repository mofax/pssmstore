import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useId } from "react";

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
	label: string;
	error?: string;
	helperText?: string;
	required?: boolean;
	ref?: React.Ref<HTMLSelectElement>;
}

export function Select({
	label,
	error,
	helperText,
	required = false,
	className = "",
	ref,
	id,
	children,
	...props
}: SelectProps) {
	const generatedId = useId();
	const selectId = id || generatedId;
	const errorId = `${selectId}-error`;
	const helperId = `${selectId}-helper`;
	const labelId = `${selectId}-label`;

	const hasError = !!error;
	const hasHelperText = !!helperText;

	const baseStyles =
		"w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-10";

	const stateStyles = hasError
		? "border-destructive focus:border-destructive focus:ring-destructive text-destructive"
		: "border-input bg-background/50 focus:border-ring focus:ring-ring hover:border-ring/50";

	const selectStyles = `${baseStyles} ${stateStyles} px-4 py-2 ${className}`
		.trim();

	const describedBy = [
		hasError ? errorId : null,
		hasHelperText ? helperId : null,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="w-full">
			<label
				id={labelId}
				htmlFor={selectId}
				className="block text-sm font-medium text-foreground/80 mb-1"
			>
				{label}
				{required && (
					<span className="text-destructive ml-1" aria-label="required">
						*
					</span>
				)}
			</label>

			<div className="relative">
				<select
					ref={ref}
					id={selectId}
					className={selectStyles}
					style={{
						backgroundImage:
							`url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
						backgroundPosition: "right 0.5rem center",
						backgroundSize: "1.5em 1.5em",
					}}
					aria-label={label}
					aria-labelledby={labelId}
					aria-describedby={describedBy || undefined}
					aria-invalid={hasError}
					aria-required={required}
					required={required}
					{...props}
				>
					{children}
				</select>
			</div>

			{hasError && (
				<p
					id={errorId}
					className="mt-1 text-sm text-destructive"
					role="alert"
					aria-live="polite"
				>
					{error}
				</p>
			)}

			{hasHelperText && !hasError && (
				<p id={helperId} className="mt-1 text-sm text-secondary-foreground/70">
					{helperText}
				</p>
			)}
		</div>
	);
}
