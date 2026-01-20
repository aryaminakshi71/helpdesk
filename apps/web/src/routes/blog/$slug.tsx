/**
 * Blog Post Page
 *
 * Individual blog post display.
 */

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const blogPosts: Record<string, {
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt?: string;
  author: { name: string; role?: string };
  category: string;
  tags: string[];
  content: string;
}> = {
  "getting-started": {
    title: "Getting Started with Helpdesk",
    description: "Learn how to set up your support team with our production-ready platform.",
    publishedAt: "2025-01-15",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "tutorial",
    tags: ["getting-started", "setup", "quickstart"],
    content: `
## Introduction

Helpdesk is a modern support platform using TanStack Start, Cloudflare Workers, and Better Auth. This guide will walk you through setting up your workspace.

## Prerequisites

Before you begin, make sure you have:

- A team account
- Configured your organizational settings

## Getting Started

1. Log in to your dashboard
2. Invite your team members
3. Configure your ticket queues

## Next Steps

- Set up email integration
- Configure automatic responses
- Create your first knowledge base article
    `,
  },
  "authentication-guide": {
    title: "Complete Authentication Guide",
    description: "A deep dive into secure sign-in, SSO configuration, and team management.",
    publishedAt: "2025-01-10",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "technical",
    tags: ["authentication", "security", "sso"],
    content: `
## Overview

Helpdesk uses robust authentication to keep your data secure, providing a comprehensive solution for user management, SSO, and organization support.

## SSO Providers

### Google Workspace

1. Connect your Google Workspace
2. Enable SSO enforcement
3. Map groups to roles

### Microsoft Entra ID (Azure AD)

1. Register the application
2. Configure permissions
3. Enable sync

## Security Best Practices

- Enable 2FA for all admins
- Review audit logs regularly
- Set session timeouts
    `,
  },
  "edge-deployment": {
    title: "Deploying to the Edge with Cloudflare Workers",
    description: "How to deploy your application to Cloudflare Workers for global edge performance.",
    publishedAt: "2025-01-05",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "technical",
    tags: ["deployment", "cloudflare", "edge"],
    content: `
## Why Edge?

Running at the edge ensures your support team has ultra-low latency access globally.

- Ultra-low latency
- High availability
- Global distribution

## Deployment Steps

1. Install Wrangler CLI
2. Configure \`wrangler.toml\`
3. Run \`bun run deploy\`
    `,
  },
  "stripe-integration": {
    title: "Setting Up Billing",
    description: "Manage your Helpdesk subscription and billing.",
    publishedAt: "2025-01-01",
    author: { name: "Team Helpdesk", role: "Developers" },
    category: "tutorial",
    tags: ["billing", "stripe", "subscriptions"],
    content: `
## Overview

Helpdesk offers flexible billing plans that scale with your team.

## Managing Subscriptions

Go to Settings > Billing to:

- View invoices
- Update payment methods
- Change seat count

## Plans

- **Starter**: For small teams
- **Pro**: For growing companies
- **Enterprise**: For large organizations with custom needs
    `,
  },
};

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  loader: ({ params }) => {
    const post = blogPosts[params.slug];
    if (!post) {
      throw notFound();
    }
    return { post, slug: params.slug };
  },
});

function BlogPost() {
  const { post, slug } = Route.useLoaderData();

  return (
    <article className="bg-gradient-to-br from-background to-muted/20">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Back link */}
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/blog">
            <ArrowLeft className="mr-2 size-4" />
            Back to blog
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground">{post.description}</p>
          <Separator className="my-6" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{post.author.name}</span>
              {post.author.role && <span> · {post.author.role}</span>}
            </div>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {/* In production, this would render MDX content */}
          <div
            dangerouslySetInnerHTML={{
              __html: post.content
                .replace(/## /g, '<h2 class="text-2xl font-bold mt-8 mb-4">')
                .replace(/### /g, '<h3 class="text-xl font-semibold mt-6 mb-3">')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/```(\w+)\n([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
                .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
                .replace(/\n- /g, '<li class="ml-4 list-disc">')
                .replace(/^\s*-\s/gm, '<li class="ml-4 list-disc">'),
            }}
          />
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t pt-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link to="/blog">
                <ArrowLeft className="mr-2 size-4" />
                Back to all posts
              </Link>
            </Button>
          </div>
        </footer>
      </div>
    </article>
  );
}
