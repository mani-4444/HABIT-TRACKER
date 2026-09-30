import { useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  WandSparkles,
  HelpCircle,
  CalendarCheck,
  Send,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toneStyle } from "@/lib/tones";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAIInsights } from "@/hooks/useAIInsights";
import { InsightCard } from "@/components/ai/InsightCard";
import { AIStatus } from "@/components/ai/AIStatus";
import { supabase } from "@/lib/supabase";
import type { AskHabitsResponse, WeeklyReview } from "@/lib/ai-types";

const SUGGESTED_QUESTIONS = [
  "Which habit needs the most attention?",
  "Am I more consistent on weekdays or weekends?",
  "Which habits are at risk of breaking streaks?",
  "What is my strongest habit pairing?",
];

export default function AIInsightsPage() {
  const [period, setPeriod] = useState<"30d" | "90d">("30d");
  const { data: aiResponse, isLoading, error, generate } = useAIInsights(period);

  // Ask Your Habits single-turn state
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState<AskHabitsResponse | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  // Weekly Review state
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      await generate();
    } catch {
      // Error handled by hook
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const queryText = (customQuestion || question).trim();
    if (!queryText || askLoading) return;

    if (customQuestion) {
      setQuestion(customQuestion);
    }

    setAskLoading(true);
    setAskError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Log in required.");
      }

      const res = await fetch("/api/ai-ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question: queryText,
          timezoneOffset: -new Date().getTimezoneOffset(),
        }),
      });

      const raw = await res.text();
      let json: AskHabitsResponse;
      try {
        json = JSON.parse(raw);
      } catch {
        if (raw.includes("FUNCTION_INVOCATION_FAILED") || res.status >= 500) {
          throw new Error("Server error: Please ensure GROQ_API_KEY, VITE_SUPABASE_URL, and VITE_SUPABASE_ANON_KEY are set in your Vercel Project Environment Variables.");
        }
        if (!res.ok) {
          throw new Error(`AI request error (${res.status}): ${raw.slice(0, 120)}`);
        }
        throw new Error("Failed to parse AI response.");
      }

      if (!res.ok) {
        const errorMsg = typeof json === "object" && json && "error" in (json as unknown as { error: string })
          ? (json as unknown as { error: string }).error
          : `API error (${res.status})`;
        throw new Error(errorMsg);
      }

      setAskResult(json);
    } catch (err: unknown) {
      setAskError(err instanceof Error ? err.message : "Error asking question");
    } finally {
      setAskLoading(false);
    }
  };

  const handleFetchWeeklyReview = async () => {
    setWeeklyLoading(true);
    setWeeklyError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Log in required.");
      }

      const res = await fetch("/api/ai-weekly-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          timezoneOffset: -new Date().getTimezoneOffset(),
        }),
      });

      const raw = await res.text();
      let json: WeeklyReview;
      try {
        json = JSON.parse(raw);
      } catch {
        if (raw.includes("FUNCTION_INVOCATION_FAILED") || res.status >= 500) {
          throw new Error("Server error: Please ensure GROQ_API_KEY, VITE_SUPABASE_URL, and VITE_SUPABASE_ANON_KEY are set in your Vercel Project Environment Variables.");
        }
        if (!res.ok) {
          throw new Error(`AI request error (${res.status}): ${raw.slice(0, 120)}`);
        }
        throw new Error("Failed to parse Weekly Review response.");
      }

      if (!res.ok) {
        const errorMsg = typeof json === "object" && json && "error" in (json as unknown as { error: string })
          ? (json as unknown as { error: string }).error
          : `API error (${res.status})`;
        throw new Error(errorMsg);
      }

      setWeeklyReview(json);
    } catch (err: unknown) {
      setWeeklyError(err instanceof Error ? err.message : "Error fetching review");
    } finally {
      setWeeklyLoading(false);
    }
  };

  const totalEvidenceCount = aiResponse?.insights.reduce(
    (sum, ins) => sum + (ins.evidence?.length || 0),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Habit intelligence hub"
        title="AI"
        accent="coaching & insights."
        description="Evidence-grounded behavioral intelligence derived directly from your tracked habit data, trends, and logging patterns."
        actions={
          <AIStatus
            status={isLoading ? "loading" : aiResponse ? "ready" : "idle"}
            signalCount={totalEvidenceCount}
            lastGeneratedAt={aiResponse?.generatedAt}
            dataPeriod={period}
          />
        }
      />

      {/* Generator Card & Pattern Analysis */}
      <section className="ambient-panel relative overflow-hidden rounded-[1.9rem] p-5 sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-inner-soft">
            <WandSparkles className="h-7 w-7 text-primary" />
          </div>
          <div className="max-w-xl space-y-1">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Run Pattern Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Synthesize your habits, streaks, weekday parity, and logging-time patterns into evidence-backed guidance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div role="group" aria-label="Analysis period" className="flex items-center rounded-xl border border-border bg-card/80 p-1">
              {(["30d", "90d"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={period === p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "h-8 rounded-lg px-3 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    period === p
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === "30d" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              size="lg"
              variant={aiResponse ? "outline" : "hero"}
              className="min-h-11 rounded-2xl px-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Patterns...
                </>
              ) : aiResponse ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Analysis
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="relative mt-8 space-y-6">
          {error && !isLoading && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted/60" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          )}

          {/* Render Insights List */}
          {aiResponse && !isLoading && (
            aiResponse.insights.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-card/75 p-8 text-center">
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/45" />
                <p className="text-base font-medium text-foreground">
                  No active habits found
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add and complete habits to unlock evidence-backed AI coaching.
                </p>
              </div>
            ) : (
              <div className="stagger grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {aiResponse.insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )
          )}
        </div>
      </section>

      {/* Dual Section: Ask Your Habits + Weekly Review */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Ask Your Habits Section */}
        <section className="ambient-panel space-y-4 rounded-[1.9rem] p-5 sm:p-6 lg:col-span-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <HelpCircle className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold">Ask Your Habits</h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Ask natural language questions grounded in your historical data.
            </p>
          </div>

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <label htmlFor="ask-question" className="sr-only">
              Your question
            </label>
            <Input
              id="ask-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which habit should I focus on improving?"
              className="h-11 rounded-xl border-border/75 bg-background/80"
              disabled={askLoading}
            />
            <Button
              type="submit"
              aria-label="Ask"
              disabled={askLoading || !question.trim()}
              className="h-11 shrink-0 rounded-xl px-4"
            >
              {askLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          {/* Prompt Chips */}
          <div className="space-y-2">
            <p className="eyebrow text-[10px]">Suggested Questions</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAskQuestion(undefined, q)}
                  disabled={askLoading}
                  className="rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-left text-xs text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:opacity-60"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {askError && (
            <p className="text-xs text-destructive">{askError}</p>
          )}

          {askResult && (
            <div key={askResult.answer} className="page-enter flex gap-3 rounded-2xl border border-primary/20 bg-card/90 p-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-tone-amber text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="space-y-2">
                <Badge variant="outline" className="border-primary/30 text-[10px] font-semibold uppercase text-primary">
                  Intent: {askResult.intent}
                </Badge>
                <p className="text-sm font-medium leading-relaxed text-foreground">
                  {askResult.answer}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Weekly Performance Review */}
        <section className="ambient-panel rounded-[1.9rem] p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/15 text-success">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold">Weekly Performance Review</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFetchWeeklyReview}
              disabled={weeklyLoading}
              className="shrink-0 rounded-xl"
            >
              {weeklyLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              {weeklyReview ? "Refresh Review" : "Generate Review"}
            </Button>
          </div>

          <div className="mt-5">
            {weeklyError && (
              <p className="mb-3 text-xs text-destructive">{weeklyError}</p>
            )}

            {!weeklyReview && !weeklyLoading && (
              <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center">
                <CalendarCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="mx-auto max-w-sm text-xs text-muted-foreground">
                  Click above to generate a structured weekly breakdown of your wins, key shifts, focus area, and 7-day experiment.
                </p>
              </div>
            )}

            {weeklyReview && (
              <div className="stagger space-y-4 text-sm">
                <div style={toneStyle("--tone-mint")} className="tone-panel rounded-2xl p-4">
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground">{weeklyReview.headline}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Focus Area: <span className="font-semibold text-foreground">{weeklyReview.focusArea}</span>
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Top Wins", tone: "--tone-mint", items: weeklyReview.wins },
                    { title: "Key Shifts", tone: "--tone-amber", items: weeklyReview.changes },
                  ].map((group) => (
                    <div key={group.title} style={toneStyle(group.tone)} className="space-y-2 rounded-2xl border border-border/60 bg-background/60 p-3.5">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground/80">
                        <span className="tone-dot h-2 w-2 rounded-full" />
                        {group.title}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs leading-snug text-foreground">
                            <span className="tone-dot mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {weeklyReview.experiment && (
                  <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Lightbulb className="h-4 w-4 shrink-0" /> 7-Day Experiment
                    </p>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">{weeklyReview.experiment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
