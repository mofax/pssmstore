import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { Button } from "../ds/Button";

export function Sidebar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const navItems = [
		{ to: "/folders", label: "Folders" },
	];

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await logout();
			navigate({ to: "/login" });
		} catch (err) {
			console.error("Logout failed:", err);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<aside className="w-64 border-r border-border bg-background/50 h-screen sticky top-0 flex flex-col glass-panel border-r-0 border-t-0 border-b-0 border-l-0">
			<div className="p-6 border-b border-border/50">
				<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					PSSM Store
				</h1>
			</div>

			<nav className="flex-1 p-4 space-y-1">
				{navItems.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200"
						activeProps={{
							className:
								"bg-secondary/50 text-primary border-r-2 border-primary rounded-r-none",
						}}
						inactiveProps={{
							className:
								"text-secondary-foreground hover:bg-secondary/30 hover:text-foreground",
						}}
					>
						{item.label}
					</Link>
				))}
			</nav>

			<div className="p-4 border-t border-border/50 space-y-4">
				{user && (
					<div className="px-4 py-3 rounded-md bg-secondary/20">
						<p className="text-xs text-secondary-foreground font-medium mb-1">
							Logged in as
						</p>
						<p className="text-sm font-semibold text-foreground">
							{user.username}
						</p>
						<p className="text-xs text-secondary-foreground">
							{user.email}
						</p>
					</div>
				)}

				<Button
					onClick={handleLogout}
					variant="outline"
					className="w-full"
					loading={isLoggingOut}
					disabled={isLoggingOut}
				>
					Logout
				</Button>

				<div className="px-4 py-2 rounded-md bg-secondary/20">
					<p className="text-xs text-secondary-foreground font-medium">
						PSSM v1.0.0
					</p>
				</div>
			</div>
		</aside>
	);
}
