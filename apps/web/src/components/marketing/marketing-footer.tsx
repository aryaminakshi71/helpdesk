import { Link } from "@tanstack/react-router";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { useIsMobile } from "@/hooks/use-mobile";

interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

const footerNavigation: FooterColumn[] = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/#pricing" },
            { label: "Industries", href: "/industries" },
            { label: "API", href: "/docs/api" },
        ],
    },
    {
        title: "Resources",
        links: [
            { label: "Documentation", href: "/docs" },
            { label: "Blog", href: "/blog" },
            { label: "Changelog", href: "/changelog" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "/about" },
            { label: "Contact", href: "mailto:hello@helpdesk.app", external: true },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ],
    },
];

const highlights = [
    "14-Day Free Trial",
    "No Credit Card Required",
    "Cancel Anytime",
];

export function MarketingFooter() {
    const year = new Date().getFullYear();
    const isMobile = useIsMobile();

    return (
        <footer className="relative mt-24 overflow-hidden text-sm">
            {/* Flickering Grid Section */}
            <div className="relative h-64 w-full overflow-hidden border-t border-border/15">
                <FlickeringGrid
                    text="Helpdesk"
                    className="absolute inset-0 h-full w-full"
                    squareSize={2}
                    gridGap={isMobile ? 3 : 2}
                />
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            {/* Main Footer Content */}
            <div className="relative border-t border-border/15 bg-background/95">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-start lg:justify-between">
                    {/* Brand section */}
                    <div className="flex w-full max-w-sm flex-col gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 font-semibold text-base text-foreground"
                        >
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                                <span className="font-bold text-primary-foreground text-sm">
                                    HD
                                </span>
                            </div>
                            {"Helpdesk"}
                        </Link>
                        <p className="text-muted-foreground">
                            {"Modern helpdesk solution for growing teams"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                            {highlights.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-border/40 bg-background/80 px-3 py-1 shadow-sm"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Navigation columns */}
                    <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {footerNavigation.map((column) => (
                            <div key={column.title} className="flex flex-col gap-3">
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                                    {column.title}
                                </span>
                                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                    {column.links.map((link) =>
                                        link.external ? (
                                            <li key={link.label}>
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
                                                >
                                                    {link.label}
                                                    <span className="translate-x-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-foreground/80">
                                                        &rarr;
                                                    </span>
                                                </a>
                                            </li>
                                        ) : (
                                            <li key={link.label}>
                                                <Link
                                                    to={link.href}
                                                    className="group inline-flex items-center gap-1 transition-colors hover:text-foreground"
                                                >
                                                    {link.label}
                                                    <span className="translate-x-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-foreground/80">
                                                        &rarr;
                                                    </span>
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border/15 bg-background/80">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                        <span>&copy; {year} {"Helpdesk"}. All rights reserved.</span>
                        <div className="flex flex-wrap items-center gap-4">
                            <Link to="/privacy" className="hover:text-foreground">
                                Privacy
                            </Link>
                            <Link to="/terms" className="hover:text-foreground">
                                Terms
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
