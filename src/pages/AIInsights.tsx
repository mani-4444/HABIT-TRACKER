import { useState } from "react";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Brain,
  WandSparkles,
  HelpCircle,
  CalendarCheck,
  Send,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAIInsights } from "@/hooks/useAIInsights";
import { InsightCard } from "@/components/ai/InsightCard";
import { AIStatus } from "@/components/ai/AIStatus";
import { supabase } from "@/lib/supabase";
import type { AskHabitsResponse, WeeklyReview } from "@/lib/ai-types";

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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || askLoading) return;

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
          question: question.trim(),
          timezoneOffset: -new Date().getTimezoneOffset(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to answer question.");
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

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load Weekly Review.");
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
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header Banner */}
      <section className="rounded-[1.9rem] border border-border/70 bg-gradient-to-br from-card via-card/90 to-accent/20 p-6 shadow-soft lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Brain className="h-3.5 w-3.5 text-primary" />
              Habit Intelligence Hub
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-5xl">
              AI Coaching & Insights
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              Evidence-grounded behavioral intelligence derived directly from your tracked habit data, trends, and logging patterns.
            </p>
          </div>

          <div className="self-start lg:self-auto">
            <AIStatus
              status={isLoading ? "loading" : aiResponse ? "ready" : "idle"}
              signalCount={totalEvidenceCount}
              lastGeneratedAt={aiResponse?.generatedAt}
              dataPeriod={period}
            />
          </div>
        </div>
      </section>

      {/* Generator Card */}
      <Card variant="feature" className="rounded-[1.9rem] border-primary/20 bg-card/65 shadow-soft">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-inner-soft">
              <WandSparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-display text-2xl font-bold">
                Run Pattern Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Synthesize your habits, streaks, weekday parity, and logging-time patterns into evidence-backed guidance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-border bg-card p-1">
                <Button
                  size="sm"
                  variant={period === "30d" ? "default" : "ghost"}
                  className="h-8 rounded-lg text-xs"
                  onClick={() => setPeriod("30d")}
                >
                  30 Days
                </Button>
                <Button
                  size="sm"
                  variant={period === "90d" ? "default" : "ghost"}
                  className="h-8 rounded-lg text-xs"
                  onClick={() => setPeriod("90d")}
                >
                  90 Days
                </Button>
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
        </CardHeader>

        <CardContent className="space-y-6">
          {error && !isLoading && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive shadow-xs">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
              <div className="h-40 animate-pulse rounded-2xl bg-muted/60" />
            </div>
          )}

          {/* Render Insights List */}
          {aiResponse && !isLoading && (
            <div className="space-y-6">
              {aiResponse.insights.length === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-card/75 p-8 text-center shadow-xs">
                  <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground/45" />
                  <p className="text-base font-medium text-foreground">
                    No active habits found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add and complete habits to unlock evidence-backed AI coaching.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {aiResponse.insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ask Your Habits Section */}
      <Card variant="feature" className="rounded-[1.9rem] border-border/70 bg-card/70 shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Ask Your Habits</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Ask natural language questions grounded in your historical data.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which habit should I focus on improving this week?"
              className="rounded-xl"
              disabled={askLoading}
            />
            <Button type="submit" disabled={askLoading || !question.trim()} className="rounded-xl px-5">
              {askLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          {askError && (
            <p className="text-xs text-destructive">{askError}</p>
          )}

          {askResult && (
            <div className="rounded-xl border border-primary/20 bg-card p-4 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  Intent: {askResult.intent}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {askResult.answer}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Review Section */}
      <Card variant="feature" className="rounded-[1.9rem] border-border/70 bg-card/70 shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-xl font-bold">Weekly Performance Review</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFetchWeeklyReview}
              disabled={weeklyLoading}
              className="rounded-xl"
            >
              {weeklyLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              {weeklyReview ? "Refresh Review" : "Generate Review"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {weeklyError && (
            <p className="text-xs text-destructive">{weeklyError}</p>
          )}

          {!weeklyReview && !weeklyLoading && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Click above to generate a structured weekly breakdown of your wins, changes, and next week plan.
            </p>
          )}

          {weeklyReview && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h4 className="font-bold text-foreground text-base">{weeklyReview.headline}</h4>
                <p className="text-xs text-muted-foreground mt-1">Focus Area: <span className="font-semibold text-foreground">{weeklyReview.focusArea}</span></p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Top Wins</p>
                  <ul className="space-y-1">
                    {weeklyReview.wins.map((w, idx) => (
                      <li key={idx} className="text-xs text-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Key Shifts</p>
                  <ul className="space-y-1">
                    {weeklyReview.changes.map((c, idx) => (
                      <li key={idx} className="text-xs text-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {weeklyReview.experiment && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                  <p className="text-xs font-bold text-primary flex items-center gap-1">
                    <Lightbulb className="h-3.5 w-3.5" /> 7-Day Experiment
                  </p>
                  <p className="text-xs text-foreground mt-1">{weeklyReview.experiment}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
