/**
 * Industry Detail Page
 */

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const industryData: Record<string, {
  name: string;
  description: string;
  longDescription: string;
  benefits: string[];
  features: string[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
}> = {
  healthcare: {
    name: "Healthcare",
    description: "Secure, HIPPA-compliant support for clinics and hospitals.",
    longDescription: "Protect patient data while delivering exceptional care. Helpdesk provides the security and compliance features healthcare organizations need.",
    benefits: [
      "HIPAA Compliance Ready",
      "Secure Patient Communications",
      "Priority Triage for Emergencies",
    ],
    features: [
      "Encrypted messaging",
      "Audit logs",
      "Role-based access control",
    ],
    testimonial: {
      quote: "Helpdesk transformed how we manage patient inquiries. It's secure and easy to use.",
      author: "Dr. Sarah Smith",
      role: "Director of Operations",
      company: "City General Hospital",
    },
  },
  education: {
    name: "Education",
    description: "Streamlined support for schools, universities, and ed-tech.",
    longDescription: "From admissions to IT support, manage all campus communications in one place.",
    benefits: [
      "Student & Faculty Portals",
      "Knowledge Base for FAQs",
      "Multi-department Routing",
    ],
    features: [
      "SSO with Google/Microsoft",
      "Bulk ticket actions",
      "Self-service portal",
    ],
    testimonial: {
      quote: "The self-service portal reduced our IT ticket volume by 40% in the first month.",
      author: "Mark Johnson",
      role: "IT Director",
      company: "State University",
    },
  },
  ecommerce: {
    name: "E-commerce",
    description: "Manage returns and orders with integrated customer history.",
    longDescription: "delight your customers with fast resolution times and personalized support based on order history.",
    benefits: [
      "View Order History",
      "Automated Returns",
      "Multi-channel Support",
    ],
    features: [
      "Shopify/WooCommerce Integration",
      "Live Chat",
      "Social Media Integration",
    ],
    testimonial: {
      quote: "Our support agents resolve tickets twice as fast because they can see order details right in the ticket.",
      author: "Emily Chen",
      role: "Customer Success Lead",
      company: "StyleBox",
    },
  },
  saas: {
    name: "SaaS",
    description: "Technical support tools for software companies.",
    longDescription: "Build better software with integrated bug tracking and technical support workflows.",
    benefits: [
      "Link Tickets to Bugs",
      "Developer-friendly API",
      "SLA Management",
    ],
    features: [
      "Jira/GitHub Integration",
      "Code Highlighting",
      "Automated Triage",
    ],
    testimonial: {
      quote: "The ability to link support tickets directly to GitHub issues has streamlined our bug fixing process.",
      author: "David Wilson",
      role: "CTO",
      company: "TechFlow",
    },
  },
  finance: {
    name: "Financial Services",
    description: "Secure and audit-ready helpdesk for fintech.",
    longDescription: "Bank-grade security meets modern customer experience. Trust is your currency.",
    benefits: [
      "Data Sovereignty",
      "Complete Audit Trails",
      "Secure File Sharing",
    ],
    features: [
      "2FA Enforcement",
      "Data Retention Policies",
      "Compliance Reporting",
    ],
    testimonial: {
      quote: "We chose Helpdesk for its commitment to security and compliance without compromising on UX.",
      author: "Michael Brown",
      role: "VP of Operations",
      company: "SafeBank",
    },
  },
};

export const Route = createFileRoute("/industries/$slug")({
  component: IndustryPage,
  loader: ({ params }) => {
    const data = industryData[params.slug];
    if (!data) {
      throw notFound();
    }
    return { data, slug: params.slug };
  },
});

function IndustryPage() {
  const { data } = Route.useLoaderData();

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-primary/5">
        <div className="container mx-auto px-6">
          <Button variant="ghost" asChild className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <Link to="/industries">
              <ArrowLeft className="mr-2 size-4" />
              Back to Industries
            </Link>
          </Button>
          <div className="max-w-3xl">
            <Badge className="mb-4">Helpdesk for {data.name}</Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
              {data.name} Support Reimagined
            </h1>
            <p className="text-xl text-muted-foreground">
              {data.longDescription}
            </p>
            <div className="mt-10 flex gap-4">
              <Button size="lg" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight">
                Why industry leaders choose Helpdesk
              </h2>
              <ul className="space-y-4">
                {data.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="size-6 text-primary" />
                    <span className="text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-muted/50 p-8 lg:p-12">
              <h3 className="mb-6 text-xl font-semibold">Key Capabilities</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.features.map((feature) => (
                  <div key={feature} className="rounded-lg bg-background p-4 shadow-sm">
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="border-y bg-muted/20 py-24">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <Quote className="mx-auto mb-8 size-12 text-primary/20" />
          <blockquote className="mb-8 text-2xl font-medium leading-relaxed">
            "{data.testimonial.quote}"
          </blockquote>
          <div className="text-muted-foreground">
            <div className="font-semibold text-foreground">{data.testimonial.author}</div>
            <div>{data.testimonial.role}, {data.testimonial.company}</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-6">
          <h2 className="mb-6 text-3xl font-bold">Ready to modernize your support?</h2>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/login">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
