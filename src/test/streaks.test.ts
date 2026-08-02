import { describe, it, expect } from "vitest";
import {
  calculatePerHabitStreak,
  calculatePerfectDayStreak,
  calculateHabitConsistency,
  calculateHabitCorrelations,
  normalizeDateString,
} from "../lib/streaks";

describe("normalizeDateString", () => {
  it("normalizes ISO timestamp strings to YYYY-MM-DD", () => {
    expect(normalizeDateString("2026-01-31T23:59:59.000Z")).toBe("2026-01-31");
  });

  it("leaves YYYY-MM-DD strings intact", () => {
    expect(normalizeDateString("2026-02-01")).toBe("2026-02-01");
  });
});

describe("calculatePerHabitStreak", () => {
  const refDate = new Date("2026-08-02T12:00:00Z");

  it("handles empty completions", () => {
    const result = calculatePerHabitStreak([], refDate);
    expect(result).toEqual({ current: 0, best: 0, isAtRisk: false });
  });

  it("handles single-day streak completed today", () => {
    const completions = ["2026-08-02T09:00:00Z"];
    const result = calculatePerHabitStreak(completions, refDate);
    expect(result).toEqual({ current: 1, best: 1, isAtRisk: false });
  });

  it("handles single-day streak completed yesterday (at risk)", () => {
    const completions = ["2026-08-01T15:00:00Z"];
    const result = calculatePerHabitStreak(completions, refDate);
    expect(result).toEqual({ current: 1, best: 1, isAtRisk: true });
  });

  it("handles gap of exactly one day (completed 2 days ago, missed yesterday and today)", () => {
    const completions = ["2026-07-31T10:00:00Z"];
    const result = calculatePerHabitStreak(completions, refDate);
    expect(result).toEqual({ current: 0, best: 1, isAtRisk: false });
  });

  it("handles gap of more than one day after a multi-day streak", () => {
    const completions = [
      "2026-07-20T10:00:00Z",
      "2026-07-21T10:00:00Z",
      "2026-07-22T10:00:00Z",
    ];
    const result = calculatePerHabitStreak(completions, refDate);
    expect(result).toEqual({ current: 0, best: 3, isAtRisk: false });
  });

  it("handles streak spanning a month boundary (Jan 30 - Feb 2)", () => {
    const janFebRef = new Date("2026-02-02T12:00:00Z");
    const completions = [
      "2026-01-30T10:00:00Z",
      "2026-01-31T20:00:00Z",
      "2026-02-01T08:00:00Z",
      "2026-02-02T18:00:00Z",
    ];
    const result = calculatePerHabitStreak(completions, janFebRef);
    expect(result).toEqual({ current: 4, best: 4, isAtRisk: false });
  });
});

describe("calculatePerfectDayStreak", () => {
  const refDate = new Date("2026-08-02T12:00:00Z");

  it("calculates perfect day streak accurately", () => {
    const map = new Map<string, Set<string>>([
      ["2026-08-01", new Set(["h1", "h2"])],
      ["2026-08-02", new Set(["h1", "h2"])],
    ]);

    const result = calculatePerfectDayStreak(map, 2, refDate);
    expect(result).toEqual({ current: 2, best: 2 });
  });

  it("handles incomplete today without breaking yesterday streak", () => {
    const map = new Map<string, Set<string>>([
      ["2026-07-31", new Set(["h1", "h2"])],
      ["2026-08-01", new Set(["h1", "h2"])],
      ["2026-08-02", new Set(["h1"])], // only 1 of 2 habits completed today
    ]);

    const result = calculatePerfectDayStreak(map, 2, refDate);
    expect(result).toEqual({ current: 2, best: 2 });
  });
});

describe("calculateHabitConsistency", () => {
  const refDate = new Date("2026-08-02T12:00:00Z");

  it("computes stdDev and consistency score for consistent habit", () => {
    // 30 days of completions
    const completions: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      completions.push(d.toISOString());
    }

    const result = calculateHabitConsistency(completions, 30, refDate);
    expect(result.stdDev).toBe(0);
    expect(result.consistencyScore).toBe(100);
  });
});

describe("calculateHabitCorrelations", () => {
  const refDate = new Date("2026-08-02T12:00:00Z");

  it("finds habit pairs with high co-occurrence and lift", () => {
    const habits = [
      { id: "h1", name: "Morning Run" },
      { id: "h2", name: "Cold Shower" },
    ];

    const completions: { habit_id: string; dateStr: string }[] = [];
    // Both completed together on 10 days
    for (let i = 0; i < 10; i++) {
      const d = new Date(refDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      completions.push({ habit_id: "h1", dateStr });
      completions.push({ habit_id: "h2", dateStr });
    }

    const correlations = calculateHabitCorrelations(habits, completions, 30, refDate);
    expect(correlations.length).toBe(1);
    expect(correlations[0].togetherRate).toBe(100);
    expect(correlations[0].lift).toBeGreaterThan(1);
  });
});
