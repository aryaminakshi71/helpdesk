/**
 * App Layout (Dashboard)
 *
 * Protected layout for authenticated users.
 * Includes sidebar navigation and header.
 */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar, CommandMenu } from "@/components/dashboard";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  // TODO: Add auth check with beforeLoad once auth is wired up
  // beforeLoad: async ({ context }) => {
  //   if (!context.session) {
  //     throw redirect({ to: "/login" });
  //   }
  // },
});

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <CommandMenu />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
