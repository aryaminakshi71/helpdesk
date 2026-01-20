/**
 * Industries Index Page
 *
 * Lists all industries.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, ShoppingBag, Stethoscope, Briefcase } from "lucide-react";

const industries = [
  {
    slug: "healthcare",
    name: "Healthcare",
    description: "Secure, HIPPA-compliant support for clinics and hospitals.",
    icon: Stethoscope,
    stats: "30% faster response times",
  },
  {
    slug: "education",
    name: "Education",
    description: "Streamlined support for schools, universities, and ed-tech.",
    icon: GraduationCap,
    stats: "50% reduction in ticket volume",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    description: "Manage returns and orders with integrated customer history.",
    icon: ShoppingBag,
    stats: "24/7 automated support",
  },
  {
    slug: "saas",
    name: "SaaS",
    description: "Technical support tools for software companies.",
    icon: Building2,
    stats: "Integrated with Jira & GitHub",
  },
  {
    slug: "finance",
    name: "Financial Services",
    description: "Secure and audit-ready helpdesk for fintech.",
    icon: Briefcase,
    stats: "Bank-grade security",
  },
];

export const Route = createFileRoute("/industries/")({
  component: IndustriesIndex,
});

function IndustriesIndex() {
  return (
    <div className="bg-gradient-to-br from-background to-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">Industries</Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Solutions for every industry
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            See how Helpdesk creates tailored support experiences for specific verticals.
          </p>
        </section>

        {/* Industries Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Card key={industry.slug} className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
              <CardHeader>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <industry.icon className="size-6" />
                </div>
                <CardTitle className="text-xl">
                  <Link
                    to="/industries/$slug"
                    params={{ slug: industry.slug }}
                    className="after:absolute after:inset-0"
                  >
                    {industry.name}
                  </Link>
                </CardTitle>
                <CardDescription>{industry.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {industry.stats}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
