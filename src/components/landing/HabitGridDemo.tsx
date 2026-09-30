import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { format, startOfDay } from "date-fns";
import { Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEMO_HABITS,
  DEMO_WEEKS,
  buildDemoCells,
  type DemoCell,
} from "./habit-demo-data";

const ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

function monthLabels(cells: DemoCell[]) {
  const labels: { col: number; text: string }[] = [];
  let previous = "";
  for (let col = 0; col < DEMO_WEEKS; col++) {
    const month = format(cells[col * 7].date, "MMM");
    if (month !== previous) labels.push({ col, text: month });
    previous = month;
  }
  // Drop the first label if the next one starts right after it and would collide.
  if (labels.length > 1 && labels[1].col - labels[0].col < 2) labels.shift();
  return labels;
}

export function HabitGridDemo() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [habitId, setHabitId] = useState(DEMO_HABITS[0].id);
  const [logged, setLogged] = useState<Record<string, boolean>>({});
  const [showEvidence, setShowEvidence] = useState(false);
  const [touched, setTouched] = useState(false);

  const habit = DEMO_HABITS.find((h) => h.id === habitId) ?? DEMO_HABITS[0];
  const isLogged = !!logged[habit.id];

  const baseCells = useMemo(() => buildDemoCells(today, habit), [today, habit]);
  const cells = useMemo(
    () =>
      isLogged
        ? baseCells.map((c) => (c.state === "today" ? { ...c, state: "done" as const } : c))
        : baseCells,
    [baseCells, isLogged],
  );

  const streak = habit.baseStreak + (isLogged ? 1 : 0);
  const insight = habit.insight(cells, streak);
  const evidenceOrder = new Map(insight.evidence.map((c, i) => [c.key, i]));
  const tracked = cells.filter((c) => c.state === "done" || c.state === "missed");
  const doneCount = tracked.filter((c) => c.state === "done").length;
  const rate = Math.round((doneCount / tracked.length) * 100);
  const months = useMemo(() => monthLabels(baseCells), [baseCells]);

  // Let the grid finish filling in before the insight marks its evidence.
  useEffect(() => {
    setShowEvidence(false);
    setTouched(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setShowEvidence(true), reduce ? 0 : 1250);
    return () => window.clearTimeout(timer);
  }, [habit.id]);

  const toggleToday = () => {
    setTouched(true);
    setLogged((prev) => ({ ...prev, [habit.id]: !prev[habit.id] }));
  };

  return (
    <div
      className="relative rounded-[1.75rem] border border-border bg-card/90 p-4 shadow-soft backdrop-blur-xl sm:p-6"
      style={cssVars({ "--habit": `var(${habit.tone})` })}
    >
      <div role="group" aria-label="Example habits" className="flex flex-wrap gap-2">
        {DEMO_HABITS.map((h) => {
          const active = h.id === habit.id;
          return (
            <button
              key={h.id}
              type="button"
              aria-pressed={active}
              onClick={() => setHabitId(h.id)}
              style={cssVars({ "--chip": `var(${h.tone})` })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                active
                  ? "border-[hsl(var(--chip))] bg-[hsl(var(--chip)/0.14)] text-foreground"
                  : "border-transparent bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--chip))]" />
              {h.name}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-5 sm:gap-7">
        <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--habit))] px-4 py-3 text-[hsl(247_52%_10%)] transition-colors duration-500">
          <Flame className="h-7 w-7 shrink-0" strokeWidth={2.4} />
          <div>
            <span key={`s-${habit.id}-${streak}`} className="type-number count text-[2.5rem] sm:text-5xl">
              {streak}
            </span>
            <p className="text-xs font-bold opacity-80">day streak</p>
          </div>
        </div>
        <div>
          <span key={`r-${habit.id}-${rate}`} className="type-number count text-[2.25rem] sm:text-[2.75rem]">
            {rate}%
          </span>
          <p className="label mt-1">done, last 12 weeks</p>
        </div>
      </div>

      <p className="sr-only">
        {habit.name}: done on {doneCount} of the last {tracked.length} days, current streak {streak} days.
      </p>

      <div
        key={habit.id}
        className="mt-6 grid gap-[3px] sm:gap-[5px]"
        style={{ gridTemplateColumns: `auto repeat(${DEMO_WEEKS}, minmax(0, 1fr))` }}
      >
        {months.map((m) => (
          <span
            key={m.col}
            aria-hidden
            className="whitespace-nowrap pb-1 text-[11px] font-semibold leading-none text-muted-foreground"
            style={{ gridColumn: m.col + 2, gridRow: 1 }}
          >
            {m.text}
          </span>
        ))}

        {ROW_LABELS.map((label, row) => (
          <span
            key={row}
            aria-hidden
            className="flex items-center pr-1.5 text-[11px] font-semibold leading-none text-muted-foreground sm:pr-2"
            style={{ gridColumn: 1, gridRow: row + 2 }}
          >
            {label}
          </span>
        ))}

        {cells.map((cell) => {
          const place = { gridColumn: cell.col + 2, gridRow: cell.row + 2 };
          const delay = cell.col * 55 + cell.row * 14;
          const evidenceIndex = evidenceOrder.get(cell.key);
          const highlighted = showEvidence && evidenceIndex !== undefined;
          const shape = "cell aspect-square w-full rounded-[4px] sm:rounded-[6px]";

          if (cell.offset === 0) {
            return (
              <button
                key={cell.key}
                type="button"
                onClick={toggleToday}
                aria-pressed={isLogged}
                aria-label={isLogged ? `Undo today's log for ${habit.name}` : `Log today for ${habit.name}`}
                title={format(cell.date, "EEE d MMM")}
                style={{ ...place, ...cssVars({ "--d": `${delay}ms`, "--e": 0 }) }}
                className={cn(
                  shape,
                  "relative before:absolute before:-inset-1.5 before:content-['']",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  isLogged
                    ? cn("cell-stamp", highlighted ? "cell-evidence" : "cell-done")
                    : cn("cell-today", touched && "cell-today-idle"),
                )}
              />
            );
          }

          return (
            <span
              key={cell.key}
              aria-hidden
              title={format(cell.date, "EEE d MMM")}
              style={{ ...place, ...cssVars({ "--d": `${delay}ms`, "--e": evidenceIndex ?? 0 }) }}
              className={cn(
                shape,
                highlighted
                  ? "cell-evidence"
                  : cell.state === "done"
                    ? "cell-done"
                    : cell.state === "missed"
                      ? "cell-missed"
                      : "cell-future",
              )}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p aria-live="polite" className="text-[13px] text-muted-foreground">
          {isLogged ? (
            <>
              <span className="font-bold text-foreground">Logged!</span> {streak} days in a row.
            </>
          ) : (
            <>Today's square is empty. Tap it to log.</>
          )}
        </p>
        <div aria-hidden className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[hsl(var(--habit))]" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] shadow-[inset_0_0_0_1.5px_hsl(var(--foreground)/0.2)]" /> Missed
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-[hsl(var(--habit)/0.14)] to-[hsl(var(--sun)/0.14)] p-4 transition-colors duration-500">
        <p className="flex items-center gap-2 text-xs font-bold text-foreground/80">
          <Sparkles className="h-3.5 w-3.5 text-brand-text" />
          AI insight · from {insight.evidence.length} highlighted days
        </p>
        <p
          key={`i-${habit.id}`}
          className="fade mt-1.5 text-[15px] font-semibold leading-snug text-foreground"
          style={cssVars({ "--d": "200ms" })}
        >
          {insight.text}
        </p>
      </div>
    </div>
  );
}
