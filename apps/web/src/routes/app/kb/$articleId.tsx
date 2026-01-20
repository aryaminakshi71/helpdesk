/**
 * Knowledge Base Article Detail Page
 *
 * View a single knowledge base article
 */

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/kb/$articleId")({
  component: ArticlePage,
});

function ArticlePage() {
  const { articleId } = Route.useParams();
  const { data: article, isLoading } = useQuery(orpc.kb.get.queryOptions({ input: { id: articleId } }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Article not found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          The article you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{article.title}</h1>
        {article.category && (
          <Badge variant="outline" className="mt-2">
            {article.category}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
