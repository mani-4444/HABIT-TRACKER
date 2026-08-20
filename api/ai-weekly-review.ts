/**
 * api/ai-weekly-review.ts
 *
 * Weekly Performance Review API Endpoint.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticate, isAuthSuccess } from "./_lib/auth";
import { getCanonicalAIContext } from "./_lib/ai-context";
import { generateStructuredAIResponse, AIProviderError } from "./_lib/ai";
import { buildWeeklyReviewPrompt } from "./_lib/prompts";
import {
  WeeklyReviewRequestSchema,
  WeeklyReviewSchema,
  type WeeklyReview,
} from "./_lib/schemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await authenticate(req);
  if (!isAuthSuccess(auth)) {
    return res.status(auth.status).json({ error: auth.error });
  }
  const { user, supabase } = auth;

  const parseReq = WeeklyReviewRequestSchema.safeParse(req.body || {});
  const { weekOffset, timezoneOffset } = parseReq.success
    ? parseReq.data
    : { weekOffset: 0, timezoneOffset: 0 };

  try {
    const context = await getCanonicalAIContext(
      supabase,
      user.id,
      30,
      new Date(),
      timezoneOffset
    );

    if (context.activeHabitCount === 0) {
      const emptyReview: WeeklyReview = {
        headline: "No Habits Tracked Yet",
        wins: ["Added account successfully"],
        changes: ["No active habits found"],
        focusArea: "Create your first habit",
        nextWeekPlan: ["Add 1 daily habit"],
        experiment: "Try tracking 1 small habit for 7 days.",
      };
      return res.status(200).json(emptyReview);
    }

    const { systemPrompt, userPrompt } = buildWeeklyReviewPrompt(context, weekOffset);
    const reviewPayload = await generateStructuredAIResponse({
      systemPrompt,
      userPrompt,
      schema: WeeklyReviewSchema,
    });

    return res.status(200).json(reviewPayload);
  } catch (error: unknown) {
    if (error instanceof AIProviderError) {
      return res.status(error.statusCode).json({ error: error.message, code: error.code });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
