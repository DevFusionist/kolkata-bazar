import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Store, HelpCircle, LogIn, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getStoredStoreId, logout, clearStoredStore } from "@/lib/api";

type LayoutVariant = "default" | "minimal" | "none";

type LayoutProps = {
  children: ReactNode;
  variant?: LayoutVariant;
  /** When true, show dashboard/login in nav (seller context) */
  showSellerNav?: boolean;
};

export function Layout({ children, variant = "default", showSellerNav = false }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (variant === "none") {
    return <>{children}</>;
  }

  const isMinimal = variant === "minimal";
  const isLoggedIn = !!getStoredStoreId();
  const navLinks = [
    { href: "/", label: "Home", icon: Store },
    ...(showSellerNav && !isLoggedIn ? [{ href: "/how-it-works", label: "How it works", icon: HelpCircle }] : []),
    ...(showSellerNav
      ? [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          ...(isLoggedIn
            ? [{ href: "#", label: "Log out", icon: LogOut, isLogout: true as const }]
            : [{ href: "/login", label: "Log in", icon: LogIn }]),
        ]
      : isLoggedIn
        ? [{ href: "#", label: "Log out", icon: LogOut, isLogout: true as const }]
        : [{ href: "/login", label: "Log in", icon: LogIn }]),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
          isMinimal && "py-2"
        )}
      >
        <div className="w-full max-w-6xl mx-auto px-4 flex justify-between items-center h-14">
          <Link href="/" className="font-bold text-xl text-secondary font-serif hover:opacity-90">
            Amar Dokan
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const { href, label, icon: Icon, isLogout } = link as typeof link & { isLogout?: boolean };
              if (isLogout) {
                return (
                  <Button
                    key="logout"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      logout().catch(() => {});
                      clearStoredStore();
                      window.location.href = "/";
                    }}
                  >
                    <Icon className="w-4 h-4 mr-1.5 sm:mr-0 sm:hidden" />
                    {label}
                  </Button>
                );
              }
              return (
                <Link key={href} href={href}>
                  <Button
                    variant={location === href ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-muted-foreground",
                      location === href && "text-secondary-foreground bg-secondary hover:bg-secondary/80 hover:text-shadow-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-1.5 sm:mr-0 sm:hidden" />
                    {label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-white px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => {
              const { href, label, icon: Icon, isLogout } = link as typeof link & { isLogout?: boolean };
              if (isLogout) {
                return (
                  <Button
                    key="logout"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout().catch(() => {});
                      clearStoredStore();
                      window.location.href = "/";
                    }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                );
              }
              return (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={location === href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      {!isMinimal && (
        <footer className="py-6 text-center text-sm text-muted-foreground bg-muted/30 border-t mt-auto">
          <p>Made with ❤️ in Kolkata</p>
        </footer>
      )}
    </div>
  );
}
