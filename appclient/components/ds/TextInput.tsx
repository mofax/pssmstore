import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useId } from "react";

export interface TextInputProps extends ComponentPropsWithoutRef<"input"> {
	label: string;
	error?: string;
	helperText?: string;
	required?: boolean;
	leadingIcon?: ReactNode;
	trailingIcon?: ReactNode;
	ref?: React.Ref<HTMLInputElement>;
}

export function TextInput({
	label,
	error,
	helperText,
	required = false,
	leadingIcon,
	trailingIcon,
	className = "",
	ref,
	id,
	...props
}: TextInputProps) {
	const generatedId = useId();
	const inputId = id || generatedId;
	const errorId = `${inputId}-error`;
	const helperId = `${inputId}-helper`;
	const labelId = `${inputId}-label`;

	const hasError = !!error;
	const hasHelperText = !!helperText;
	const hasIcons = !!leadingIcon || !!trailingIcon;

	const baseStyles =
		"w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const stateStyles = hasError
		? "border-destructive focus:border-destructive focus:ring-destructive text-destructive"
		: "border-input bg-background/50 focus:border-ring focus:ring-ring hover:border-ring/50";

	const iconPadding = hasIcons
		? leadingIcon && trailingIcon
			? "pl-10 pr-10"
			: leadingIcon
			? "pl-10 pr-4"
			: "pl-4 pr-10"
		: "px-4";

	const inputStyles =
		`${baseStyles} ${stateStyles} ${iconPadding} py-2 ${className}`.trim();

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
				htmlFor={inputId}
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
				{leadingIcon && (
					<div
						className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground/50"
						aria-hidden="true"
					>
						{leadingIcon}
					</div>
				)}

				<input
					ref={ref}
					id={inputId}
					className={inputStyles}
					aria-label={label}
					aria-labelledby={labelId}
					aria-describedby={describedBy || undefined}
					aria-invalid={hasError}
					aria-required={required}
					required={required}
					{...props}
				/>

				{trailingIcon && (
					<div
						className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-foreground/50"
						aria-hidden="true"
					>
						{trailingIcon}
					</div>
				)}
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
