/**
 * Smoke test: verifies that api/_lib can import src/lib/streaks.ts
 * through the @/ alias configured in vitest.config.ts.
 * This must pass before any real api/_lib tests are added.
 */
import { describe, it, expect } from "vitest";
import {
  normalizeDateString,
  calculatePerHabitStreak,
  calculatePerfectDayStreak,
  calculateHabitConsistency,
  calculateHabitCorrelations,
} from "@/lib/streaks";

describe("api/_lib smoke test — streaks.ts import resolution", () => {
  it("imports normalizeDateString from src/lib/streaks via @/ alias", () => {
    expect(typeof normalizeDateString).toBe("function");
    expect(normalizeDateString("2026-08-02T12:00:00Z")).toBe("2026-08-02");
  });

  it("imports calculatePerHabitStreak", () => {
    expect(typeof calculatePerHabitStreak).toBe("function");
    const result = calculatePerHabitStreak([], new Date("2026-08-02T12:00:00Z"));
    expect(result).toEqual({ current: 0, best: 0, isAtRisk: false });
  });

  it("imports calculatePerfectDayStreak", () => {
    expect(typeof calculatePerfectDayStreak).toBe("function");
  });

  it("imports calculateHabitConsistency", () => {
    expect(typeof calculateHabitConsistency).toBe("function");
  });

  it("imports calculateHabitCorrelations", () => {
    expect(typeof calculateHabitCorrelations).toBe("function");
  });
});
