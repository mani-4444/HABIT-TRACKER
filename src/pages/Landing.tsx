import { useLayoutEffect, useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { format, previousTuesday, startOfWeek, subDays, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Testimonial from "@/components/ui/testimonial";
import { HabitGridDemo } from "@/components/landing/HabitGridDemo";
import { LogoMark } from "@/components/landing/LogoMark";
import { useReveal } from "@/hooks/useReveal";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** How much log you'd have at each stage, drawn as squares. */
const steps = [
  {
    when: "Day 1",
    title: "Log it",
    body: "Add the habits you care about and tick each one off when it's done. One tap per habit.",
    squares: 1,
    highlighted: [] as number[],
  },
  {
    when: "Day 7",
    title: "Get your first weekly review",
    body: "Your wins, what shifted, one area to focus on, and a small experiment to try for the next seven days.",
    squares: 7,
    highlighted: [],
  },
  {
    when: "Day 30",
    title: "See the patterns",
    body: "With a month of history, trends show up: strong days, weak days, and streaks close to breaking.",
    squares: 30,
    highlighted: [],
  },
  {
    when: "Any day",
    title: "Ask your log",
    body: "Ask plain questions like “Which day do I skip most?” and get answers drawn from your own history.",
    squares: 30,
    highlighted: [1, 8, 15, 22, 29],
  },
];

function StepSquares({ count, highlighted }: { count: number; highlighted: number[] }) {
  return (
    <div aria-hidden className="grid w-fit grid-cols-10 content-end gap-1 sm:h-[58px]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-hl={highlighted.includes(i) ? "" : undefined}
          className="ledger-sq h-3.5 w-3.5 rounded-[3px]"
          style={{ "--i": i } as CSSProperties}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const pageRef = useReveal<HTMLDivElement>();

  // Landing uses the ledger palette; the rest of the app keeps its own for now.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-ledger");
    return () => root.classList.remove("theme-ledger");
  }, []);

  const example = useMemo(() => {
    const today = new Date();
    const lastTuesday = previousTuesday(today);
    const tuesdays = [0, 1, 3, 5, 6, 9].map((w) => format(subWeeks(lastTuesday, w), "EEE d MMM"));
    const reviewWeek = format(subDays(startOfWeek(today, { weekStartsOn: 1 }), 7), "d MMM");
    return { tuesdays, reviewWeek };
  }, []);

  return (
    <div ref={pageRef} className="relative min-h-screen w-full max-w-full overflow-x-hidden font-archivo">
      <header className="container relative z-10 flex h-20 items-center justify-between pr-16 sm:pr-[4.5rem]">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
        >
          <LogoMark />
          <span className="text-[17px] font-bold tracking-tight [font-stretch:85%]">HabitTracker</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden h-9 px-3 text-sm font-medium sm:inline-flex")}
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className={cn(buttonVariants({ size: "sm" }), "h-9 px-3.5 text-sm shadow-none")}
          >
            Start tracking
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container relative pb-20 pt-8 sm:pt-12 lg:pb-28 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div>
              <p className="eyebrow ledger-rise" style={delay(0)}>
                Habit tracker · AI coaching from your own log
              </p>
              <h1 className="type-poster mt-5 text-[clamp(4rem,13vw,8.5rem)] text-foreground">
                <span className="ledger-rise block" style={delay(90)}>
                  One square
                </span>
                <span className="ledger-rise block" style={delay(180)}>
                  a <mark className="ledger-swipe">day.</mark>
                </span>
              </h1>
              <p
                className="ledger-rise mt-7 max-w-[30rem] text-lg leading-relaxed text-muted-foreground"
                style={delay(280)}
              >
                Check off your habits each day. HabitTracker turns that log into weekly reviews and
                insights that point to the exact days behind them.
              </p>
              <div
                className="ledger-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
                style={delay(370)}
              >
                <Link
                  to="/signup"
                  className={cn(
                    buttonVariants({ size: "xl" }),
                    "group h-14 rounded-xl px-7 text-base shadow-soft",
                  )}
                >
                  Start tracking
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "xl" }),
                    "h-14 rounded-xl px-7 text-base font-medium shadow-none",
                  )}
                >
                  Log in
                </Link>
              </div>
            </div>

            <div className="ledger-rise" style={delay(220)}>
              <HabitGridDemo />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-title" className="border-t border-border/80 bg-card/50">
          <div className="container py-20 sm:py-28">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">How it works</p>
              <h2 id="how-title" className="type-heading mt-4 text-4xl sm:text-5xl">
                From the first checkmark to real patterns
              </h2>
            </div>

            <ol className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              {steps.map((step, i) => (
                <li key={step.when} data-reveal style={delay(i * 110)}>
                  <StepSquares count={step.squares} highlighted={step.highlighted} />
                  <p className="eyebrow mt-5">{step.when}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight">{step.title}</h3>
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
              <p className="eyebrow">AI coaching</p>
              <h2 id="coach-title" className="type-heading mt-4 text-4xl sm:text-5xl">
                Coaching that shows its work
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted-foreground">
                Every answer and every weekly review links back to the days it came from, so you
                can check it against your own log instead of taking it on faith.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <article data-reveal className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
                <p className="eyebrow">Ask your habits</p>
                <p className="ml-auto mt-5 w-fit max-w-[88%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-[15px] text-background">
                  Which day do I skip most?
                </p>
                <p className="mt-5 text-[15px] leading-relaxed text-foreground">
                  <strong className="font-bold">Tuesday.</strong> You missed your morning walk on 6 of
                  the last 10 Tuesdays, more than any other day of the week.
                </p>
                <div className="mt-auto pt-5">
                  <div className="border-t border-border pt-4">
                    <p className="eyebrow">Evidence</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {example.tuesdays.map((day) => (
                        <li
                          key={day}
                          className="rounded-md bg-highlight px-2 py-1 font-mono text-[11px] text-highlight-foreground"
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
                className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="eyebrow">Weekly review</p>
                  <p className="font-mono text-[11px] text-muted-foreground">Week of {example.reviewWeek}</p>
                </div>
                <dl className="mt-4 divide-y divide-border">
                  {[
                    ["Win", "Read every day this week, 7 of 7."],
                    ["Shift", "Evening habits slipped after 9 PM on three days."],
                    ["Focus", "Protect the last hour before bed."],
                    ["Try for 7 days", "Phone on the charger by 8:45 PM, then log how the evening went."],
                  ].map(([label, text]) => (
                    <div key={label} className="py-3.5 first:pt-2 last:pb-0">
                      <dt className="eyebrow text-[10px]">{label}</dt>
                      <dd className="mt-1 text-[15px] leading-snug text-foreground">{text}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="people-title" className="border-t border-border/80 bg-card/50">
          <div className="container py-20 sm:py-28">
            <div data-reveal className="max-w-2xl">
              <p className="eyebrow">People using it</p>
              <h2 id="people-title" className="type-heading mt-4 text-4xl sm:text-5xl">
                Small actions, repeated
              </h2>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
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
            className="group relative grid items-center gap-10 overflow-hidden rounded-[1.75rem] bg-foreground px-6 py-14 text-background sm:px-12 sm:py-16 md:grid-cols-[1fr_auto] lg:px-16"
          >
            <div>
              <h2 className="type-poster text-[clamp(3rem,8vw,5.75rem)]">
                Today's square
                <br />
                is still empty.
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-background/70">
                Pick one habit, check it off tonight, and let the log build from there.
              </p>
              <Link
                to="/signup"
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-highlight px-7 text-base font-semibold text-highlight-foreground transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-4 focus-visible:ring-offset-foreground"
              >
                Start tracking
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <div
              aria-hidden
              className="hidden h-44 w-44 items-center justify-center rounded-[1.75rem] border-[3px] border-background/35 transition-colors duration-500 group-hover:border-highlight group-hover:bg-highlight group-focus-within:border-highlight group-focus-within:bg-highlight md:flex lg:h-52 lg:w-52"
            >
              <svg viewBox="0 0 48 48" className="ledger-check h-20 w-20 text-highlight-foreground">
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

      <footer className="border-t border-border/80">
        <div className="container flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-5 w-5 gap-[2px]" />
            <span className="text-sm font-semibold [font-stretch:85%]">HabitTracker</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">© 2026 HabitTracker · Built for consistency</p>
        </div>
      </footer>
    </div>
  );
}
