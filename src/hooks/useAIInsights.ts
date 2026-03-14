import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface AIInsights {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  motivation: string;
}

export function useAIInsights() {
  const [data, setData] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You must be logged in to generate insights.");
      }

      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const raw = await res.text();
      const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

      if (!raw?.trim()) {
        if (!res.ok && res.status >= 500) {
          throw new Error(
            "AI insights API is unavailable locally. Start npm run dev:vercel on port 3000, then retry.",
          );
        }

        throw new Error(
          res.ok
            ? "AI insights API returned an empty response."
            : `AI insights API request failed (${res.status}) with an empty response.`,
        );
      }

      const trimmed = raw.trim();
      const isHtmlResponse =
        contentType.includes("text/html") ||
        trimmed.startsWith("<!DOCTYPE html") ||
        trimmed.startsWith("<html");

      if (isHtmlResponse) {
        throw new Error(
          "AI insights API returned HTML instead of JSON. Start local API runtime with npm run dev:vercel.",
        );
      }

      let body: unknown;
      try {
        body = JSON.parse(trimmed);
      } catch {
        throw new Error("AI insights API returned invalid JSON.");
      }

      if (!res.ok) {
        const apiMessage =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : `AI insights API request failed with status ${res.status}.`;

        throw new Error(apiMessage);
      }

      const parsed = body as Partial<AIInsights>;
      if (
        !parsed ||
        typeof parsed.summary !== "string" ||
        !Array.isArray(parsed.strengths) ||
        !Array.isArray(parsed.weaknesses) ||
        !Array.isArray(parsed.suggestions) ||
        typeof parsed.motivation !== "string"
      ) {
        throw new Error("AI insights API returned malformed JSON payload.");
      }

      setData(parsed as AIInsights);
    } catch (err: unknown) {
      if (err instanceof TypeError) {
        setError(
          "Could not reach AI insights API. For local development, start the runtime with npm run dev:vercel.",
        );
        return;
      }

      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, generate };
}
