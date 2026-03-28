import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Heart,
  Brain,
  WandSparkles,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAIInsights } from "@/hooks/useAIInsights";

export default function AIInsights() {
  const {
    data: aiInsights,
    isLoading: aiLoading,
    error: aiError,
    generate: generateInsights,
  } = useAIInsights();

  const handleGenerateInsights = async () => {
    await generateInsights();
  };

  const insightsCount = aiInsights
    ? aiInsights.strengths.length +
      aiInsights.weaknesses.length +
      aiInsights.suggestions.length
    : 0;

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <section className="rounded-[1.9rem] border border-border/70 bg-gradient-to-br from-card via-card/90 to-accent/20 p-6 shadow-soft lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Brain className="h-3.5 w-3.5 text-primary" />
              Insight Engine
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground lg:text-5xl">
              AI Insights Dashboard
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              Personalized guidance based on recent habit completion patterns,
              consistency signals, and trend shifts.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 self-start lg:self-auto">
            <div className="rounded-2xl border border-border/65 bg-card/80 px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {aiLoading ? "Running" : aiInsights ? "Ready" : "Idle"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/65 bg-card/80 px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Signals
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {insightsCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border/65 bg-card/80 px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Mode
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">
                Adaptive
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card
        variant="feature"
        className="rounded-[1.9rem] border-primary/20 bg-card/65 shadow-soft transition-all duration-300"
      >
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 shadow-inner-soft">
              <WandSparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-display text-3xl font-bold">
                Generate Fresh Insights
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Run a new AI pass to get updated strengths, risks, and next-step
                suggestions.
              </p>
            </div>
            <Button
              onClick={handleGenerateInsights}
              disabled={aiLoading}
              size="lg"
              variant={aiInsights ? "outline" : "hero"}
              className="min-h-11 rounded-2xl px-8"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Your Patterns...
                </>
              ) : aiInsights ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate Insights
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {aiError && !aiLoading && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive shadow-sm">
              {aiError}
            </div>
          )}

          {!aiInsights && !aiLoading && !aiError && (
            <div className="rounded-2xl border border-border/70 bg-card/75 p-8 text-center shadow-sm">
              <Sparkles className="mx-auto mb-3 h-11 w-11 text-muted-foreground/45" />
              <p className="text-base font-medium text-foreground">
                No insights generated yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Trigger the AI analysis to unlock actionable recommendations for
                your routines.
              </p>
            </div>
          )}

          {aiLoading && (
            <div className="space-y-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          )}

          {aiInsights && !aiLoading && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/70 bg-accent/25 p-5 shadow-inner-soft">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Executive Summary
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {aiInsights.summary}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-success/35 bg-success-muted/40 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.strengths.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-foreground/90"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-warning/35 bg-warning/10 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning-foreground">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Areas To Improve
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.weaknesses.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-foreground/90"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Lightbulb className="h-4 w-4" />
                  Suggested Actions
                </div>
                <ul className="grid gap-2 md:grid-cols-2">
                  {aiInsights.suggestions.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 rounded-xl border border-border/60 bg-card/75 px-3 py-2 text-sm text-foreground/90"
                    >
                      <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10 p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <Heart className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Motivation Pulse
                    </p>
                    <p className="mt-1 text-sm italic leading-relaxed text-foreground/95">
                      {aiInsights.motivation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/75 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  Insight Health
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Insights are generated from your latest habit activity. Re-run
                  analysis after new check-ins for higher accuracy.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
