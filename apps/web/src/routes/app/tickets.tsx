/**
 * Tickets List Page
 *
 * List and manage all support tickets
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket as TicketIcon, Plus } from "lucide-react";
import { useState } from "react";
import { TicketForm } from "@/components/tickets/ticket-form";

export const Route = createFileRoute("/app/tickets")({
  component: TicketsPage,
});

function TicketsPage() {
  const queryClient = useQueryClient();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    priority: undefined as string | undefined,
  });

  const { data, isLoading, refetch } = useQuery(orpc.tickets.list.queryOptions({
    input: {
      status: filters.status as any,
      priority: filters.priority as any,
      limit: 100,
      offset: 0,
    },
    refetchInterval: 5000,
  }));

  const createTicket = useMutation(orpc.tickets.create.mutationOptions({
    onSuccess: () => {
      setShowTicketForm(false);
      refetch();
    },
  }));

  const tickets = data?.tickets || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track all support requests
          </p>
        </div>
        <Button onClick={() => setShowTicketForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filters.status || ""}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value || undefined })
          }
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filters.priority || ""}
          onChange={(e) =>
            setFilters({ ...filters, priority: e.target.value || undefined })
          }
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first support ticket.
          </p>
          <Button className="mt-4" onClick={() => setShowTicketForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket: any) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono text-sm">
                    {ticket.ticketNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/app/tickets/$ticketId"
                      params={{ ticketId: ticket.id }}
                      className="font-medium hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      {ticket.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800">
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/app/tickets/$ticketId"
                      params={{ ticketId: ticket.id }}
                    >
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showTicketForm && (
        <TicketForm
          onSubmit={(data) => {
            createTicket.mutate(data);
          }}
          onCancel={() => setShowTicketForm(false)}
        />
      )}
    </div>
  );
}
