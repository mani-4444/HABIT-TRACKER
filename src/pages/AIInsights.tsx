import {
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Heart,
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

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">AI Insights</h1>
        <p className="text-muted-foreground mt-1">
          Personalized suggestions based on your recent habit activity.
        </p>
      </div>

      <Card variant="feature" className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  AI Insights
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI suggestions are based on your recent habit activity.
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateInsights}
              disabled={aiLoading}
              size="sm"
              variant={aiInsights ? "outline" : "default"}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : aiInsights ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
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

        <CardContent>
          {aiError && !aiLoading && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {aiError}
            </div>
          )}

          {!aiInsights && !aiLoading && !aiError && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                Click the button above to get personalized insights powered by
                AI.
              </p>
            </div>
          )}

          {aiLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          )}

          {aiInsights && !aiLoading && (
            <div className="space-y-6">
              <div className="rounded-lg bg-accent/50 p-4">
                <p className="text-sm leading-relaxed">{aiInsights.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </div>
                  <ul className="space-y-1.5">
                    {aiInsights.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-500">
                    <AlertTriangle className="h-4 w-4" />
                    Areas to Improve
                  </div>
                  <ul className="space-y-1.5">
                    {aiInsights.weaknesses.map((w, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-start gap-2"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </div>
                <ul className="space-y-1.5">
                  {aiInsights.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed italic">
                    {aiInsights.motivation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
