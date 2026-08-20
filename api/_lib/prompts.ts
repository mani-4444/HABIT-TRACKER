/**
 * api/_lib/prompts.ts
 *
 * System & User Prompt Builders for all Habit Coaching AI features.
 *
 * Key Instructions built into every prompt:
 *  - STRICT GROUNDING: State only facts derived from the supplied HabitAIContext. Never invent habits, metrics, or timestamps.
 *  - LOGGING VS DOING TIME: completed_at timestamps represent when the habit was LOGGED in the app, not necessarily when the physical activity occurred. Describe time patterns as logging behavior.
 *  - EVIDENCED INSIGHTS: Every insight must cite specific evidence from the context's evidence list.
 *  - CONFIDENCE: High confidence requires strong historical data (>14 days, consistency score available).
 */

import type { HabitAIContext } from "./ai-context";
import type { QuestionIntent } from "./schemas";

export function buildInsightPrompt(context: HabitAIContext) {
  const systemPrompt = `
You are an expert Habit Intelligence & Behavioral Coach. Analyze the user's habit data and return 3-5 evidence-backed insights as a JSON object.

RULES:
- Base ALL claims only on the provided context. Never invent data.
- Timestamps = when the habit was LOGGED in the app (say "tend to log" not "tend to do").
- Every insight must cite at least 1 evidence item from the context.
- Return ONLY valid JSON: {"insights":[{"id":"str","type":"STRENGTH|RISK|OPPORTUNITY|PATTERN|CORRELATION|RECOVERY","title":"str","explanation":"str","evidence":[{"type":"STREAK_CHANGE|CONSISTENCY_SCORE|PERIOD_TREND|WEEKDAY_PARITY|CROSS_HABIT_CORRELATION|LOGGING_TIME_PATTERN|COMPLETION_RATE|TODO_COMPLETION","metric":"str","value":"str|num","comparisonValue":"str|num (optional)","habitName":"str (optional)"}],"recommendation":"str","confidence":"HIGH|MEDIUM|LOW","priority":"HIGH|MEDIUM|LOW"}]}
`.trim();

  const userPrompt = `Analyze this HabitAIContext and generate 3-5 high-impact insights:\n${JSON.stringify(context)}`;

  return { systemPrompt, userPrompt };
}

export function buildWeeklyReviewPrompt(context: HabitAIContext, weekOffset: number = 0) {
  const systemPrompt = `
You are a Habit Coach generating a Weekly Performance Review. Ground all claims in the supplied context. Be encouraging and analytical. Return ONLY valid JSON: {"headline":"str","wins":["str"],"changes":["str"],"focusArea":"str","nextWeekPlan":["str"],"experiment":"str"}
`.trim();

  const userPrompt = `Weekly Review (week offset: ${weekOffset}) from this context:\n${JSON.stringify(context)}`;

  return { systemPrompt, userPrompt };
}

export function buildAskHabitsPrompt(
  context: HabitAIContext,
  question: string,
  intent: QuestionIntent
) {
  const systemPrompt = `
You are the "Ask Your Habits" assistant. Answer the user's habit question using ONLY the provided context (intent: ${intent}). If unrelated to habits/routines, set intent to OUT_OF_DOMAIN. Return ONLY valid JSON: {"answer":"str","evidence":[{"type":"str","metric":"str","value":"str|num"}],"relatedInsights":["str"],"intent":"${intent}"}
`.trim();

  const userPrompt = `Question: "${question}"\nContext:\n${JSON.stringify(context)}`;

  return { systemPrompt, userPrompt };
}
