export type EvidenceType =
  | "STREAK_CHANGE"
  | "CONSISTENCY_SCORE"
  | "PERIOD_TREND"
  | "WEEKDAY_PARITY"
  | "CROSS_HABIT_CORRELATION"
  | "LOGGING_TIME_PATTERN"
  | "COMPLETION_RATE"
  | "TODO_COMPLETION";

export interface Evidence {
  type: EvidenceType;
  metric: string;
  value: number | string;
  comparisonValue?: number | string;
  period?: string;
  habitName?: string;
  details?: string;
}

export type InsightType =
  | "STRENGTH"
  | "RISK"
  | "OPPORTUNITY"
  | "PATTERN"
  | "CORRELATION"
  | "RECOVERY";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  explanation: string;
  evidence: Evidence[];
  recommendation: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface AIInsightsResponse {
  insights: Insight[];
  generatedAt: string;
  dataPeriod: string;
}

export interface WeeklyReview {
  headline: string;
  wins: string[];
  changes: string[];
  focusArea: string;
  nextWeekPlan: string[];
  experiment: string;
}

export interface AskHabitsResponse {
  answer: string;
  evidence: Evidence[];
  relatedInsights?: string[];
  intent: string;
}
