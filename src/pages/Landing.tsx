import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Brain,
  CalendarCheck,
  HelpCircle,
  CircleDashed,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "Evidence-Backed Insights",
    description:
      "Behavioral coaching and pattern detection grounded directly in your tracked habits, streaks, and logging times.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly Performance Review",
    description:
      "Automated weekly breakdowns synthesizing your wins, key shifts, primary focus area, and a 7-day micro-experiment.",
  },
  {
    icon: HelpCircle,
    title: "Ask Your Habits",
    description:
      "Ask natural-language questions about your completion history, weekday trends, and routines with instant data-backed answers.",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden pb-10">
      <div className="floating-orb -left-20 top-8 h-64 w-64 bg-primary/35 animate-float-slow" />
      <div
        className="floating-orb right-0 top-1/3 h-80 w-80 -translate-y-1/2 bg-accent/60 animate-pulse-glow"
        style={{ animationDelay: "0.8s" }}
      />

      <header className="container relative z-10 flex h-20 items-center justify-between pr-14 sm:pr-16">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-primary shadow-ambient shrink-0">
            <span className="text-base sm:text-lg font-extrabold text-primary-foreground">
              H
            </span>
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold tracking-wide">
              HabitTracker
            </p>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Habit Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="h-8 px-3 text-xs sm:h-9 sm:px-3.5 sm:text-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <section className="container relative z-10 py-8 sm:py-14 lg:py-20">
        <div className="grid items-center gap-8 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>AI-Powered Habit Intelligence</span>
            </div>

            <h1 className="sunrise-title text-balance font-display text-3xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Build Better Habits
              <br />
              <span className="text-primary">with evidence-backed AI coaching.</span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground text-balance">
              Track your daily rituals and unlock deep behavioral intelligence.
              Get automated weekly reviews, pattern analysis grounded in your
              verified history, and natural-language Q&A about your progress.
            </p>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="xl" variant="hero" className="w-full sm:w-auto justify-center">
                  Start Tracking
                  <ArrowRight className="h-5 w-5 ml-1.5" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  variant="hero-secondary"
                  className="w-full sm:w-auto justify-center"
                >
                  I Already Have an Account
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              <div className="ambient-panel rounded-2xl p-3 sm:p-4 text-center sm:text-left">
                <p className="font-display text-lg sm:text-2xl font-bold text-primary">
                  30–90d
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.08em] text-muted-foreground leading-tight mt-0.5">
                  Patterns
                </p>
              </div>
              <div className="ambient-panel rounded-2xl p-3 sm:p-4 text-center sm:text-left">
                <p className="font-display text-lg sm:text-2xl font-bold text-primary">
                  Weekly
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.08em] text-muted-foreground leading-tight mt-0.5">
                  Reviews
                </p>
              </div>
              <div className="ambient-panel rounded-2xl p-3 sm:p-4 text-center sm:text-left">
                <p className="font-display text-lg sm:text-2xl font-bold text-primary">
                  Evidence
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.08em] text-muted-foreground leading-tight mt-0.5">
                  Grounded
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 lg:mt-0">
            <div className="ambient-panel relative rounded-[2rem] p-5 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Today Snapshot
                </p>
                <CircleDashed className="h-4 w-4 text-primary shrink-0" />
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {[
                  "30 min reading",
                  "Morning walk",
                  "No sugar after 8 PM",
                  "10 min reflection",
                ].map((habit, index) => (
                  <div
                    key={habit}
                    className="flex items-center gap-2.5 sm:gap-3 rounded-xl border border-border/70 bg-card/80 px-3.5 py-2.5 sm:px-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary shrink-0" />
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      {habit}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI Coaching Snippet */}
              <div className="mt-4 sm:mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:p-3.5 shadow-inner-soft">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  AI Coaching Insight
                </div>
                <p className="mt-1 text-xs text-foreground/90 leading-relaxed font-medium">
                  Morning reading completion rate is 86% when logged before 9 AM.
                </p>
              </div>

              <div className="mt-3.5 sm:mt-4 rounded-2xl border border-success/35 bg-success-muted p-3 sm:p-3.5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-base sm:text-lg font-bold text-success">
                    Streak: 14 Days
                  </p>
                  <TrendingUp className="h-4 w-4 text-success shrink-0" />
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Consistent weekday logging pattern detected.
                </p>
              </div>
            </div>

            <div className="absolute right-2 -top-3 sm:-right-2 sm:-top-4 rounded-2xl border border-border/70 bg-card/90 px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground shadow-soft backdrop-blur-sm">
              Habit Intelligence Hub
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
            Grounded in your facts, never generic advice.
          </p>
          <p className="mt-2 text-muted-foreground">
            Transform your daily habit logs into actionable, evidence-backed momentum.
          </p>

          <div className="mt-6">
            <Link to="/signup">
              <Button size="lg" variant="hero">
                Start Exploring Insights
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
