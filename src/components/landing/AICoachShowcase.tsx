import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Brain, CalendarCheck, Lightbulb, MessageCircle, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { format, previousTuesday, startOfWeek, subDays, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { useTypewriter } from "./useTypewriter";

const tone = (t: string) => ({ "--tone": `var(${t})` }) as CSSProperties;

const TABS = [
  {
    id: "insights",
    label: "Pattern insights",
    blurb: "Spots streaks, slumps and weak days you'd miss on your own.",
    icon: Brain,
  },
  {
    id: "review",
    label: "Weekly review",
    blurb: "Every week: your wins, what shifted, one focus and one experiment.",
    icon: CalendarCheck,
  },
  {
    id: "ask",
    label: "Ask your log",
    blurb: "Plain questions, answered from your own history.",
    icon: MessageCircle,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Starts true once the element has scrolled into view. */
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, seen };
}

function InsightsPanel() {
  const cards = [
    {
      type: "Strength",
      tone: "--tone-mint",
      icon: TrendingUp,
      title: "Reading is your anchor habit",
      text: "14 days in a row, your longest run this quarter. On days you read, you're twice as likely to journal.",
      evidence: ["Streak: 14 days", "30-day rate: 93%"],
    },
    {
      type: "Risk",
      tone: "--tone-rose",
      icon: AlertTriangle,
      title: "Weekends break your no-sugar streak",
      text: "7 of your last 9 slips happened on a Saturday or Sunday.",
      evidence: ["Sat + Sun: 7 slips", "Weekdays: 2 slips"],
      action: "Plan one weekend dessert in advance so it isn't a slip.",
    },
  ];
  return (
    <div className="stagger space-y-3">
      {cards.map((c) => (
        <article key={c.title} style={tone(c.tone)} className="rounded-2xl border border-border/60 bg-background/70 p-4">
          <span className="tone-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            <c.icon className="h-3.5 w-3.5 text-[hsl(var(--tone))]" />
            {c.type}
          </span>
          <h4 className="mt-2.5 font-display text-lg font-bold leading-snug">{c.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {c.evidence.map((e) => (
              <li key={e} className="rounded-full bg-highlight px-2.5 py-1 text-xs font-bold text-highlight-foreground">
                {e}
              </li>
            ))}
          </ul>
          {c.action && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-primary/10 p-2.5 text-xs font-medium text-foreground">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {c.action}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}

function ReviewPanel() {
  const week = format(subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7), "d MMM");
  const rows = [
    { label: "Win", tone: "--tone-mint", text: "Read every day this week, 7 of 7." },
    { label: "Shift", tone: "--tone-rose", text: "Evening habits slipped after 9 PM on three days." },
    { label: "Focus", tone: "--tone-orange", text: "Protect the last hour before bed." },
    { label: "Try for 7 days", tone: "--tone-amber", text: "Phone on the charger by 8:45 PM, then log how the evening went." },
  ];
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">Week of {week}</p>
      <h4 className="mt-1 font-display text-xl font-bold leading-snug">A steady week, carried by reading and walks</h4>
      <dl className="stagger mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} style={tone(r.tone)} className="rounded-2xl bg-[hsl(var(--tone)/0.11)] px-4 py-3">
            <dt className="flex items-center gap-2 text-xs font-bold text-foreground/75">
              <span className="tone-dot h-2 w-2 rounded-full" />
              {r.label}
            </dt>
            <dd className="mt-1 text-[15px] font-medium leading-snug text-foreground">{r.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function AskPanel({ active }: { active: boolean }) {
  const qa = useMemo(() => {
    const lastTuesday = previousTuesday(new Date());
    const tuesdays = [0, 1, 3, 5, 6, 9].map((w) => format(subWeeks(lastTuesday, w), "EEE d MMM"));
    return [
      {
        q: "Which day do I skip most?",
        a: "Tuesday. You missed your morning walk on 6 of the last 10 Tuesdays, more than any other day of the week.",
        evidence: tuesdays,
      },
      {
        q: "Which habit is slipping?",
        a: "Journaling. Just 2 entries in the last 14 days, down from 6 the two weeks before. A one-line entry tonight keeps it alive.",
        evidence: ["Last 14 days: 2", "Previous 14 days: 6"],
      },
      {
        q: "What should I focus on this week?",
        a: "Your evenings. Three of your four misses this week came after 9 PM, so protecting the last hour before bed covers most of them.",
        evidence: ["3 of 4 misses after 9 PM", "Mornings: 0 misses"],
      },
    ];
  }, []);
  const [index, setIndex] = useState(0);
  const current = qa[index];
  const typed = useTypewriter(current.a, active, 20);

  return (
    <div>
      <div className="min-h-[13.5rem] space-y-4">
        <p key={current.q} className="fade ml-auto w-fit max-w-[88%] rounded-3xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground">
          {current.q}
        </p>
        <div className="flex gap-3">
          <span className="ai-orb mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p aria-live="polite" className="sr-only">{current.a}</p>
            <p aria-hidden className="text-[15px] leading-relaxed text-foreground">
              {typed.shown}
              {!typed.done && <span className="type-caret" />}
            </p>
            {typed.done && (
              <div className="fade mt-3">
                <p className="eyebrow text-[10px]">Evidence</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {current.evidence.map((e) => (
                    <li key={e} className="rounded-full bg-highlight px-2.5 py-1 text-xs font-bold text-highlight-foreground">
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-border/60 pt-4">
        <p className="eyebrow text-[10px]">Try asking</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {qa.map((item, i) => (
            <button
              key={item.q}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === index
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/70 bg-card/80 text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground",
              )}
            >
              {item.q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AICoachShowcase() {
  const [tab, setTab] = useState<TabId>("ask");
  const { ref, seen } = useSeen<HTMLDivElement>();

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
      <div data-reveal className="lg:sticky lg:top-24">
        <p className="ai-border inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Bodhi, your AI habit coach
        </p>
        <h2 id="coach-title" className="mt-5 font-display text-4xl font-bold leading-[1.02] sm:text-5xl">
          Meet Bodhi.
          <span className="block text-primary">It shows its work.</span>
        </h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
          Bodhi is your AI habit coach. It reads your whole log, not a generic playbook. Every insight, review and answer points
          back to the exact days it came from, so you can check it yourself.
        </p>

        <div role="tablist" aria-label="What Bodhi does" className="mt-8 space-y-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`ai-tab-${t.id}`}
                aria-selected={active}
                aria-controls="ai-panel"
                onClick={() => setTab(t.id)}
                className={cn(
                  "group flex w-full items-start gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary/40 bg-card/90 shadow-soft"
                    : "border-transparent hover:border-border/70 hover:bg-card/60",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
                    active ? "ai-orb" : "bg-primary/10 text-primary",
                  )}
                >
                  <t.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold text-foreground">{t.label}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{t.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={ref} data-reveal style={{ "--d": "120ms" } as CSSProperties}>
        <div className="ai-border rounded-[2rem] p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/60 pb-4">
            <span className="flex items-center gap-2.5 whitespace-nowrap font-display text-lg font-bold">
              <span className="ai-orb flex h-8 w-8 items-center justify-center rounded-xl">
                <Sparkles className="h-4 w-4" />
              </span>
              Bodhi
            </span>
            <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Grounded in your log
            </span>
          </div>
          <div id="ai-panel" role="tabpanel" aria-labelledby={`ai-tab-${tab}`} key={tab} className="fade">
            {tab === "insights" && <InsightsPanel />}
            {tab === "review" && <ReviewPanel />}
            {tab === "ask" && <AskPanel active={seen} />}
          </div>
        </div>
      </div>
    </div>
  );
}
