import { Link, useLocation, useHistory } from "react-router-dom";
import { ReactNode } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonTabBar,
  IonTabButton,
  IonButtons,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
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
  const location = useLocation();
  const history = useHistory();
  const pathname = location.pathname;
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

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout().catch(() => {});
    clearStoredStore();
    history.push("/");
  };

  return (
    <IonPage className="ion-page">
      <IonHeader
        className={cn(
          "ion-no-border border-b bg-white/95 backdrop-blur",
          isMinimal && "py-2"
        )}
      >
        <IonToolbar className="px-4">
          <IonButtons slot="start">
            <Link to="/" className="font-bold text-lg text-secondary font-serif hover:opacity-90 flex items-center px-3">
              Amar Dokan
            </Link>
          </IonButtons>
          {/* Only show hamburger when logged in — tab bar has no "Log out"; menu is for logout only */}
          {!isMinimal && isLoggedIn && (
            <IonButtons slot="end">
              <button
                type="button"
                className="ion-button ion-button-clear p-2"
                onClick={() => setMobileMenuOpen((o) => !o)}
                aria-label="Account menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </IonButtons>
          )}
        </IonToolbar>

        {mobileMenuOpen && isLoggedIn && (
          <div className="absolute top-14 left-0 right-0 border-t bg-white px-4 py-3 flex flex-col gap-1 shadow-lg z-50">
            <IonButton fill="clear" expand="block" className="justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </IonButton>
          </div>
        )}
      </IonHeader>

      <IonContent className="ion-content flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col pb-24">{children}</div>

        {!isMinimal && (
          <footer className="p-5 text-center text-[10px] text-muted-foreground bg-muted/30 border-t shrink-0">
            <p className="text-lg">Made with ❤️ in Kolkata</p>
          </footer>
        )}
      </IonContent>

      {/* Bottom tab bar – use history.push so React Router handles navigation */}
      {!isMinimal && (
        <IonTabBar slot="bottom" className="ion-tab-bar border-t bg-white/95 backdrop-blur safe-area-bottom">
          {navLinks.filter((l) => !(l as { isLogout?: boolean }).isLogout).slice(0, 4).map((link) => {
            const { href, label, icon: Icon } = link;
            const isActive = pathname === href;
            return (
              <IonTabButton
                key={href}
                tab={label}
                onClick={() => history.push(href)}
                className={cn(isActive && "ion-tab-selected")}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-medium block mt-0.5", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
              </IonTabButton>
            );
          })}
        </IonTabBar>
      )}
    </IonPage>
  );
}
