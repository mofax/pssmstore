import { createContext, type ReactNode, use, useEffect, useState } from "react";

export interface User {
	id: string;
	username: string;
	email: string;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (username: string, password: string) => Promise<void>;
	signup: (username: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	// Check if user is already logged in
	useEffect(() => {
		async function checkAuth() {
			try {
				const response = await fetch("/api/auth/me", {
					credentials: "include",
				});
				if (response.ok) {
					const userData = await response.json();
					setUser(userData);
				}
			} catch (err) {
				console.error("Failed to fetch user:", err);
			} finally {
				setLoading(false);
			}
		}

		checkAuth();
	}, []);

	const login = async (username: string, password: string) => {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			credentials: "include",
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Login failed");
		}

		const data = await response.json();
		setUser(data.user);
	};

	const signup = async (username: string, email: string, password: string) => {
		const response = await fetch("/api/auth/signup", {
			method: "POST",
			credentials: "include",
			body: JSON.stringify({ username, email, password }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Signup failed");
		}

		const data = await response.json();
		setUser(data.user);
	};

	const logout = async () => {
		await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "include",
		});
		setUser(null);
	};

	return (
		<AuthContext value={{ user, loading, login, signup, logout }}>
			{children}
		</AuthContext>
	);
}

export function useAuth(): AuthContextType {
	const context = use(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
