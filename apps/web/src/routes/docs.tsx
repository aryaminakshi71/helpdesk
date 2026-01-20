/**
 * Documentation Page
 *
 * Placeholder for documentation.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/docs")({
    component: DocsPage,
});

function DocsPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
            <div className="max-w-md space-y-6 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
                <p className="text-muted-foreground">
                    Documentation will be available soon. We're working on comprehensive
                    guides to help you get started with Helpdesk.
                </p>
                <Button asChild>
                    <Link to="/">Back to home</Link>
                </Button>
            </div>
        </div>
    );
}
