/**
 * api/_lib/question-router.ts
 *
 * Deterministic intent classifier for "Ask Your Habits" natural language questions.
 * Routes questions to specific analytics sub-contexts rather than dumping the whole database.
 */

import type { QuestionIntent } from "./schemas";

const INTENT_RULES: { intent: QuestionIntent; keywords: string[] }[] = [
  {
    intent: "STREAK",
    keywords: ["streak", "consecutive", "longest", "best streak", "current streak", "at risk", "losing streak"],
  },
  {
    intent: "CONSISTENCY",
    keywords: ["consistent", "consistency", "steady", "variance", "regular", "skip", "missed"],
  },
  {
    intent: "TREND",
    keywords: ["trend", "progress", "improving", "declining", "drop", "rate", "compare", "month", "change"],
  },
  {
    intent: "WEEKDAY_PATTERN",
    keywords: ["weekend", "weekday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "day of week"],
  },
  {
    intent: "HABIT_CORRELATION",
    keywords: ["together", "pair", "correlation", "co-occur", "same day", "boost", "influence"],
  },
  {
    intent: "RECOMMENDATION",
    keywords: ["recommend", "focus", "should i", "advice", "tip", "improve", "fix", "what next"],
  },
  {
    intent: "WEEKLY_REVIEW",
    keywords: ["week", "review", "weekly", "summary", "last week", "this week"],
  },
  {
    intent: "CURRENT_PERFORMANCE",
    keywords: ["today", "overall", "performance", "rate", "score", "how am i doing"],
  },
];

const OUT_OF_DOMAIN_KEYWORDS = [
  "weather",
  "stock",
  "recipe",
  "code",
  "python",
  "math",
  "president",
  "capital",
  "movie",
  "song",
];

/**
 * Classify a user's question into one of the fixed QuestionIntent categories.
 */
export function classifyQuestionIntent(question: string): QuestionIntent {
  const qLower = question.toLowerCase();

  // Check out of domain keywords
  if (OUT_OF_DOMAIN_KEYWORDS.some((kw) => qLower.includes(kw))) {
    return "OUT_OF_DOMAIN";
  }

  for (const rule of INTENT_RULES) {
    if (rule.keywords.some((kw) => qLower.includes(kw))) {
      return rule.intent;
    }
  }

  return "GENERAL_COACHING";
}
