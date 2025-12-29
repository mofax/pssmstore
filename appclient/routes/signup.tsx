import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Button } from "../components/ds/Button";
import { TextInput } from "../components/ds/TextInput";

export const Route = createFileRoute("/signup")({
	component: SignupPage,
});

function SignupPage() {
	const { signup } = useAuth();
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!username.trim() || !email.trim() || !password || !confirmPassword) {
			setError("Please fill in all fields");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		setIsPending(true);
		try {
			await signup(username, email, password);
			navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Signup failed");
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
						Create your account
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
							placeholder="Choose a username"
							required
							autoFocus
							disabled={isPending}
						/>

						<TextInput
							label="Email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							required
							disabled={isPending}
						/>

						<TextInput
							label="Password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Choose a strong password"
							required
							disabled={isPending}
						/>

						<TextInput
							label="Confirm Password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm your password"
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
							Sign Up
						</Button>
					</form>

					<p className="mt-6 text-center text-foreground/60 text-sm">
						Already have an account?{" "}
						<button
							onClick={() => navigate({ to: "/login" })}
							className="text-primary hover:underline font-medium"
						>
							Sign in
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
