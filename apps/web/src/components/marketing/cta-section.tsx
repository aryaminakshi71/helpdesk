import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
    return (
        <section className="relative py-24 md:py-32">
            {/* Background gradient */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(120,119,198,0.1),transparent)]" />
            </div>

            <div className="mx-auto max-w-4xl px-6 text-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Ready to streamline your support?
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
                    Join support teams who are closing tickets faster with our
                    platform. Start your free trial today.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Button size="lg" className="h-12 gap-2 px-8" asChild>
                        <Link to="/login" search={{ mode: "signup" }}>
                            Start your free trial
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                        <Link to="/docs">Read the docs</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
