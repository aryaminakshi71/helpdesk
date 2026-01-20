import { Link, useRouter } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface NavItem {
  name: string;
  href: string;
  isHash?: boolean;
}

interface MarketingHeaderProps {
  navItems?: NavItem[];
  isAuthenticated?: boolean;
}

const defaultNavItems: NavItem[] = [
  { name: "Features", href: "/#features", isHash: true },
  { name: "Pricing", href: "/#pricing", isHash: true },
  { name: "Industries", href: "/industries" },
  { name: "Blog", href: "/blog" },
];

export function MarketingHeader({
  navItems = defaultNavItems,
  isAuthenticated = false,
}: MarketingHeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const router = useRouter();
  const pathname = router.state.location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);

      // Track active section for hash links
      const sections = navItems
        .filter((item) => item.isHash)
        .map((item) => item.href.substring(1));

      for (const section of sections) {
        // Handle path based hash links (e.g. /#features -> features)
        const elementId = section.replace('/', '').replace('#', '');
        const element = document.getElementById(elementId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(elementId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  return (
    <header
      className={cn(
        "fixed inset-x-0 z-50 flex justify-center transition-all duration-300",
        hasScrolled ? "top-4" : "top-4"
      )}
    >
      <div
        className={cn(
          "mx-4 w-full max-w-5xl rounded-2xl transition-all duration-300",
          hasScrolled
            ? "border border-border/80 bg-background/80 px-2 shadow-sm backdrop-blur-md"
            : "border border-border/60 bg-background/60 px-4 shadow-sm backdrop-blur-sm"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-bold text-primary-foreground text-sm">
                HD
              </span>
            </div>
            <span className="font-semibold text-lg">{"Helpdesk"}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                item={item}
                activeSection={activeSection}
                pathname={pathname}
              />
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:items-center md:gap-2">
              {isAuthenticated ? (
                <Button asChild size="sm">
                  <Link to="/app">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/login" search={{ mode: "signup" }}>Start free trial</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="flex size-9 items-center justify-center rounded-md border border-border md:hidden"
              onClick={toggleDrawer}
              aria-label="Toggle Menu"
            >
              {isDrawerOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-3 z-50 rounded-xl border border-border bg-background p-4 shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-foreground"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                    <span className="font-bold text-primary-foreground text-sm">
                      HD
                    </span>
                  </div>
                  <span className="font-semibold text-lg">{"Helpdesk"}</span>
                </Link>
                <button
                  onClick={toggleDrawer}
                  className="rounded-md border border-border p-1"
                  aria-label="Close Menu"
                >
                  <X className="size-5" />
                </button>
              </div>

              <ul className="flex flex-col rounded-md border border-border text-sm">
                {navItems.map((item) => (
                  <li
                    key={item.name}
                    className="border-b border-border p-2.5 last:border-b-0"
                  >
                    <NavLink
                      item={item}
                      activeSection={activeSection}
                      pathname={pathname}
                      onNavigate={() => setIsDrawerOpen(false)}
                      className="block"
                    />
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <Button asChild onClick={() => setIsDrawerOpen(false)}>
                    <Link to="/app">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button asChild onClick={() => setIsDrawerOpen(false)}>
                      <Link to="/login">Start free trial</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

interface NavLinkProps {
  item: NavItem;
  activeSection: string | null;
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}

function NavLink({
  item,
  activeSection,
  pathname,
  className,
  onNavigate,
}: NavLinkProps) {
  const isHashLink = item.isHash || item.href.includes("#");
  const hashTarget = isHashLink ? item.href.split("#")[1] : null;
  const isActiveHash = isHashLink && activeSection === hashTarget;
  const matchesPath = !isHashLink && pathname === item.href;

  const sharedClassName = cn(
    "text-sm transition-colors hover:text-foreground",
    isActiveHash || matchesPath
      ? "font-medium text-foreground"
      : "text-muted-foreground",
    className
  );

  if (isHashLink) {
    return (
      <a
        href={item.href}
        onClick={(event) => {
          // If we're on the homepage, scroll. If not, don't prevent default (navigate to /#target)
          if (pathname === "/" || pathname === "") {
            event.preventDefault();
            const element = hashTarget
              ? document.getElementById(hashTarget)
              : null;
            element?.scrollIntoView({ behavior: "smooth" });
            onNavigate?.();
          }
        }}
        className={sharedClassName}
      >
        {item.name}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      onClick={() => onNavigate?.()}
      className={sharedClassName}
    >
      {item.name}
    </Link>
  );
}
