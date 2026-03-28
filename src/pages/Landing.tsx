import { Link } from "react-router-dom";
import {
  CheckCircle2,
  BarChart3,
  Sparkles,
  ArrowRight,
  Compass,
  CircleDashed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: CheckCircle2,
    title: "Daily Rhythm",
    description:
      "A lightweight checklist that makes follow-through feel effortless.",
  },
  {
    icon: BarChart3,
    title: "Signal Over Noise",
    description: "Visual trends reveal what is improving and what is slipping.",
  },
  {
    icon: Sparkles,
    title: "Insight Layer",
    description:
      "Actionable prompts help you protect your streak under pressure.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden pb-10">
      <div className="floating-orb -left-20 top-8 h-64 w-64 bg-primary/35 animate-float-slow" />
      <div
        className="floating-orb right-0 top-1/3 h-80 w-80 -translate-y-1/2 bg-accent/60 animate-pulse-glow"
        style={{ animationDelay: "0.8s" }}
      />

      <header className="container relative z-10 flex h-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary shadow-ambient">
            <span className="text-lg font-extrabold text-primary-foreground">
              H
            </span>
          </div>
          <div>
            <p className="text-base font-semibold tracking-wide">
              HabitTracker
            </p>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Ritual Designer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="container relative z-10 py-14 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Compass className="h-3.5 w-3.5 text-primary" />
              Designed for Consistency
            </div>

            <h1 className="sunrise-title text-balance font-display text-5xl font-extrabold text-foreground sm:text-6xl lg:text-7xl">
              Build Better Days
              <br />
              <span className="text-primary">with a plan you can keep.</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-balance">
              HabitTracker gives structure to your goals without clutter. Check
              in daily, see your momentum, and stay anchored to what matters
              most.
            </p>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link to="/signup">
                <Button size="xl" variant="hero" className="w-full sm:w-auto">
                  Start Your Ritual
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="xl"
                  variant="hero-secondary"
                  className="w-full sm:w-auto"
                >
                  I Already Have an Account
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="ambient-panel rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-primary">
                  92%
                </p>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Weekly Focus
                </p>
              </div>
              <div className="ambient-panel rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-primary">
                  5 min
                </p>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Daily Check-In
                </p>
              </div>
              <div className="ambient-panel rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-primary">
                  ∞
                </p>
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  Small Wins
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="ambient-panel relative rounded-[2rem] p-6 sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Today Snapshot
                </p>
                <CircleDashed className="h-4 w-4 text-primary" />
              </div>

              <div className="space-y-4">
                {[
                  "30 min reading",
                  "Morning walk",
                  "No sugar after 8 PM",
                  "10 min reflection",
                ].map((habit, index) => (
                  <div
                    key={habit}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-4 py-3"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-medium text-foreground">
                      {habit}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-success/35 bg-success-muted p-4">
                <p className="font-display text-xl font-bold text-success">
                  Streak: 14 Days
                </p>
                <p className="text-sm text-muted-foreground">
                  You are showing up consistently. Keep the chain unbroken.
                </p>
              </div>
            </div>

            <div className="absolute -right-4 -top-4 rounded-2xl border border-border/70 bg-card/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-soft">
              Momentum Mode
            </div>
          </div>
        </div>
      </section>

      <section className="container relative z-10 pb-20 lg:pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="feature"
              className="animate-fade-in rounded-3xl"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex rounded-2xl bg-primary/14 p-3 shadow-inner-soft">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-2xl font-bold leading-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-border/70 bg-card/75 p-6 text-center shadow-soft lg:p-8">
          <p className="font-display text-2xl font-bold text-foreground lg:text-3xl">
            Consistency is not intensity.
          </p>
          <p className="mt-2 text-muted-foreground">
            Build a routine that survives real life, not a perfect week.
          </p>

          <div className="mt-6">
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Build My Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/70 bg-card/65 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-extrabold text-primary-foreground">
                H
              </span>
            </div>
            <span className="text-sm font-semibold">HabitTracker</span>
          </div>
          <p className="text-sm text-muted-foreground/90">
            © 2026 HabitTracker. Built for consistency.
          </p>
        </div>
      </footer>
    </div>
  );
}
