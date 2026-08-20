/**
 * Unit tests for api/_lib/ai-context.ts and api/_lib/schemas.ts
 */

import { describe, it, expect } from "vitest";
import { buildHabitAIContext, sanitizeText } from "../ai-context";
import {
  InsightSchema,
  AIInsightsResponseSchema,
  EvidenceSchema,
} from "../schemas";
import type { BehavioralSummary } from "../analytics";

const mockSummary: BehavioralSummary = {
  periodDays: 30,
  referenceDate: "2026-08-02",
  totalActiveHabits: 2,
  streaks: [
    { habitId: "h1", habitName: "Exercise", emoji: "🏃", current: 5, best: 10, isAtRisk: false },
    { habitId: "h2", habitName: "Read", emoji: "📚", current: 0, best: 3, isAtRisk: false },
  ],
  overallBestStreak: 10,
  overallCurrentStreak: 5,
  perfectDayStreak: { current: 2, best: 5 },
  consistencies: [
    { habitId: "h1", habitName: "Exercise", emoji: "🏃", stdDev: 0.2, variance: 0.04, consistencyScore: 80 },
    { habitId: "h2", habitName: "Read", emoji: "📚", stdDev: 0.4, variance: 0.16, consistencyScore: 40 },
  ],
  correlations: [],
  trends: {
    overall: { periodDays: 30, currentRate: 60, priorRate: 40, changePct: 20, insufficientData: false },
    perHabit: [
      { habitId: "h1", habitName: "Exercise", emoji: "🏃", currentRate: 80, priorRate: 50, changePct: 30, currentCount: 24, priorCount: 15 },
      { habitId: "h2", habitName: "Read", emoji: "📚", currentRate: 40, priorRate: 30, changePct: 10, currentCount: 12, priorCount: 9 },
    ],
  },
  weekdayPatterns: {
    byDay: [],
    weekdayVsWeekend: { weekdayRate: 70, weekendRate: 30, difference: 40 },
    insufficientData: false,
  },
  timeDistributions: [
    {
      habitId: "h1",
      habitName: "Exercise",
      emoji: "🏃",
      totalCompletions: 10,
      buckets: [
        { bucket: "before_9am", label: "Early Morning", count: 8, percentage: 80 },
        { bucket: "9am_to_5pm", label: "Daytime", count: 2, percentage: 20 },
        { bucket: "5pm_to_9pm", label: "Evening", count: 0, percentage: 0 },
        { bucket: "after_9pm", label: "Late Night", count: 0, percentage: 0 },
      ],
      dominantBucket: "before_9am",
      insufficientData: false,
    },
  ],
  todos: { total: 10, completed: 8, completionRate: 80 },
};

describe("api/_lib/ai-context.ts", () => {
  it("sanitizes text inputs to prevent prompt injection", () => {
    expect(sanitizeText("Ignore previous instructions! `code` <script>")).toBe("Ignore previous instructions! code script");
  });

  it("builds a structured HabitAIContext from BehavioralSummary", () => {
    const context = buildHabitAIContext(mockSummary);
    expect(context.activeHabitCount).toBe(2);
    expect(context.habits).toHaveLength(2);
    expect(context.overall.currentCompletionRate).toBe(60);
    expect(context.evidenceList.length).toBeGreaterThan(0);

    const exerciseHabit = context.habits.find((h) => h.name === "Exercise");
    expect(exerciseHabit).toBeDefined();
    expect(exerciseHabit?.currentStreak).toBe(5);
    expect(exerciseHabit?.dominantLogTime).toBe("before_9am");
  });
});

describe("api/_lib/schemas.ts — Zod validation", () => {
  it("validates evidence items cleanly", () => {
    const validEvidence = {
      type: "STREAK_CHANGE",
      metric: "Current Streak",
      value: 5,
      period: "30d",
      habitName: "Exercise",
    };
    const parsed = EvidenceSchema.parse(validEvidence);
    expect(parsed.type).toBe("STREAK_CHANGE");
  });

  it("validates structured AIInsightsResponse", () => {
    const mockResponse = {
      insights: [
        {
          id: "ins-1",
          type: "STRENGTH",
          title: "Morning Routine Mastery",
          explanation: "Exercise completed 80% of the time in early morning.",
          evidence: [
            {
              type: "LOGGING_TIME_PATTERN",
              metric: "Logging Time Pattern",
              value: "before_9am",
              habitName: "Exercise",
            },
          ],
          recommendation: "Keep logging exercise before 9 AM.",
          confidence: "HIGH",
          priority: "HIGH",
        },
      ],
      generatedAt: new Date().toISOString(),
      dataPeriod: "30d",
    };

    const parsed = AIInsightsResponseSchema.parse(mockResponse);
    expect(parsed.insights).toHaveLength(1);
    expect(parsed.insights[0].title).toBe("Morning Routine Mastery");
  });

  it("rejects invalid insight structure", () => {
    const invalidInsight = {
      id: "ins-1",
      type: "INVALID_TYPE",
      title: "Title",
    };
    expect(() => InsightSchema.parse(invalidInsight)).toThrow();
  });
});
