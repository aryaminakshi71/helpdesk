/**
 * Ticket Detail Page
 *
 * View and manage a single ticket
 */

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@helpdesk/auth/client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tickets/$ticketId")({
  component: TicketDetailPage,
});

function CommentForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const queryClient = useQueryClient();

  const addComment = useMutation(orpc.tickets.addComment.mutationOptions({
    onSuccess: () => {
      toast.success("Comment added");
      setContent("");
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ['tickets', 'get'] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add comment");
    }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addComment.mutate({
      id: ticketId,
      content,
      isInternal
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="comment">Reply</Label>
        <Textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your reply here..."
          rows={4}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="internal"
            checked={isInternal}
            onCheckedChange={(checked: boolean) => setIsInternal(checked)}
          />
          <Label htmlFor="internal">Internal Note</Label>
        </div>
        <Button type="submit" disabled={addComment.isPending || !content.trim()}>
          {addComment.isPending ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </form>
  );
}

function TicketDetailPage() {
  const { ticketId } = Route.useParams();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery(orpc.tickets.get.queryOptions({
    input: { id: ticketId },
    refetchInterval: 5000
  }));

  const assignTicket = useMutation(orpc.tickets.assign.mutationOptions({
    onSuccess: () => {
      toast.success("Ticket assigned");
      queryClient.invalidateQueries({ queryKey: ['tickets', 'get'] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to assign ticket");
    }
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Ticket not found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          The ticket you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ticket.ticketNumber}
          </h1>
          <p className="text-muted-foreground">{ticket.subject}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">{ticket.status}</Badge>
          <Badge variant="outline">{ticket.priority}</Badge>
          {!ticket.assignedTo && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => assignTicket.mutate({ id: ticket.id, assignedTo: session?.user?.id || null })}
              disabled={assignTicket.isPending}
            >
              Assign to Me
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {ticket.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {ticket.comments && ticket.comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {comment.user?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    {comment.isInternal && (
                      <Badge variant="secondary" className="text-xs">
                        Internal Note
                      </Badge>
                    )}
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentForm ticketId={ticket.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm">{ticket.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Priority</p>
                <p className="text-sm">{ticket.priority}</p>
              </div>
              {ticket.category && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{ticket.category}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              {ticket.requesterName && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requester</p>
                  <p className="text-sm">{ticket.requesterName}</p>
                  {ticket.requesterEmail && (
                    <p className="text-xs text-muted-foreground">
                      {ticket.requesterEmail}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {ticket.slaStatus && (
            <Card>
              <CardHeader>
                <CardTitle>SLA Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Status
                    </p>
                    <Badge variant="outline">{ticket.slaStatus.currentStatus}</Badge>
                  </div>
                  {ticket.slaStatus.firstResponseDue && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        First Response Due
                      </p>
                      <p className="text-sm">
                        {new Date(ticket.slaStatus.firstResponseDue).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {ticket.slaStatus.resolutionDue && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Resolution Due
                      </p>
                      <p className="text-sm">
                        {new Date(ticket.slaStatus.resolutionDue).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
