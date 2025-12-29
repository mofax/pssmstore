import { randomBytes } from "@noble/ciphers/utils.js";
import { gcm } from "@noble/ciphers/aes.js";

export const AESGCM = {
	async encrypt(message: Uint8Array, key: Uint8Array) {
		const nonce = randomBytes(16);
		const cipher = gcm(key, nonce);
		const ciphertext = cipher.encrypt(message);
		return Uint8Array.from([nonce, ciphertext]);
	},
	async decrypt(ciphertext: Uint8Array, key: Uint8Array) {
		const nonce = ciphertext.slice(0, 16);
		const cipher = gcm(key, nonce);
		const message = cipher.decrypt(ciphertext.slice(16));
		return message;
	},
} as const;
