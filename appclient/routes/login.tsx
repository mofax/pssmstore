import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Button } from "../components/ds/Button";
import { TextInput } from "../components/ds/TextInput";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!username.trim() || !password) {
			setError("Please fill in all fields");
			return;
		}

		setIsPending(true);
		try {
			await login(username, password);
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background text-foreground">
			<div className="w-full max-w-md px-4">
				<div className="rounded-lg border border-primary/20 bg-background/50 backdrop-blur p-8">
					<h1 className="text-3xl font-bold mb-2 text-center">pssmstore</h1>
					<p className="text-center text-foreground/60 mb-8">
						Sign in to your account
					</p>

					{error && (
						<div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<TextInput
							label="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="Enter your username"
							required
							autoFocus
							disabled={isPending}
						/>

						<TextInput
							label="Password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
							disabled={isPending}
						/>

						<Button
							type="submit"
							variant="primary"
							className="w-full"
							loading={isPending}
							disabled={isPending}
						>
							Sign In
						</Button>
					</form>

					<p className="mt-6 text-center text-foreground/60 text-sm">
						Don't have an account?{" "}
						<button
							onClick={() => navigate({ to: "/signup" })}
							className="text-primary hover:underline font-medium"
						>
							Sign up
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
