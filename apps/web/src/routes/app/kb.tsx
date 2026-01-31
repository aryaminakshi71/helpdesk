/**
 * Knowledge Base List Page
 *
 * List and manage knowledge base articles
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Plus } from "lucide-react";

import { useState } from "react";
import { ArticleForm } from "@/components/kb/article-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/app/kb")({
  component: KBPage,
});

function KBPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(orpc.kb.list.queryOptions({
    input: { limit: 100, offset: 0 }
  }));

  const createArticle = useMutation(orpc.kb.create.mutationOptions({
    onSuccess: () => {
      toast.success("Article created successfully");
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['kb', 'list'] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create article");
    }
  }));

  const articles = data?.articles || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage your help articles and documentation
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Article
        </Button>
      </div>

      {showCreateForm && (
        <ArticleForm
          onSubmit={(data) => createArticle.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No articles found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first knowledge base article.
          </p>
          <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: any) => (
            <Card key={article.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {article.excerpt || article.content?.substring(0, 150)}
                </p>
                <Link
                  to="/app/kb/$articleId"
                  params={{ articleId: article.id }}
                  className="mt-4 inline-block"
                >
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
