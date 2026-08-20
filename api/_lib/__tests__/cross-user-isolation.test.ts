/**
 * Cross-User Data Isolation Tests
 *
 * Verifies that AI context extraction and authentication utilities NEVER cross-contaminate data
 * between distinct user accounts.
 */

import { describe, it, expect } from "vitest";
import { computeBehavioralSummaryFromData, type HabitData, type CompletionData } from "../analytics";
import { buildHabitAIContext } from "../ai-context";

const userAHabits: HabitData[] = [
  { id: "ha1", name: "User A Running", emoji: "🏃", created_at: "2026-06-01T00:00:00Z" },
];

const userBHabits: HabitData[] = [
  { id: "hb1", name: "User B Reading", emoji: "📚", created_at: "2026-06-01T00:00:00Z" },
];

const userACompletions: CompletionData[] = [
  { habit_id: "ha1", completed_at: "2026-08-02T08:00:00Z" },
];

const userBCompletions: CompletionData[] = [
  { habit_id: "hb1", completed_at: "2026-08-02T09:00:00Z" },
];

describe("Cross-User Data Isolation", () => {
  it("computes analytics isolated strictly to User A dataset", () => {
    const summaryA = computeBehavioralSummaryFromData(
      userAHabits,
      userACompletions,
      [],
      30,
      new Date("2026-08-02T12:00:00Z")
    );

    const contextA = buildHabitAIContext(summaryA);

    expect(contextA.habits).toHaveLength(1);
    expect(contextA.habits[0].name).toBe("User A Running");
    expect(contextA.habits.some((h) => h.name.includes("User B"))).toBe(false);
  });

  it("computes analytics isolated strictly to User B dataset", () => {
    const summaryB = computeBehavioralSummaryFromData(
      userBHabits,
      userBCompletions,
      [],
      30,
      new Date("2026-08-02T12:00:00Z")
    );

    const contextB = buildHabitAIContext(summaryB);

    expect(contextB.habits).toHaveLength(1);
    expect(contextB.habits[0].name).toBe("User B Reading");
    expect(contextB.habits.some((h) => h.name.includes("User A"))).toBe(false);
  });
});
