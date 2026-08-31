/**
 * api/ai-insights.ts
 *
 * Serverless function for evidence-backed AI Insights endpoint.
 *
 * Security & Integrity:
 *  - Authorization required via JWT Bearer token evaluated server-side.
 *  - Derives identity exclusively from supabase.auth.getUser().
 *  - Uses canonical HabitAIContext with deterministic analytics + Zod validation.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticate, isAuthSuccess } from "./_lib/auth";
import { getCanonicalAIContext } from "./_lib/ai-context";
import { generateStructuredAIResponse, AIProviderError } from "./_lib/ai";
import { buildInsightPrompt } from "./_lib/prompts";
import {
  AIInsightsRequestSchema,
  AIInsightsResponseSchema,
  AIInsightsLLMOutputSchema,
  type AIInsightsResponse,
} from "./_lib/schemas";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function parseRequestBody(body: unknown): Record<string, unknown> {
  if (!body) return {};
  if (typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 1. Authenticate request
    const auth = await authenticate(req);
    if (!isAuthSuccess(auth)) {
      return res.status(auth.status).json({ error: auth.error });
    }
    const { user, supabase } = auth;

    // 2. Validate request body parameters
    const rawBody = parseRequestBody(req.body);
    const parseReq = AIInsightsRequestSchema.safeParse(rawBody);
    const { period, timezoneOffset } = parseReq.success
      ? parseReq.data
      : { period: "30d" as const, timezoneOffset: 0 };
    const periodDays = period === "90d" ? 90 : 30;
    // 3. Check Cache
    const { data: cacheRow } = await supabase
      .from("ai_insights_cache")
      .select("insights, generated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cacheRow?.insights && cacheRow?.generated_at) {
      const age = Date.now() - new Date(cacheRow.generated_at).getTime();
      if (age < CACHE_TTL_MS) {
        // Validate cached payload structure before returning
        const cacheValid = AIInsightsResponseSchema.safeParse(cacheRow.insights);
        if (cacheValid.success) {
          return res.status(200).json(cacheValid.data);
        }
      }
    }

    // 4. Build canonical AI context from deterministic analytics
    const context = await getCanonicalAIContext(
      supabase,
      user.id,
      periodDays,
      new Date(),
      timezoneOffset
    );

    // If zero active habits exist, return empty insights cleanly
    if (context.activeHabitCount === 0) {
      const emptyPayload: AIInsightsResponse = {
        insights: [],
        generatedAt: new Date().toISOString(),
        dataPeriod: period,
      };
      return res.status(200).json(emptyPayload);
    }

    // 5. Generate structured AI response using Groq provider
    const { systemPrompt, userPrompt } = buildInsightPrompt(context);
    const aiOutput = await generateStructuredAIResponse({
      systemPrompt,
      userPrompt,
      schema: AIInsightsLLMOutputSchema,
    });

    const responsePayload: AIInsightsResponse = {
      insights: aiOutput.insights,
      generatedAt: new Date().toISOString(),
      dataPeriod: period,
    };

    // 6. Update cache (best-effort, non-blocking failure)
    try {
      await supabase.from("ai_insights_cache").upsert(
        {
          user_id: user.id,
          insights: responsePayload,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch {
      // Ignore cache write errors
    }

    return res.status(200).json(responsePayload);
  } catch (error: unknown) {
    if (error instanceof AIProviderError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
      });
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}

/** Helper to wrap schema for outer object matching if needed */
function zObjectWrapper<T extends typeof AIInsightsResponseSchema>(schema: T) {
  return schema;
}
