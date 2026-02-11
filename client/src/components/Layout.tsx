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
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto shadow-2xl border-x overflow-hidden relative">
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
          isMinimal && "py-2"
        )}
      >
        <div className="w-full px-4 flex justify-between items-center h-14">
          <Link href="/" className="font-bold text-lg text-secondary font-serif hover:opacity-90">
            Amar Dokan
          </Link>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 right-0 border-t bg-white px-4 py-3 flex flex-col gap-1 shadow-lg z-50">
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

      <main className="flex-1 flex flex-col overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation for Mobile Feel */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t bg-white/95 backdrop-blur h-16 flex items-center justify-around px-2 z-40">
        {navLinks.filter(l => !l.isLogout).slice(0, 4).map((link) => {
          const { href, label, icon: Icon } = link;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                location === href ? "bg-primary/20 text-primary" : "text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {!isMinimal && (
        <footer className="py-4 text-center text-[10px] text-muted-foreground bg-muted/30 border-t mb-16">
          <p>Made with ❤️ in Kolkata</p>
        </footer>
      )}
    </div>
  );
}
