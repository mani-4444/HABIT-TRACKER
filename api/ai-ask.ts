/**
 * api/ai-ask.ts
 *
 * "Ask Your Habits" Natural Language Question Answering Endpoint.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticate, isAuthSuccess } from "./_lib/auth";
import { getCanonicalAIContext } from "./_lib/ai-context";
import { generateStructuredAIResponse, AIProviderError } from "./_lib/ai";
import { buildAskHabitsPrompt } from "./_lib/prompts";
import { classifyQuestionIntent } from "./_lib/question-router";
import {
  AskHabitsRequestSchema,
  AskHabitsResponseSchema,
  type AskHabitsResponse,
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

  const parseReq = AskHabitsRequestSchema.safeParse(req.body || {});
  if (!parseReq.success) {
    return res.status(400).json({ error: "Invalid question. Please provide a non-empty question under 500 characters." });
  }

  const { question, timezoneOffset } = parseReq.data;
  const intent = classifyQuestionIntent(question);

  if (intent === "OUT_OF_DOMAIN") {
    const fallback: AskHabitsResponse = {
      answer: "I can only answer questions related to your tracked habits, routines, streaks, and completion history.",
      evidence: [],
      intent: "OUT_OF_DOMAIN",
    };
    return res.status(200).json(fallback);
  }

  try {
    const context = await getCanonicalAIContext(
      supabase,
      user.id,
      30,
      new Date(),
      timezoneOffset
    );

    const { systemPrompt, userPrompt } = buildAskHabitsPrompt(context, question, intent);
    const askResponse = await generateStructuredAIResponse({
      systemPrompt,
      userPrompt,
      schema: AskHabitsResponseSchema,
    });

    return res.status(200).json(askResponse);
  } catch (error: unknown) {
    if (error instanceof AIProviderError) {
      return res.status(error.statusCode).json({ error: error.message, code: error.code });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: message });
  }
}
