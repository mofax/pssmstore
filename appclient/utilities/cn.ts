import { twMerge } from "tailwind-merge";

type ClassName = string;
type CNInput = ClassName | ClassName[] | Record<string, boolean>;
export function cn(...inputs: CNInput[]): string {
	let prep = [] as string[];
	for (const input of inputs) {
		if (Array.isArray(input)) {
			prep[prep.length] = input.join(" ");
		} else if (typeof input === "object") {
			const str = Object.entries(input)
				.filter(([_, value]) => value)
				.map(([key]) => key)
				.join(" ");
			prep[prep.length] = str;
		} else {
			prep[prep.length] = input;
		}
	}
	return twMerge(prep.join(" "));
}
