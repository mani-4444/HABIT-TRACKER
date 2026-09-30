import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  Brain,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Overview", short: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Today", short: "Today", href: "/app/today", icon: CalendarCheck },
  { label: "Manage Habits", short: "Habits", href: "/app/habits", icon: ListChecks },
  { label: "Analysis", short: "Analysis", href: "/app/analysis", icon: BarChart3 },
  { label: "AI Insights", short: "AI", href: "/app/ai", icon: Brain },
];

export function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Derive display name from email or user metadata
  const email = user?.email || "";
  const displayName =
    user?.user_metadata?.full_name || email.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const now = new Date();
  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const shortToday = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative flex min-h-screen overflow-x-clip">
      {/* The login page's sunrise backdrop, fixed behind every app page */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-hero absolute inset-0 opacity-80" />
        <div className="floating-orb -left-24 top-24 h-72 w-72 bg-primary/30 animate-float-slow" />
        <div
          className="floating-orb -right-24 bottom-10 h-80 w-80 bg-accent/60 animate-pulse-glow"
          style={{ animationDelay: "-4s" }}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm animate-in fade-in-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border/70 bg-sidebar/95 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-sidebar-border/80 px-6">
            <Link to="/app" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sidebar-primary shadow-ambient transition-transform duration-300 group-hover:rotate-6">
                <span className="text-lg font-extrabold text-sidebar-primary-foreground">
                  H
                </span>
              </div>
              <div>
                <p className="text-base font-semibold tracking-wide text-sidebar-foreground">
                  HabitTracker
                </p>
                <p className="text-xs text-sidebar-foreground/70">
                  Focus Workspace
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              className="text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                      : "text-sidebar-foreground/85 hover:translate-x-1 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-all duration-300",
                      isActive ? "opacity-100" : "scale-y-0 opacity-0",
                    )}
                  />
                  <div
                    className={cn(
                      "rounded-xl p-2 transition-colors duration-300",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "bg-sidebar-accent/40 group-hover:bg-sidebar-primary/20",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mx-4 mb-4 rounded-2xl border border-sidebar-border/75 bg-sidebar-accent/55 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sidebar-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Momentum Tip
            </p>
            <p className="mt-2 text-sm text-sidebar-foreground">
              Stack tiny wins before noon. Early consistency makes evenings
              easier.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open menu"
              className="shrink-0 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <p className="eyebrow truncate">
                <span className="sm:hidden">{shortToday}</span>
                <span className="hidden sm:inline">{today}</span>
              </p>
              <p className="hidden truncate font-display text-xl font-bold text-foreground sm:block lg:text-2xl">
                Keep your streak <span className="text-primary">alive</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground md:inline-flex">
              1% better today
            </div>
            <div className="flex items-center gap-2 text-right">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              title="Log out"
              className="hover:bg-destructive/15 hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
          <div key={location.pathname} className="page-enter mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-30 rounded-3xl border border-border/70 bg-background/85 shadow-soft-lg backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-w-[3.5rem] flex-col items-center gap-1 rounded-2xl px-2.5 py-2 text-[11px] font-semibold transition-all duration-300",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent/35 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5 transition-transform duration-300", isActive && "-translate-y-0.5 text-primary")}
                />
                <span>{item.short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
