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
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Overview", href: "/app", icon: LayoutDashboard },
  { label: "Today", href: "/app/today", icon: CalendarCheck },
  { label: "Manage Habits", href: "/app/habits", icon: ListChecks },
  { label: "Analysis", href: "/app/analysis", icon: BarChart3 },
  { label: "AI Insights", href: "/app/ai", icon: Brain },
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

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-background">
      <div className="floating-orb -left-24 top-24 h-72 w-72 bg-primary/30 animate-float-slow" />
      <div
        className="floating-orb -right-24 bottom-10 h-80 w-80 bg-accent/50 animate-pulse-glow"
        style={{ animationDelay: "0.7s" }}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border/70 bg-sidebar/90 backdrop-blur-xl shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between border-b border-sidebar-border/80 px-6">
            <Link to="/app" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sidebar-primary shadow-ambient transition-transform group-hover:rotate-6">
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
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-sidebar-border/80 bg-sidebar-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-accent-foreground sm:inline-block">
                Daily
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition-all duration-300",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                      : "text-sidebar-foreground/85 hover:translate-x-1 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-xl p-2 transition-colors",
                      isActive
                        ? "bg-sidebar-primary/20"
                        : "bg-sidebar-accent/40 group-hover:bg-sidebar-primary/15",
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
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sidebar-accent-foreground/90">
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
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/70 bg-background/65 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {today}
              </p>
              <h1 className="font-display text-xl text-foreground lg:text-2xl">
                Keep Your Streak Alive
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-border/70 bg-card/80 px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
              1% better today
            </div>
            <div className="flex items-center gap-2 text-right">
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/15 hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">
          <div className="ambient-panel max-w-6xl mx-auto w-full min-h-[calc(100vh-9rem)] rounded-[1.8rem] p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 z-30 rounded-3xl border border-border/70 bg-background/90 shadow-soft-lg backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition-all duration-300",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent/35 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isActive && "text-primary")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
