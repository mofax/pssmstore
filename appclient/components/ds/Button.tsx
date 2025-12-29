import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../utilities/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	ref?: React.Ref<HTMLButtonElement>;
}

const variantStyles: Record<ButtonVariant, string> = {
	primary: "bg-primary text-white hover:opacity-90 active:opacity-80",
	secondary: "bg-secondary text-foreground hover:opacity-90 active:opacity-80",
	accent: "bg-accent text-text-background hover:opacity-90 active:opacity-80",
	outline:
		"border-2 border-border text-black bg-background text-foreground hover:bg-black/10 active:opacity-80",
	ghost:
		"bg-transparent text-foreground text-black hover:bg-foreground/10 active:opacity-80",
};

const sizeStyles: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-lg",
};

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	disabled,
	className = "",
	children,
	ref,
	"aria-label": ariaLabel,
	...props
}: ButtonProps) {
	const isDisabled = disabled || loading;

	const baseStyles =
		"inline-flex items-center text-white justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const variantClass = variantStyles[variant];
	const sizeClass = sizeStyles[size];

	return (
		<button
			ref={ref}
			data-variant={variant}
			data-size={size}
			className={cn(baseStyles, variantClass, sizeClass, className)}
			disabled={isDisabled}
			aria-disabled={isDisabled}
			aria-busy={loading}
			aria-label={ariaLabel}
			{...props}
		>
			{loading && (
				<svg
					className="animate-spin -ml-1 mr-2 h-4 w-4"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			)}
			{children}
		</button>
	);
}
