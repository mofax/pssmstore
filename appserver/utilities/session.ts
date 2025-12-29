import { prisma } from "../../prisma/prisma-client";
import { randomHex } from "../../app-common/random";

const SESSION_DURATION_DAYS = 7;

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
	const token = randomHex(32);
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

	await prisma.sessions.create({
		data: {
			id: randomHex(),
			token,
			user_id: userId,
			expires_at: expiresAt,
		},
	});

	return token;
}

/**
 * Get the user associated with a session token
 */
export async function getSessionUser(token: string) {
	const session = await prisma.sessions.findUnique({
		where: { token },
		include: { user: true },
	});

	if (!session) return null;
	if (new Date() > session.expires_at) {
		// Session expired, delete it
		await prisma.sessions.delete({ where: { id: session.id } });
		return null;
	}

	return session.user;
}

/**
 * Invalidate a session
 */
export async function deleteSession(token: string): Promise<void> {
	await prisma.sessions.deleteMany({
		where: { token },
	});
}

/**
 * Extract session token from request headers or cookies
 */
export function getTokenFromRequest(req: Request): string | null {
	// Check x-auth-token header first
	const authHeader = req.headers.get("x-auth-token");
	if (authHeader) {
		return authHeader;
	}

	// Check cookies
	const cookieHeader = req.headers.get("cookie");
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(";").map((c) => c.trim());
	for (const cookie of cookies) {
		if (cookie.startsWith("session_token=")) {
			return cookie.slice("session_token=".length);
		}
	}

	return null;
}
