import { useLayoutEffect, useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { format, previousTuesday, startOfWeek, subDays, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Testimonial, { defaultHabitTestimonials } from "@/components/ui/testimonial";
import { HabitGridDemo } from "@/components/landing/HabitGridDemo";
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
    tone: "--coral",
  },
  {
    when: "Day 7",
    title: "Get your first weekly review",
    body: "Your wins, what shifted, one area to focus on, and a small experiment for the next seven days.",
    squares: 7,
    highlighted: [],
    tone: "--sun",
  },
  {
    when: "Day 30",
    title: "See the patterns",
    body: "With a month of history, trends show up: strong days, weak days, and streaks close to breaking.",
    squares: 30,
    highlighted: [],
    tone: "--mint",
  },
  {
    when: "Any day",
    title: "Ask your log",
    body: "Ask plain questions like “Which day do I skip most?” and get answers drawn from your own history.",
    squares: 30,
    highlighted: [1, 8, 15, 22, 29],
    tone: "--violet",
  },
];

const review = [
  { label: "Win", tone: "--mint", text: "Read every day this week, 7 of 7." },
  { label: "Shift", tone: "--coral", text: "Evening habits slipped after 9 PM on three days." },
  { label: "Focus", tone: "--violet", text: "Protect the last hour before bed." },
  { label: "Try for 7 days", tone: "--sun", text: "Phone on the charger by 8:45 PM, then log how the evening went." },
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

  // Landing uses the vivid palette; the rest of the app keeps its own for now.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-vivid");
    return () => root.classList.remove("theme-vivid");
  }, []);

  const example = useMemo(() => {
    const today = new Date();
    const lastTuesday = previousTuesday(today);
    const tuesdays = [0, 1, 3, 5, 6, 9].map((w) => format(subWeeks(lastTuesday, w), "EEE d MMM"));
    const reviewWeek = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 7), "d MMM");
    return { tuesdays, reviewWeek };
  }, []);

  return (
    <div ref={pageRef} className="relative min-h-screen w-full max-w-full overflow-x-hidden font-figtree">
      {/* Ambient colour behind the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden">
        <div className="glow -left-24 top-10 h-[420px] w-[420px] bg-brand-violet" />
        <div className="glow right-[-6rem] top-40 h-[380px] w-[380px] bg-brand-coral" style={{ animationDelay: "-6s" }} />
        <div className="glow bottom-10 left-1/3 h-[320px] w-[320px] bg-brand-mint" style={{ animationDelay: "-11s" }} />
      </div>

      <header className="container relative z-10 flex h-20 items-center justify-between pr-16 sm:pr-[4.5rem]">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <LogoMark />
          <span className="font-bricolage text-lg font-extrabold tracking-tight">HabitTracker</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden h-10 px-4 text-sm font-semibold sm:inline-flex")}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className={cn(buttonVariants({ size: "sm" }), "btn-glow h-10 rounded-full px-4 text-sm font-bold")}
          >
            Start tracking
          </Link>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="container relative pb-20 pt-8 sm:pt-12 lg:pb-28 lg:pt-14">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <p className="eyebrow rise" style={delay(0)}>
                <Sparkles className="h-3.5 w-3.5" />
                Habit tracking with AI coaching
              </p>
              <h1 className="type-display mt-6 text-[clamp(3.4rem,10vw,6.6rem)] text-foreground">
                <span className="rise block" style={delay(90)}>
                  One square
                </span>
                <span className="rise relative inline-block" style={delay(180)}>
                  a <span className="text-gradient pr-[0.06em]">day.</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 300 24"
                    preserveAspectRatio="none"
                    className="squiggle absolute -bottom-[0.14em] left-[0.9em] h-[0.2em] w-[calc(100%-0.9em)] text-brand-sun"
                  >
                    <path
                      d="M4 16 C 40 4, 70 22, 110 12 S 180 4, 220 14 S 280 20, 296 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="rise mt-8 max-w-[31rem] text-lg leading-relaxed text-muted-foreground sm:text-xl" style={delay(280)}>
                Check off your habits each day. HabitTracker turns that log into weekly reviews and
                insights that point to the exact days behind them.
              </p>
              <div className="rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={delay(370)}>
                <Link
                  to="/signup"
                  className={cn(
                    buttonVariants({ size: "xl" }),
                    "btn-glow group h-14 rounded-full px-8 text-base font-bold hover:-translate-y-1",
                  )}
                >
                  Start tracking
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xl" }),
                    "h-14 rounded-full border-2 bg-card px-8 text-base font-semibold shadow-none",
                  )}
                >
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

        {/* How it works */}
        <section aria-labelledby="how-title" className="relative bg-card/70">
          <div className="container py-20 sm:py-28">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title" className="type-heading mt-5 text-4xl sm:text-[3.25rem]">
                From the first checkmark to real patterns
              </h2>
            </div>

            <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li
                  key={step.when}
                  data-reveal
                  style={vars({ "--d": `${i * 110}ms`, "--tone": `var(${step.tone})` })}
                  className="rounded-3xl border border-[hsl(var(--tone)/0.25)] bg-[hsl(var(--tone)/0.08)] p-6"
                >
                  <StepSquares count={step.squares} highlighted={step.highlighted} />
                  <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[hsl(var(--tone))]" />
                    {step.when}
                  </p>
                  <h3 className="type-heading mt-4 text-2xl">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* AI coaching */}
        <section aria-labelledby="coach-title" className="container py-20 sm:py-28">
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div data-reveal className="lg:sticky lg:top-24">
              <p className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                AI coaching
              </p>
              <h2 id="coach-title" className="type-heading mt-5 text-4xl sm:text-[3.25rem]">
                Coaching that <span className="text-gradient">shows its work</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                Every answer and every weekly review links back to the days it came from, so you
                can check it against your own log instead of taking it on faith.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article
                data-reveal
                className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
              >
                <p className="label">Ask your habits</p>
                <p className="ml-auto mt-5 w-fit max-w-[88%] rounded-3xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground">
                  Which day do I skip most?
                </p>
                <div className="mt-4 flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-violet to-brand-coral text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[15px] leading-relaxed text-foreground">
                    <strong className="font-bold">Tuesday.</strong> You missed your morning walk on 6
                    of the last 10 Tuesdays, more than any other day of the week.
                  </p>
                </div>
                <div className="mt-auto pt-5">
                  <div className="border-t border-border pt-4">
                    <p className="label">Evidence</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {example.tuesdays.map((day) => (
                        <li
                          key={day}
                          className="rounded-full bg-highlight px-2.5 py-1 text-xs font-bold text-highlight-foreground"
                        >
                          {day}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>

              <article
                data-reveal
                style={delay(120)}
                className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="label">Weekly review</p>
                  <p className="text-xs font-semibold text-muted-foreground">Week of {example.reviewWeek}</p>
                </div>
                <dl className="mt-4 space-y-2.5">
                  {review.map((row) => (
                    <div
                      key={row.label}
                      style={vars({ "--tone": `var(${row.tone})` })}
                      className="rounded-2xl bg-[hsl(var(--tone)/0.1)] px-4 py-3"
                    >
                      <dt className="flex items-center gap-2 text-xs font-bold text-foreground/75">
                        <span className="h-2 w-2 rounded-full bg-[hsl(var(--tone))]" />
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-[15px] font-medium leading-snug text-foreground">{row.text}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="people-title" className="bg-card/70">
          <div className="container py-20 sm:py-28">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">People using it</p>
              <h2 id="people-title" className="type-heading mt-5 text-4xl sm:text-[3.25rem]">
                Small actions, repeated
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
            className="group relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-[linear-gradient(125deg,hsl(252_100%_60%)_0%,hsl(282_85%_52%)_60%,hsl(318_80%_50%)_100%)] px-6 py-14 text-white shadow-soft sm:px-12 sm:py-16 md:grid-cols-[1fr_auto] lg:px-16"
          >
            <div aria-hidden className="glow -right-20 -top-24 h-72 w-72 bg-brand-coral opacity-60" />
            <div aria-hidden className="glow -bottom-28 left-1/4 h-64 w-64 bg-brand-sun opacity-30" />

            <div className="relative">
              <h2 className="type-display text-[clamp(2.75rem,7vw,5rem)]">
                Today's square
                <br />
                is still empty.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">
                Pick one habit, check it off tonight, and let the log build from there.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-highlight px-8 text-base font-bold text-highlight-foreground shadow-[0_14px_30px_-12px_hsl(43_100%_50%/0.7)] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[hsl(282_85%_52%)]"
              >
                Start tracking
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div
              aria-hidden
              className="relative hidden h-44 w-44 rotate-[-6deg] items-center justify-center rounded-[2rem] border-[3px] border-dashed border-white/50 transition-all duration-500 group-hover:rotate-0 group-hover:border-solid group-hover:border-highlight group-hover:bg-highlight group-focus-within:rotate-0 group-focus-within:border-highlight group-focus-within:bg-highlight md:flex lg:h-52 lg:w-52"
            >
              <svg viewBox="0 0 48 48" className="cta-check h-20 w-20 text-highlight-foreground">
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

      <footer className="border-t border-border">
        <div className="container flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-6 w-6 gap-[2px]" />
            <span className="font-bricolage font-extrabold tracking-tight">HabitTracker</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 HabitTracker · Built for consistency</p>
        </div>
      </footer>
    </div>
  );
}
