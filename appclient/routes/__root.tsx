import {
	createRootRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { AppLayout } from "../components/layout/AppLayout";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const PUBLIC_ROUTES = ["/login", "/signup"];

function RootContent() {
	const { user, loading } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (loading) return;

		const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

		if (!user && !isPublicRoute) {
			navigate({ to: "/login" });
		} else if (user && isPublicRoute) {
			navigate({ to: "/folders" });
		} else if (user && location.pathname === "/") {
			navigate({ to: "/folders" });
		}
	}, [user, loading, location.pathname, navigate]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-background text-foreground">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	// Show layout only for authenticated users or on public routes
	if (!user && !PUBLIC_ROUTES.includes(location.pathname)) {
		return null;
	}

	if (!user && PUBLIC_ROUTES.includes(location.pathname)) {
		return <Outlet />;
	}

	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}

export const Route = createRootRoute({
	component: () => (
		<AuthProvider>
			<RootContent />
		</AuthProvider>
	),
});
