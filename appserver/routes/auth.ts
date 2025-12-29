import { prisma } from "../../prisma/prisma-client";
import { randomHex } from "../../app-common/random";
import { hashPassword, verifyPassword } from "../utilities/password";
import {
	createSession,
	deleteSession,
	getSessionUser,
	getTokenFromRequest,
} from "../utilities/session";

export const AuthRoutes = {
	"/api/auth/signup": {
		POST: async (req: Request): Promise<Response> => {
			try {
				const body = await req.json() as any;
				const { username, email, password } = body;

				// Validation
				if (!username || !email || !password) {
					return Response.json(
						{ error: "Missing required fields" },
						{ status: 400 },
					);
				}

				// Check if user exists
				const existing = await prisma.identities.findFirst({
					where: {
						OR: [{ username }, { email }],
					},
				});

				if (existing) {
					return Response.json(
						{ error: "Username or email already exists" },
						{ status: 409 },
					);
				}

				// Hash password and create user
				const hashedPassword = await hashPassword(password);
				const user = await prisma.identities.create({
					data: {
						id: randomHex(),
						username,
						email,
						password: hashedPassword,
					},
				});

				// Create session
				const token = await createSession(user.id);

				return Response.json(
					{
						user: {
							id: user.id,
							username: user.username,
							email: user.email,
						},
						session_token: token,
					},
					{
						status: 201,
						headers: {
							"Set-Cookie":
								`session_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
									7 * 24 * 60 * 60
								}`,
						},
					},
				);
			} catch (err) {
				console.error(err);
				return Response.json({ error: "Internal Server Error" }, {
					status: 500,
				});
			}
		},
	},

	"/api/auth/login": {
		POST: async (req: Request): Promise<Response> => {
			try {
				const body = await req.json() as any;
				const { username, password } = body;

				// Validation
				if (!username || !password) {
					return Response.json(
						{ error: "Missing username or password" },
						{ status: 400 },
					);
				}

				// Find user
				const user = await prisma.identities.findUnique({
					where: { username },
				});

				if (!user) {
					return Response.json(
						{ error: "Invalid credentials" },
						{ status: 401 },
					);
				}

				// Verify password
				const isValid = await verifyPassword(password, user.password);
				if (!isValid) {
					return Response.json(
						{ error: "Invalid credentials" },
						{ status: 401 },
					);
				}

				// Create session
				const token = await createSession(user.id);

				return Response.json(
					{
						user: {
							id: user.id,
							username: user.username,
							email: user.email,
						},
						session_token: token,
					},
					{
						status: 200,
						headers: {
							"Set-Cookie":
								`session_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
									7 * 24 * 60 * 60
								}`,
						},
					},
				);
			} catch (err) {
				console.error(err);
				return Response.json({ error: "Internal Server Error" }, {
					status: 500,
				});
			}
		},
	},

	"/api/auth/me": {
		GET: async (req: Request): Promise<Response> => {
			try {
				const token = getTokenFromRequest(req);
				if (!token) {
					return Response.json(
						{ error: "Unauthorized" },
						{ status: 401 },
					);
				}

				const user = await getSessionUser(token);
				if (!user) {
					return Response.json(
						{ error: "Unauthorized" },
						{ status: 401 },
					);
				}

				return Response.json({
					id: user.id,
					username: user.username,
					email: user.email,
				});
			} catch (err) {
				console.error(err);
				return Response.json({ error: "Internal Server Error" }, {
					status: 500,
				});
			}
		},
	},

	"/api/auth/logout": {
		POST: async (req: Request): Promise<Response> => {
			try {
				const token = getTokenFromRequest(req);
				if (token) {
					await deleteSession(token);
				}

				return Response.json(
					{ ok: true },
					{
						status: 200,
						headers: {
							"Set-Cookie":
								"session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
						},
					},
				);
			} catch (err) {
				console.error(err);
				return Response.json({ error: "Internal Server Error" }, {
					status: 500,
				});
			}
		},
	},
};
