import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Testimonial, { defaultHabitTestimonials } from "@/components/ui/testimonial";
import { HabitGridDemo } from "@/components/landing/HabitGridDemo";
import { AICoachShowcase } from "@/components/landing/AICoachShowcase";
import { LogoMark } from "@/components/landing/LogoMark";
import { useReveal } from "@/hooks/useReveal";

const vars = (v: Record<string, string | number>) => v as CSSProperties;
const delay = (ms: number) => vars({ "--d": `${ms}ms` });

/** How much log you'd have at each stage, drawn as squares. */
const steps = [
  {
    when: "Day 1",
    title: "Log it",
    body: "Add the habits you care about and tick each one off when it's done. One tap per habit.",
    squares: 1,
    highlighted: [] as number[],
    tone: "--tone-orange",
  },
  {
    when: "Day 7",
    title: "Get your first weekly review",
    body: "Your wins, what shifted, one area to focus on, and a small experiment for the next seven days.",
    squares: 7,
    highlighted: [],
    tone: "--tone-amber",
  },
  {
    when: "Day 30",
    title: "See the patterns",
    body: "With a month of history, trends show up: strong days, weak days, and streaks close to breaking.",
    squares: 30,
    highlighted: [],
    tone: "--tone-mint",
  },
  {
    when: "Any day",
    title: "Ask your log",
    body: "Ask plain questions like “Which day do I skip most?” and get answers drawn from your own history.",
    squares: 30,
    highlighted: [1, 8, 15, 22, 29],
    tone: "--tone-rose",
  },
];

function StepSquares({ count, highlighted }: { count: number; highlighted: number[] }) {
  return (
    <div aria-hidden className="grid w-fit grid-cols-10 content-end gap-1 sm:h-[58px]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-hl={highlighted.includes(i) ? "" : undefined}
          className="sq h-3.5 w-3.5 rounded-[4px]"
          style={vars({ "--i": i })}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const pageRef = useReveal<HTMLDivElement>();


  return (
    <div ref={pageRef} className="relative min-h-screen w-full max-w-full overflow-x-clip">
      {/* The login page's sunrise gradient and orbs, fading out below the hero */}
      <div
        aria-hidden
        className="gradient-hero pointer-events-none absolute inset-x-0 top-0 h-[1000px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
      >
        <div className="glow -left-20 top-12 h-72 w-72 bg-primary/40" />
        <div className="glow -right-16 top-72 h-80 w-80 bg-accent" style={{ animationDelay: "-7s" }} />
        <div className="glow bottom-24 left-1/3 h-64 w-64 bg-tone-amber/30" style={{ animationDelay: "-12s" }} />
      </div>

      <header className="container relative z-10 flex h-20 items-center justify-between pr-16 sm:pr-[4.5rem]">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <LogoMark />
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-wide">HabitTracker</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:block">
              Habit intelligence
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-10 px-3 text-sm sm:px-4")}
          >
            Log in
          </Link>
          <Link to="/signup" className={cn(buttonVariants({ size: "sm" }), "hidden h-10 rounded-xl px-4 text-sm sm:inline-flex")}>
            Start tracking
          </Link>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="container relative pb-20 pt-8 sm:pt-12 lg:pb-28 lg:pt-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <p className="rise ai-border inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-foreground" style={delay(0)}>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Habit tracker with an AI coach built in
              </p>
              <h1 className="mt-5 font-display text-[clamp(3.25rem,8.5vw,6.25rem)] font-bold leading-[0.95] text-foreground">
                <span className="rise block" style={delay(90)}>
                  One square
                </span>
                <span className="rise relative inline-block text-primary" style={delay(180)}>
                  a day.
                  <svg
                    aria-hidden
                    viewBox="0 0 300 24"
                    preserveAspectRatio="none"
                    className="squiggle absolute -bottom-[0.16em] left-0 h-[0.2em] w-full text-tone-mint"
                  >
                    <path
                      d="M4 16 C 40 4, 70 22, 110 12 S 180 4, 220 14 S 280 20, 296 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="rise mt-8 max-w-[31rem] text-lg leading-relaxed text-muted-foreground sm:text-xl" style={delay(280)}>
                Check off your habits each day. Your{" "}
                <span className="font-semibold text-foreground">AI coach</span> reads that log and
                turns it into weekly reviews, pattern alerts and answers, each pointing to the exact
                days behind it.
              </p>
              <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(370)}>
                <Link to="/signup" className={cn(buttonVariants({ size: "xl" }), "group text-base")}>
                  Start tracking
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link to="/login" className={cn(buttonVariants({ variant: "hero-secondary", size: "xl" }), "text-base")}>
                  Log in
                </Link>
              </div>

              <div className="rise mt-10 flex items-center gap-3" style={delay(460)}>
                <div className="flex -space-x-2.5">
                  {defaultHabitTestimonials.map((t) => (
                    <img
                      key={t.author}
                      src={t.image}
                      alt=""
                      className="h-10 w-10 rounded-full border-[3px] border-background object-cover object-top"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">Gora, Geetha and Dong Lee</span>
                  <br className="sm:hidden" /> are each on a 65+ day streak
                </p>
              </div>
            </div>

            <div className="rise" style={delay(220)}>
              <HabitGridDemo />
            </div>
          </div>
        </section>

        {/* AI coach showcase */}
        <section aria-labelledby="coach-title" className="container pb-20 pt-4 sm:pb-28">
          <AICoachShowcase />
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="relative">
          <div className="container py-20 sm:py-28">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title" className="mt-4 font-display text-4xl font-bold leading-[1.02] sm:text-5xl">
                From the first checkmark <span className="block text-primary">to real patterns.</span>
              </h2>
            </div>

            <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li
                  key={step.when}
                  data-reveal
                  style={vars({ "--d": `${i * 110}ms`, "--tone": `var(${step.tone})` })}
                  className="ambient-panel rounded-3xl p-6"
                >
                  <StepSquares count={step.squares} highlighted={step.highlighted} />
                  <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--tone)/0.13)] px-3 py-1 text-xs font-bold text-foreground">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--tone))]" />
                    {step.when}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="people-title" className="relative">
          <div
            aria-hidden
            className="gradient-hero pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
          />
          <div className="container relative py-20 sm:py-28">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">People using it</p>
              <h2 id="people-title" className="mt-4 font-display text-4xl font-bold leading-[1.02] sm:text-5xl">
                Small actions, <span className="block text-primary">repeated.</span>
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                A pooja before sunrise, self-care between hospital shifts, training every morning.
                Different habits, same daily square.
              </p>
            </div>
            <Testimonial className="mt-14" />
          </div>
        </section>

        {/* Final call to action */}
        <section className="container py-20 sm:py-24">
          <div
            data-reveal
            className="group relative grid items-center gap-10 overflow-hidden rounded-[2rem] border border-sidebar-border bg-sidebar px-6 py-14 text-sidebar-foreground shadow-ambient sm:px-12 sm:py-16 md:grid-cols-[1fr_auto] lg:px-16"
          >
            <div aria-hidden className="glow -right-16 -top-20 h-72 w-72 bg-primary/50" />
            <div aria-hidden className="glow -bottom-24 left-1/4 h-60 w-60 bg-tone-mint/30" style={{ animationDelay: "-9s" }} />

            <div className="relative">
              <h2 className="font-display text-[clamp(2.6rem,6.5vw,4.75rem)] font-bold leading-[0.98] text-sidebar-accent-foreground">
                Today's square
                <br />
                <span className="text-sidebar-primary">is still empty.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-sidebar-foreground/80">
                Pick one habit, check it off tonight, and let the log build from there.
              </p>
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ size: "xl" }),
                  "mt-8 text-base focus-visible:ring-offset-sidebar",
                )}
              >
                Start tracking
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div
              aria-hidden
              className="relative hidden h-44 w-44 rotate-[-6deg] items-center justify-center rounded-[2rem] border-[3px] border-dashed border-sidebar-foreground/40 transition-all duration-500 group-hover:rotate-0 group-hover:border-solid group-hover:border-primary group-hover:bg-primary group-focus-within:rotate-0 group-focus-within:border-primary group-focus-within:bg-primary md:flex lg:h-52 lg:w-52"
            >
              <svg viewBox="0 0 48 48" className="cta-check h-20 w-20 text-primary-foreground">
                <path
                  d="M12 25 l8 8 l16 -18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/70 bg-card/65 backdrop-blur-sm">
        <div className="container flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7 rounded-lg text-xs shadow-none" />
            <span className="text-sm font-semibold">HabitTracker</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 HabitTracker · Built for consistency</p>
        </div>
      </footer>
    </div>
  );
}
