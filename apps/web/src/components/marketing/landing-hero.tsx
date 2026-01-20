import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHero() {
    return (
        <section className="relative flex min-h-[85vh] items-center overflow-hidden pt-20">
            {/* Subtle gradient background */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_20%,rgba(59,130,246,0.1),transparent)]" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24 md:py-32">
                <div className="flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
                        <Sparkles className="size-4 text-primary" />
                        <span>Modern Support Platform</span>
                    </div>

                    {/* Headline */}
                    <h1 className="mb-6 max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        Support your customers{" "}
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            better than ever
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
                        A modern, lightning-fast helpdesk with intelligent automation,
                        real-time collaboration, and everything you need to delight your customers.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <Button size="lg" className="h-12 gap-2 px-8" asChild>
                            <Link to="/signup">
                                Get started free
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                            <Link to="/docs">View documentation</Link>
                        </Button>
                    </div>

                    {/* Trust signals */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-green-500/10">
                                <div className="size-2 rounded-full bg-green-500" />
                            </div>
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10">
                                <div className="size-2 rounded-full bg-blue-500" />
                            </div>
                            <span>14-day free trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-purple-500/10">
                                <div className="size-2 rounded-full bg-purple-500" />
                            </div>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
