/**
 * Dashboard Home
 *
 * Main helpdesk dashboard with metrics and ticket overview
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ticket,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";

export const Route = createFileRoute("/app/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { data: metrics, isLoading: metricsLoading } =
    useQuery(orpc.dashboard.metrics.queryOptions());
  const { data: trends } = useQuery(orpc.dashboard.trends.queryOptions({ input: { days: 7 } }));
  const { data: recent } = useQuery(orpc.dashboard.recent.queryOptions({ input: { limit: 5 } }));

  if (metricsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const dashboardData = metrics || {
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0,
    activeAgents: 0,
    satisfactionScore: 0,
    slaCompliance: 0,
    firstResponseTime: 0,
    resolutionRate: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your support team's performance and customer satisfaction.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/app/tickets" search={{ status: "open" } as any} className="block transition-transform hover:scale-[1.02]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.openTickets}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.openTickets > 0 ? "Requires attention" : "All clear"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/tickets" search={{ status: "resolved" } as any} className="block transition-transform hover:scale-[1.02]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.resolvedToday}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.resolutionRate.toFixed(1)}% resolution rate
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.avgResponseTime.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.firstResponseTime.toFixed(1)}h first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.slaCompliance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.slaCompliance >= 95 ? "On target" : "Needs attention"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.trends ? (
              <RevenueChart data={trends.trends} />
            ) : (
              <Skeleton className="h-[300px]" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent?.tickets && recent.tickets.length > 0 ? (
              <div className="space-y-2">
                {recent.tickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{ticket.ticketNumber}</p>
                      <p className="text-xs text-muted-foreground">{ticket.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent tickets</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
