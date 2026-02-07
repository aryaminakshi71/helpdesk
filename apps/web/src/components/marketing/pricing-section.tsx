import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingPlan {
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
    highlighted?: boolean;
    cta: string;
    ctaHref: string;
}

const plans: PricingPlan[] = [
    {
        name: "Free",
        description: "Perfect for small teams getting started",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            "Up to 3 agents",
            "Email support",
            "Basic reporting",
            "Knowledge base",
        ],
        cta: "Get started",
        ctaHref: "/signup",
    },
    {
        name: "Pro",
        description: "For growing support teams",
        monthlyPrice: 29,
        yearlyPrice: 290,
        features: [
            "Unlimited agents",
            "Advanced reporting",
            "Automation rules",
            "SLA management",
            "Custom domains",
            "Priority support",
        ],
        highlighted: true,
        cta: "Subscribe with Stripe",
        ctaHref: "/signup",
    },
    {
        name: "Enterprise",
        description: "For large organizations",
        monthlyPrice: 99,
        yearlyPrice: 990,
        features: [
            "Unlimited agents",
            "Enterprise reporting",
            "Dedicated account manager",
            "Custom integration",
            "SSO & 2FA enforcement",
            "Custom SLA",
            "Audit logs",
        ],
        cta: "Contact sales",
        ctaHref: "mailto:sales@helpdesk.app",
    },
];

export function PricingSection() {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section id="pricing" className="relative py-24 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                {/* Section header */}
                <div className="mb-16 text-center">
                    <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
                        Pricing
                    </p>
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
                        Start free and scale as you grow. No hidden fees, no surprises.
                    </p>

                    {/* Billing toggle */}
                    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 p-1">
                        <button
                            onClick={() => setIsYearly(false)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                                !isYearly
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsYearly(true)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                                isYearly
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Yearly
                            <span className="ml-1.5 text-xs text-green-600">Save 17%</span>
                        </button>
                    </div>
                </div>

                {/* Pricing cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col rounded-2xl border p-8",
                                plan.highlighted
                                    ? "border-primary bg-primary/5 shadow-lg"
                                    : "border-border bg-background"
                            )}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                    Most popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="mb-2 text-xl font-semibold text-foreground">
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-foreground">
                                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                </span>
                                <span className="text-muted-foreground">
                                    /{isYearly ? "year" : "month"}
                                </span>
                            </div>

                            <ul className="mb-8 flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className="size-4 shrink-0 text-green-500" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.highlighted ? "default" : "outline"}
                                className="w-full"
                                asChild
                            >
                                {plan.ctaHref.startsWith('mailto') ? (
                                    <a href={plan.ctaHref}>{plan.cta}</a>
                                ) : (
                                    <Link to={plan.ctaHref}>{plan.cta}</Link>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
