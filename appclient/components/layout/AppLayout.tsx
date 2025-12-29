import { Sidebar } from "./Sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import type { ReactNode } from "react";

interface AppLayoutProps {
	children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
	return (
		<div className="flex min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary">
			<Sidebar />
			<main className="flex-1 overflow-y-auto h-screen w-full relative">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background opacity-50 blur-3xl pointer-events-none" />
				<Breadcrumbs />
				<div className="container mx-auto p-8 max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-4">
					{children}
				</div>
			</main>
		</div>
	);
}
