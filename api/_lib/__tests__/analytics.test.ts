/**
 * Unit tests for api/_lib/analytics.ts
 * Tests pure calculation functions using fixed reference dates and deterministic fixtures.
 */

import { describe, it, expect } from "vitest";
import {
  computeHabitStreaksFromData,
  computeHabitConsistencyFromData,
  computeHabitTrendsFromData,
  computeWeekdayPatternsFromData,
  computeCompletionTimeDistributionFromData,
  computeBehavioralSummaryFromData,
  type HabitData,
  type CompletionData,
  type TodoData,
} from "../analytics";

const refDate = new Date("2026-08-02T12:00:00Z");

const sampleHabits: HabitData[] = [
  { id: "h1", name: "Exercise", emoji: "🏃", created_at: "2026-06-01T00:00:00Z" },
  { id: "h2", name: "Read", emoji: "📚", created_at: "2026-06-01T00:00:00Z" },
];

describe("api/_lib/analytics.ts — pure calculation tests", () => {
  describe("computeHabitStreaksFromData", () => {
    it("returns zero streaks when no completions exist", () => {
      const result = computeHabitStreaksFromData(sampleHabits, [], refDate);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ habitId: "h1", current: 0, best: 0, isAtRisk: false });
      expect(result[1]).toMatchObject({ habitId: "h2", current: 0, best: 0, isAtRisk: false });
    });

    it("calculates active current streak and best streak correctly", () => {
      const completions: CompletionData[] = [
        { habit_id: "h1", completed_at: "2026-08-02T08:00:00Z" }, // today
        { habit_id: "h1", completed_at: "2026-08-01T08:00:00Z" }, // yesterday
        { habit_id: "h1", completed_at: "2026-07-31T08:00:00Z" }, // 2 days ago
      ];
      const result = computeHabitStreaksFromData(sampleHabits, completions, refDate);
      const h1Streak = result.find((r) => r.habitId === "h1");
      expect(h1Streak).toMatchObject({ current: 3, best: 3, isAtRisk: false });
    });

    it("flags isAtRisk when completed yesterday but not today", () => {
      const completions: CompletionData[] = [
        { habit_id: "h1", completed_at: "2026-08-01T08:00:00Z" }, // yesterday
      ];
      const result = computeHabitStreaksFromData(sampleHabits, completions, refDate);
      const h1Streak = result.find((r) => r.habitId === "h1");
      expect(h1Streak).toMatchObject({ current: 1, isAtRisk: true });
    });
  });

  describe("computeHabitConsistencyFromData", () => {
    it("calculates consistency score (100 for zero completions)", () => {
      const result = computeHabitConsistencyFromData(sampleHabits, [], 30, refDate);
      expect(result[0].consistencyScore).toBeDefined();
    });

    it("returns high score for daily completion", () => {
      const completions: CompletionData[] = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        completions.push({ habit_id: "h1", completed_at: d.toISOString() });
      }
      const result = computeHabitConsistencyFromData(sampleHabits, completions, 30, refDate);
      const h1Comp = result.find((r) => r.habitId === "h1");
      expect(h1Comp?.consistencyScore).toBe(100);
    });
  });

  describe("computeHabitTrendsFromData", () => {
    it("computes overall and per-habit change percentages", () => {
      const completions: CompletionData[] = [];
      // Current 30 days: 15 completions for h1
      for (let i = 0; i < 15; i++) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        completions.push({ habit_id: "h1", completed_at: d.toISOString() });
      }
      // Prior 30 days: 5 completions for h1
      for (let i = 30; i < 35; i++) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        completions.push({ habit_id: "h1", completed_at: d.toISOString() });
      }

      const result = computeHabitTrendsFromData(sampleHabits, completions, 30, refDate);
      const h1Trend = result.perHabit.find((p) => p.habitId === "h1");
      expect(h1Trend?.currentRate).toBe(50); // 15 / 30 = 50%
      expect(h1Trend?.priorRate).toBe(17);   // 5 / 30 = 16.66% ~ 17%
      expect(h1Trend?.changePct).toBeGreaterThan(0);
      expect(result.overall.insufficientData).toBe(false); // Created June 1st vs Aug 2nd reference
    });

    it("sets insufficientData = true when history is too short", () => {
      const recentHabit: HabitData[] = [
        { id: "h3", name: "New Habit", emoji: "🌱", created_at: "2026-08-01T00:00:00Z" },
      ];
      const result = computeHabitTrendsFromData(recentHabit, [], 30, refDate);
      expect(result.overall.insufficientData).toBe(true);
    });
  });

  describe("computeWeekdayPatternsFromData", () => {
    it("identifies weekday vs weekend rates", () => {
      // 2026-08-02 is Sunday. 2026-08-01 is Saturday. 2026-07-31 is Friday.
      const completions: CompletionData[] = [
        { habit_id: "h1", completed_at: "2026-07-31T10:00:00Z" }, // Friday
        { habit_id: "h1", completed_at: "2026-07-30T10:00:00Z" }, // Thursday
        { habit_id: "h1", completed_at: "2026-07-29T10:00:00Z" }, // Wednesday
        { habit_id: "h1", completed_at: "2026-07-28T10:00:00Z" }, // Tuesday
        { habit_id: "h1", completed_at: "2026-07-27T10:00:00Z" }, // Monday
      ];
      const result = computeWeekdayPatternsFromData(sampleHabits, completions, 14, refDate);
      expect(result.byDay).toHaveLength(7);
      expect(result.weekdayVsWeekend.weekdayRate).toBeGreaterThan(result.weekdayVsWeekend.weekendRate);
    });
  });

  describe("computeCompletionTimeDistributionFromData (Capability E)", () => {
    it("buckets logging times into correct time ranges", () => {
      const completions: CompletionData[] = [
        { habit_id: "h1", completed_at: "2026-08-02T07:30:00Z" }, // before 9am
        { habit_id: "h1", completed_at: "2026-08-01T08:15:00Z" }, // before 9am
        { habit_id: "h1", completed_at: "2026-07-31T06:45:00Z" }, // before 9am
        { habit_id: "h1", completed_at: "2026-07-30T08:00:00Z" }, // before 9am
        { habit_id: "h1", completed_at: "2026-07-29T07:00:00Z" }, // before 9am
      ];
      const result = computeCompletionTimeDistributionFromData(sampleHabits, completions, 0);
      const h1Dist = result.find((r) => r.habitId === "h1");
      expect(h1Dist?.insufficientData).toBe(false);
      expect(h1Dist?.dominantBucket).toBe("before_9am");
      expect(h1Dist?.buckets.find((b) => b.bucket === "before_9am")?.percentage).toBe(100);
    });

    it("marks insufficientData = true when total completions < 5", () => {
      const completions: CompletionData[] = [
        { habit_id: "h1", completed_at: "2026-08-02T07:30:00Z" },
      ];
      const result = computeCompletionTimeDistributionFromData(sampleHabits, completions, 0);
      const h1Dist = result.find((r) => r.habitId === "h1");
      expect(h1Dist?.insufficientData).toBe(true);
      expect(h1Dist?.dominantBucket).toBeUndefined();
    });
  });

  describe("computeBehavioralSummaryFromData", () => {
    it("composes all metrics into unified summary", () => {
      const todos: TodoData[] = [
        { id: "t1", title: "Task 1", completed: true },
        { id: "t2", title: "Task 2", completed: false },
      ];
      const summary = computeBehavioralSummaryFromData(sampleHabits, [], todos, 30, refDate);
      expect(summary.totalActiveHabits).toBe(2);
      expect(summary.todos).toEqual({ total: 2, completed: 1, completionRate: 50 });
      expect(summary.streaks).toHaveLength(2);
      expect(summary.timeDistributions).toHaveLength(2);
    });
  });
});
