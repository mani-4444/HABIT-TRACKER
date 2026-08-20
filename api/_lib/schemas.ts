/**
 * api/_lib/schemas.ts
 *
 * Zod schemas for validating incoming API requests and structured LLM outputs.
 * Provides strict type-safety in both directions — no unchecked casting of AI output.
 */

import { z } from "zod";

// ── Evidence Schema ───────────────────────────────────────────────────────────

export const EvidenceTypeSchema = z.enum([
  "STREAK_CHANGE",
  "CONSISTENCY_SCORE",
  "PERIOD_TREND",
  "WEEKDAY_PARITY",
  "CROSS_HABIT_CORRELATION",
  "LOGGING_TIME_PATTERN",
  "COMPLETION_RATE",
  "TODO_COMPLETION",
]);

export const EvidenceSchema = z.object({
  type: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    EvidenceTypeSchema.catch("COMPLETION_RATE")
  ),
  metric: z.string().default("metric"),
  value: z.union([z.number(), z.string()]).default(0),
  comparisonValue: z.union([z.number(), z.string()]).optional(),
  period: z.string().optional(),
  habitName: z.string().optional(),
  details: z.string().optional(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// ── Insight Schema ────────────────────────────────────────────────────────────

export const InsightTypeSchema = z.enum([
  "STRENGTH",
  "RISK",
  "OPPORTUNITY",
  "PATTERN",
  "CORRELATION",
  "RECOVERY",
]);

export const InsightSchema = z.object({
  id: z.string().optional().default(() => `ins_${Math.random().toString(36).slice(2, 9)}`),
  type: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    InsightTypeSchema
  ),
  title: z.string(),
  explanation: z.string(),
  evidence: z.array(EvidenceSchema).default([]),
  recommendation: z.string(),
  confidence: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    z.enum(["HIGH", "MEDIUM", "LOW"])
  ),
  priority: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    z.enum(["HIGH", "MEDIUM", "LOW"])
  ),
});

export type Insight = z.infer<typeof InsightSchema>;

export const AIInsightsLLMOutputSchema = z.preprocess(
  (val) => {
    if (Array.isArray(val)) {
      return { insights: val };
    }
    return val;
  },
  z.object({
    insights: z.array(InsightSchema).default([]),
  })
);

export type AIInsightsLLMOutput = z.infer<typeof AIInsightsLLMOutputSchema>;

export const AIInsightsResponseSchema = z.object({
  insights: z.array(InsightSchema),
  generatedAt: z.string(),
  dataPeriod: z.string(),
});

export type AIInsightsResponse = z.infer<typeof AIInsightsResponseSchema>;

// ── Weekly Review Schema ──────────────────────────────────────────────────────

export const WeeklyReviewSchema = z.object({
  headline: z.string().default("Weekly Habit Summary"),
  wins: z.array(z.string()).default([]),
  changes: z.array(z.string()).default([]),
  focusArea: z.string().default("Consistency"),
  nextWeekPlan: z.array(z.string()).default([]),
  experiment: z.string().default("Track at least one key habit daily for 7 days."),
});

export type WeeklyReview = z.infer<typeof WeeklyReviewSchema>;

// ── Recommendation Schema ────────────────────────────────────────────────────

export const CoachRecommendationCategorySchema = z.enum([
  "LOW_CONSISTENCY",
  "DECLINING_TREND",
  "STREAK_RISK",
  "WEEKEND_DROP",
  "STRONG_HABIT",
  "HABIT_PAIRING",
  "OVERLOADED_ROUTINE",
  "RECOVERY_AFTER_MISS",
  "LOGGING_TIME_PATTERN",
]);

export const CoachRecommendationSchema = z.object({
  id: z.string().default(() => `rec_${Math.random().toString(36).slice(2, 9)}`),
  category: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    CoachRecommendationCategorySchema.catch("LOW_CONSISTENCY")
  ),
  habitName: z.string().optional(),
  actionableStep: z.string().default(""),
  reasoning: z.string().default(""),
  expectedImpact: z.string().default(""),
  evidence: z.array(EvidenceSchema).default([]),
});

export type CoachRecommendation = z.infer<typeof CoachRecommendationSchema>;

// ── Ask Habits Schema ────────────────────────────────────────────────────────

export const QuestionIntentSchema = z.enum([
  "CURRENT_PERFORMANCE",
  "TREND",
  "STREAK",
  "CONSISTENCY",
  "WEEKDAY_PATTERN",
  "HABIT_COMPARISON",
  "HABIT_CORRELATION",
  "RECOMMENDATION",
  "WEEKLY_REVIEW",
  "GENERAL_COACHING",
  "OUT_OF_DOMAIN",
]);

export type QuestionIntent = z.infer<typeof QuestionIntentSchema>;

export const AskHabitsResponseSchema = z.object({
  answer: z.string().default(""),
  evidence: z.array(EvidenceSchema).default([]),
  relatedInsights: z.array(z.string()).optional(),
  intent: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    QuestionIntentSchema.catch("GENERAL_COACHING")
  ),
});

export type AskHabitsResponse = z.infer<typeof AskHabitsResponseSchema>;

// ── Request Body Validation Schemas ───────────────────────────────────────────

export const AIInsightsRequestSchema = z.object({
  period: z.enum(["30d", "90d"]).optional().default("30d"),
  timezoneOffset: z.number().optional().default(0),
});

export const WeeklyReviewRequestSchema = z.object({
  weekOffset: z.number().optional().default(0),
  timezoneOffset: z.number().optional().default(0),
});

export const AskHabitsRequestSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").max(500, "Question too long (max 500 chars)"),
  timezoneOffset: z.number().optional().default(0),
});
