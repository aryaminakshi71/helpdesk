/**
 * Billing Page
 *
 * Subscription management and billing information.
 */

import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient, useSession } from "@helpdesk/auth/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { data: sessionData } = useSession();
  const activeOrgId = sessionData?.session.activeOrganizationId;

  const { data: orgData, isLoading } = useQuery({
    queryKey: ["organization", activeOrgId],
    queryFn: async () => {
      if (!activeOrgId) return null;
      const { data } = await authClient.organization.getFullOrganization({
        query: {
          organizationId: activeOrgId,
        }
      });
      return data;
    },
    enabled: !!activeOrgId,
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ plan }: { plan: "pro" | "enterprise" }) => {
      if (!activeOrgId) throw new Error("No active organization");
      const { data, error } = await (authClient as any).subscription.subscribe({
        plan,
        organizationId: activeOrgId,
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to start subscription");
    }
  });

  const manageMutation = useMutation({
    mutationFn: async () => {
      if (!activeOrgId) throw new Error("No active organization");
      const { data, error } = await (authClient as any).subscription.createCustomerPortal({
        organizationId: activeOrgId,
        returnUrl: window.location.href,
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to open portal"),
  });

  const plan = (orgData as any)?.organization?.plan || "free";
  const membersCount = orgData?.members?.length || 1;
  const maxMembers = plan === "free" ? 5 : plan === "pro" ? 20 : 100;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the <span className="capitalize font-medium text-foreground">{plan}</span> plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">
                {plan === "free" ? "$0" : plan === "pro" ? "$29" : "$99"}
              </span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Button
              className="mt-4"
              disabled={plan === "enterprise" || upgradeMutation.isPending || manageMutation.isPending}
              onClick={() => {
                if (plan === "free") {
                  upgradeMutation.mutate({ plan: "pro" });
                } else {
                  manageMutation.mutate();
                }
              }}
            >
              {plan === "free" ? "Upgrade Plan" : "Manage Subscription"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              Your current usage this billing period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team members</span>
                  <span>{membersCount} / {maxMembers}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min((membersCount / maxMembers) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets</span>
                  <span>Unlimited</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
