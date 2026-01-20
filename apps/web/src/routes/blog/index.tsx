/**
 * Blog Index Page
 *
 * Lists all blog posts with filtering by category.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const blogPosts = [
  {
    slug: "getting-started",
    title: "Getting Started with Helpdesk",
    description: "Learn how to set up your support team with our production-ready platform.",
    publishedAt: "2025-01-15",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "tutorial",
    tags: ["getting-started", "setup", "quickstart"],
    featured: true,
  },
  {
    slug: "authentication-guide",
    title: "Complete Authentication Guide",
    description: "A deep dive into secure sign-in, SSO configuration, and team management.",
    publishedAt: "2025-01-10",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "technical",
    tags: ["authentication", "security", "sso"],
    featured: true,
  },
  {
    slug: "edge-deployment",
    title: "Deploying to the Edge with Cloudflare Workers",
    description: "How to deploy your application to Cloudflare Workers for global edge performance.",
    publishedAt: "2025-01-05",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "technical",
    tags: ["deployment", "cloudflare", "edge"],
    featured: false,
  },
  {
    slug: "stripe-integration",
    title: "Setting Up Stripe Billing",
    description: "Integrate Stripe subscriptions for billing and invoicing.",
    publishedAt: "2025-01-01",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "tutorial",
    tags: ["billing", "stripe", "subscriptions"],
    featured: false,
  },
];

const categories = [
  { name: "all", label: "All Posts" },
  { name: "tutorial", label: "Tutorials" },
  { name: "technical", label: "Technical" },
  { name: "business", label: "Business" },
];

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

function BlogIndex() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredPosts =
    selectedCategory === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter((post) => post.featured);

  return (
    <div className="bg-gradient-to-br from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Blog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Insights, tutorials, and best practices for better customer support
          </p>
        </section>

        {/* Featured Posts */}
        {selectedCategory === "all" && featuredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold">Featured Articles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <Card key={post.slug} className="overflow-hidden">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{post.author.name}</span>
                      {post.author.role && (
                        <>
                          <span>·</span>
                          <span>{post.author.role}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">
            {selectedCategory === "all" ? "All Articles" : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Articles`}
          </h2>
          {filteredPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Card key={post.slug}>
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: post.slug }}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No articles found in this category.
            </p>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 rounded-lg bg-card p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Stay Updated</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Get the latest tutorials, tips, and updates delivered to your inbox.
          </p>
          <form className="mx-auto flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border border-input bg-background px-4 py-2"
              required
            />
            <Button type="submit">Subscribe</Button>
          </form>
          <p className="mt-2 text-sm text-muted-foreground">
            No spam, unsubscribe anytime.
          </p>
        </section>
      </div>
    </div>
  );
}
