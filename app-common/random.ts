import { tryNumber } from "./type-guards";

export function randomInt(min = 999999, max = Number.MAX_SAFE_INTEGER) {
	const range = max - min + 1;
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return Math.floor((tryNumber(array[0]) / (0xffffffff + 1)) * range) + min;
}

export function randomHex(length = 8) {
	const array = new Uint8Array(length / 2);
	crypto.getRandomValues(array);
	return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}
