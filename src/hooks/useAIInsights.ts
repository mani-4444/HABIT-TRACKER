import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { AIInsightsResponse } from "@/lib/ai-types";

export function useAIInsights(period: "30d" | "90d" = "30d") {
  const queryClient = useQueryClient();

  const fetchInsights = async (): Promise<AIInsightsResponse> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("You must be logged in to access AI Insights.");
    }

    const tzOffset = -new Date().getTimezoneOffset(); // client timezone offset in minutes

    const res = await fetch("/api/ai-insights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        period,
        timezoneOffset: tzOffset,
      }),
    });

    const raw = await res.text();
    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

    if (!raw?.trim()) {
      if (!res.ok && res.status >= 500) {
        throw new Error(
          "AI Insights API is unavailable locally. Run `npm run dev:vercel` on port 3000 to enable local AI API routes."
        );
      }
      throw new Error(`AI Insights API request failed (${res.status}).`);
    }

    if (contentType.includes("text/html") || raw.trim().startsWith("<!DOCTYPE html")) {
      throw new Error(
        "AI Insights API returned HTML instead of JSON. Start local API runtime with `npm run dev:vercel`."
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("AI Insights API returned invalid JSON.");
    }

    if (!res.ok) {
      const msg =
        typeof parsed === "object" && parsed !== null && "error" in parsed
          ? (parsed as { error: string }).error
          : `API error (${res.status})`;
      throw new Error(msg);
    }

    return parsed as AIInsightsResponse;
  };

  const query = useQuery({
    queryKey: ["ai-insights", period],
    queryFn: fetchInsights,
    enabled: false, // Do not fetch automatically on page load
    staleTime: 1000 * 60 * 30, // 30 mins stale time on client
    retry: 1,
  });

  const generateMutation = useMutation({
    mutationFn: fetchInsights,
    onSuccess: (data) => {
      queryClient.setQueryData(["ai-insights", period], data);
    },
  });

  return {
    data: (queryClient.getQueryData(["ai-insights", period]) as AIInsightsResponse) ?? query.data ?? null,
    isLoading: generateMutation.isPending,
    error: (generateMutation.error as Error)?.message || (query.error as Error)?.message || null,
    generate: generateMutation.mutateAsync,
    refetch: query.refetch,
  };
}
