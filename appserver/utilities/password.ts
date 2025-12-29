import { scrypt } from "@noble/hashes/scrypt";
import { randomBytes } from "crypto";

/**
 * Hash a password using Scrypt
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const passwordBuffer = Buffer.from(password, "utf8");

	const hash = await scrypt(passwordBuffer, salt, {
		N: 2 ** 16,
		r: 8,
		p: 1,
		dkLen: 32,
	});

	// Combine salt + hash as base64
	const combined = Buffer.concat([salt, Buffer.from(hash)]);
	return combined.toString("base64");
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
	password: string,
	stored: string,
): Promise<boolean> {
	try {
		const combined = Buffer.from(stored, "base64");
		const salt = combined.slice(0, 16);
		const storedHash = combined.slice(16);
		const passwordBuffer = Buffer.from(password, "utf8");

		const hash = await scrypt(passwordBuffer, salt, {
			N: 2 ** 16,
			r: 8,
			p: 1,
			dkLen: 32,
		});

		return Buffer.compare(hash, storedHash) === 0;
	} catch (error) {
		console.error("Password verification error:", error);
		return false;
	}
}
