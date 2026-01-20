import { Zap, Shield, Users, CreditCard, Radio, Code } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

interface Feature {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: Zap,
        title: "Edge-first Performance",
        description:
            "Built on Cloudflare Workers for lightning-fast response times globally. Your support desk runs at the edge, closest to your customers.",
    },
    {
        icon: Shield,
        title: "Secure Authentication",
        description:
            "Complete authentication with OAuth providers, email/password, organizations, and role-based access control.",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description:
            "Built-in support for teams with real-time updates, ticket assignment, and internal notes.",
    },
    {
        icon: CreditCard,
        title: "Flexible Billing",
        description:
            "Integrated subscription management with Stripe. Support for per-seat pricing and usage-based billing.",
    },
    {
        icon: Radio,
        title: "Real-time Updates",
        description:
            "Instant notifications and live ticket updates ensure you never miss a customer request.",
    },
    {
        icon: Code,
        title: "Developer Friendly",
        description:
            "Extensive API and webhooks allow you to integrate Helpdesk with your existing tools and workflows.",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="relative py-24 md:py-32">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-muted/30" />

            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                        Features
                    </p>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Everything you need for support
                    </h2>
                    <p className="mx-auto max-w-2xl text-muted-foreground">
                        A complete platform for managing customer support. Focus on your customers, not the process.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative rounded-2xl border border-border/50 bg-background p-6 shadow-sm transition-all hover:border-border hover:shadow-md"
                        >
                            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <feature.icon className="size-6" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
