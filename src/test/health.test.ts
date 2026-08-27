import { describe, it, expect } from "vitest";
import { format, subDays } from "date-fns";
import {
  calculateHabitHealth,
  buildHealthDashboardSummary,
  get14DayHistory,
} from "../lib/health";

describe("Habit Health Intelligence System", () => {
  const refDate = new Date("2026-08-27T12:00:00Z");

  describe("Section 3: Cases A through F Data Fidelity", () => {
    it("Case A: 14/14 days (100%) -> Strong · → Stable", () => {
      const completions = Array.from({ length: 14 }, (_, i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("case-a", completions, "2026-01-01", refDate);

      expect(health.health).toBe("strong");
      expect(health.trend).toBe("stable");
      expect(health.trendLabel).toBe("→ Stable");
      expect(health.completed14Count).toBe(14);
      expect(health.totalDays).toBe(14);
      expect(health.consistencyRate14).toBe(100);
    });

    it("Case B: 12/14 days (86%) -> Strong · → Stable", () => {
      // Completed 12 days, missed 2 days (days 5 and 10)
      const completions = [0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("case-b", completions, "2026-01-01", refDate);

      expect(health.health).toBe("strong");
      expect(health.completed14Count).toBe(12);
      expect(health.consistencyRate14).toBe(86);
      expect(health.trend).toBe("stable");
      expect(health.trendLabel).toBe("→ Stable");
    });

    it("Case C: 9/14 days (64%) -> On Track", () => {
      // 9 completions across the 14 days with recent completion
      const completions = [0, 1, 3, 4, 6, 8, 9, 11, 13].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("case-c", completions, "2026-01-01", refDate);

      expect(health.health).toBe("on_track");
      expect(health.completed14Count).toBe(9);
      expect(health.consistencyRate14).toBe(64);
    });

    it("Case D: 7/14 days (50%) -> At Risk", () => {
      // 7 completions across the 14 days, stable pattern
      const completions = [0, 2, 4, 6, 8, 10, 12].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("case-d", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.completed14Count).toBe(7);
      expect(health.consistencyRate14).toBe(50);
    });

    it("Case E: 3/14 days (21%) -> At Risk · ↗ Improving when recovering", () => {
      // Missed earlier days, completed 3 of last 4 days
      const completions = [0, 1, 2].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("case-e-recovering", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.trend).toBe("improving");
      expect(health.trendLabel).toBe("↗ Improving");
      expect(health.completed14Count).toBe(3);
      expect(health.consistencyRate14).toBe(21);
      expect(health.explanation).toContain("improving");
    });

    it("Case E: 3/14 days (21%) -> Ignored · — No activity when not recovering (NEVER Ignored · Stable or On Track!)", () => {
      // Completed 3 days long ago (e.g. days 13, 11, 9), 0 in last 8 days
      const completions = [9, 11, 13].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("case-e-inactive", completions, "2026-01-01", refDate);

      expect(health.health).toBe("ignored");
      expect(health.health).not.toBe("on_track");
      expect(health.trendLabel).toBe("— No activity");
      expect(health.trendLabel).not.toBe("→ Stable");
      expect(health.completed14Count).toBe(3);
      expect(health.consistencyRate14).toBe(21);
    });

    it("Case F: 0/14 days (0%) -> Ignored · — No activity (NEVER Ignored · Stable)", () => {
      const health = calculateHabitHealth("case-f", [], "2026-01-01", refDate);

      expect(health.health).toBe("ignored");
      expect(health.trend).toBe("no_activity");
      expect(health.trendLabel).toBe("— No activity");
      expect(health.trendLabel).not.toBe("→ Stable");
      expect(health.completed14Count).toBe(0);
      expect(health.consistencyRate14).toBe(0);
    });
  });

  describe("Section 5 & 6: Recovery and Decline Detection", () => {
    it("recognizes recovery: low historical consistency but recent burst -> At Risk · ↗ Improving", () => {
      // 10 missed days, followed by 4 completed days (days 3, 2, 1, 0)
      const completions = [0, 1, 2, 3].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("recovery", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.trend).toBe("improving");
      expect(health.trendLabel).toBe("↗ Improving");
      expect(health.explanation).toContain("improving");
    });

    it("recognizes decline: strong historical consistency but stopped recently -> At Risk · ↘ Declining", () => {
      // Completed days 13 through 6 (8 days), but missed last 6 days (days 5..0)
      const completions = [6, 7, 8, 9, 10, 11, 12, 13].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );
      const health = calculateHabitHealth("decline", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.trend).toBe("declining");
      expect(health.trendLabel).toBe("↘ Declining");
      expect(health.daysSinceLastCompletion).toBe(6);
      expect(health.explanation).toContain("historical consistency is strong");
    });
  });

  describe("Section 7 & 9: New Habits Handling", () => {
    it("handles new habit with 0 completions without marking it Ignored", () => {
      const health = calculateHabitHealth(
        "new-zero",
        [],
        format(refDate, "yyyy-MM-dd"),
        refDate,
      );

      expect(health.health).toBe("on_track");
      expect(health.health).not.toBe("ignored");
      expect(health.trendLabel).toBe("No data yet");
      expect(health.totalDays).toBe(1);
    });

    it("calculates consistency using actual available period (e.g. 2/2 days · 100%)", () => {
      // Created 2 calendar days ago, completed both days
      const createdDate = subDays(refDate, 1); // 2 calendar days: yesterday and today
      const completions = [0, 1].map((i) =>
        format(subDays(refDate, i), "yyyy-MM-dd"),
      );

      const health = calculateHabitHealth(
        "new-complete",
        completions,
        format(createdDate, "yyyy-MM-dd"),
        refDate,
      );

      expect(health.health).toBe("strong");
      expect(health.totalDays).toBe(2);
      expect(health.completed14Count).toBe(2);
      expect(health.consistencyRate14).toBe(100);
      expect(health.history14Days.length).toBe(2);
      expect(health.trendLabel).toBe("New habit");
    });
  });

  describe("Section 14 & 15: Dashboard Counts & Granular Risk Composition", () => {
    it("strictly verifies Strong + On Track + At Risk + Ignored = Total, and Attention = At Risk + Ignored", () => {
      const habits = [
        { id: "h1", name: "DSA Leetcode", emoji: "🎯" }, // Strong
        { id: "h2", name: "Content Creation", emoji: "⭐" }, // On Track
        { id: "h3", name: "Water", emoji: "💧" }, // At Risk (stable)
        { id: "h4", name: "Course Work", emoji: "📝" }, // At Risk (declining)
        { id: "h5", name: "Focus & Discipline", emoji: "🧠" }, // Ignored
        { id: "h6", name: "Exercise", emoji: "🏃" }, // Ignored
        { id: "h7", name: "Reading", emoji: "📚" }, // Ignored
      ];

      const healthMap = {
        h1: calculateHabitHealth(
          "h1",
          Array.from({ length: 13 }, (_, i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
        h2: calculateHabitHealth(
          "h2",
          [0, 1, 3, 4, 6, 8, 9, 11, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
        h3: calculateHabitHealth(
          "h3",
          [0, 2, 4, 7, 9, 11, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
        h4: calculateHabitHealth(
          "h4",
          [7, 8, 9, 10, 11, 12, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
        h5: calculateHabitHealth(
          "h5",
          [format(subDays(refDate, 10), "yyyy-MM-dd")],
          "2026-01-01",
          refDate,
        ),
        h6: calculateHabitHealth("h6", [], "2026-01-01", refDate),
        h7: calculateHabitHealth("h7", [], "2026-01-01", refDate),
      };

      const summary = buildHealthDashboardSummary(habits, healthMap);

      const sum =
        summary.strongCount +
        summary.onTrackCount +
        summary.atRiskCount +
        summary.ignoredCount;

      expect(sum).toBe(habits.length);
      expect(summary.totalHabitsCount).toBe(7);
      expect(summary.atRiskCount).toBe(2);
      expect(summary.ignoredCount).toBe(3);
      expect(summary.attentionCount).toBe(5);
      expect(summary.bannerMessage.headline).toBe("⚠️ 5 habits need attention.");
      // Granular risk composition breakdown: 1 declining · 1 stable · 3 ignored
      expect(summary.bannerMessage.subtext).toBe("1 declining · 1 stable · 3 ignored");
    });

    it("summarizes risk composition when all at-risk habits are declining", () => {
      const habits = [
        { id: "h1", name: "Habit 1", emoji: "💧" },
        { id: "h2", name: "Habit 2", emoji: "📝" },
      ];
      const healthMap = {
        h1: calculateHabitHealth("h1", [7, 8, 9, 10, 11, 12, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")), "2026-01-01", refDate),
        h2: calculateHabitHealth("h2", [], "2026-01-01", refDate),
      };
      const summary = buildHealthDashboardSummary(habits, healthMap);
      expect(summary.bannerMessage.headline).toBe("⚠️ 2 habits need attention.");
      expect(summary.bannerMessage.subtext).toBe("1 declining · 1 ignored");
    });

    it("summarizes risk composition when all at-risk habits are improving", () => {
      const habits = [
        { id: "h1", name: "Habit 1", emoji: "🌱" },
        { id: "h2", name: "Habit 2", emoji: "💤" },
      ];
      const healthMap = {
        h1: calculateHabitHealth("h1", [0, 1, 2].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")), "2026-01-01", refDate),
        h2: calculateHabitHealth("h2", [], "2026-01-01", refDate),
      };
      const summary = buildHealthDashboardSummary(habits, healthMap);
      expect(summary.bannerMessage.headline).toBe("⚠️ 2 habits need attention.");
      expect(summary.bannerMessage.subtext).toBe("1 improving · 1 ignored");
    });

    it("prioritizes Needs Attention habits by urgency (Ignored/No activity > Declining > Improving)", () => {
      const habits = [
        { id: "improving-habit", name: "Improving Habit", emoji: "🌱" },
        { id: "ignored-habit", name: "Ignored Habit", emoji: "💤" },
        { id: "declining-habit", name: "Declining Habit", emoji: "📉" },
      ];

      const healthMap = {
        "improving-habit": calculateHabitHealth(
          "improving-habit",
          [0, 1, 2].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
        "ignored-habit": calculateHabitHealth(
          "ignored-habit",
          [],
          "2026-01-01",
          refDate,
        ),
        "declining-habit": calculateHabitHealth(
          "declining-habit",
          [7, 8, 9, 10, 11, 12, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
      };

      const summary = buildHealthDashboardSummary(habits, healthMap);

      // Verify that Ignored (no activity) is ranked first, Declining is second, Improving is last in urgency
      expect(summary.needsAttentionHabits.length).toBe(3);
      expect(summary.needsAttentionHabits[0].id).toBe("ignored-habit");
      expect(summary.needsAttentionHabits[1].id).toBe("declining-habit");
      expect(summary.needsAttentionHabits[2].id).toBe("improving-habit");
    });

    it("shows positive encouraging banner when attention count is 0", () => {
      const habits = [
        { id: "h1", name: "DSA Leetcode", emoji: "🎯" },
        { id: "h2", name: "Content Creation", emoji: "⭐" },
      ];

      const healthMap = {
        h1: calculateHabitHealth(
          "h1",
          Array.from({ length: 14 }, (_, i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
        h2: calculateHabitHealth(
          "h2",
          [0, 1, 3, 4, 6, 8, 9, 11, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd")),
          "2026-01-01",
          refDate,
        ),
      };

      const summary = buildHealthDashboardSummary(habits, healthMap);

      expect(summary.attentionCount).toBe(0);
      expect(summary.bannerMessage.headline).toBe("✨ Your habits are looking strong today.");
    });
  });

  describe("Targeted Logic Audit: Tests 1 through 6 (Recency vs Consistency)", () => {
    it("Test 1 — Completed today: 3/14 days + completed today MUST NOT return Ignored + No activity", () => {
      // Completed today (day 0), and two older days (e.g. days 3, 10)
      const completions = [0, 3, 10].map((i) => format(subDays(refDate, i), "yyyy-MM-dd"));
      const health = calculateHabitHealth("test-1-today", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.health).not.toBe("ignored");
      expect(health.trend).not.toBe("no_activity");
      expect(health.trendLabel).not.toBe("— No activity");
      expect(health.lastCompletedText).toBe("Completed today");
      expect(health.daysSinceLastCompletion).toBe(0);
      expect(health.explanation).not.toContain("No recent activity");
      expect(health.explanation).not.toContain("No completions during the tracked");
    });

    it("Test 2 — Completed yesterday: 3/14 days + completed yesterday MUST NOT return No activity", () => {
      // Completed yesterday (day 1), and two older days (e.g. days 4, 10)
      const completions = [1, 4, 10].map((i) => format(subDays(refDate, i), "yyyy-MM-dd"));
      const health = calculateHabitHealth("test-2-yesterday", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.health).not.toBe("ignored");
      expect(health.trend).not.toBe("no_activity");
      expect(health.trendLabel).not.toBe("— No activity");
      expect(health.lastCompletedText).toBe("Yesterday");
      expect(health.daysSinceLastCompletion).toBe(1);
    });

    it("Test 3 — Zero activity: 0/14 days returns Ignored + No activity", () => {
      const health = calculateHabitHealth("test-3-zero", [], "2026-01-01", refDate);

      expect(health.health).toBe("ignored");
      expect(health.trend).toBe("no_activity");
      expect(health.trendLabel).toBe("— No activity");
      expect(health.completed14Count).toBe(0);
      expect(health.explanation).toContain("No completions during the tracked");
    });

    it("Test 4 — Low consistency but recent activity: 3/14 days + recent completions -> At Risk", () => {
      // 3 completions within recent 5 days
      const completions = [0, 2, 4].map((i) => format(subDays(refDate, i), "yyyy-MM-dd"));
      const health = calculateHabitHealth("test-4-recent", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.health).not.toBe("ignored");
      expect(health.trend).toBe("improving");
      expect(health.trendLabel).toBe("↗ Improving");
      expect(health.completed14Count).toBe(3);
    });

    it("Test 5 — Historically strong but recently inactive: high historical + several recent missed days -> At Risk + Declining", () => {
      // Completed 7 days in earlier period (days 13..7), missed the last 7 days (days 6..0)
      const completions = [7, 8, 9, 10, 11, 12, 13].map((i) => format(subDays(refDate, i), "yyyy-MM-dd"));
      const health = calculateHabitHealth("test-5-declining", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.trend).toBe("declining");
      expect(health.trendLabel).toBe("↘ Declining");
      expect(health.daysSinceLastCompletion).toBe(7);
      expect(health.explanation).toContain("historical consistency is strong");
    });

    it("Test 6 — Recovery: low historical consistency + strong recent activity -> At Risk + Improving", () => {
      // Completed 3 of the last 4 days (days 0, 1, 2)
      const completions = [0, 1, 2].map((i) => format(subDays(refDate, i), "yyyy-MM-dd"));
      const health = calculateHabitHealth("test-6-recovery", completions, "2026-01-01", refDate);

      expect(health.health).toBe("at_risk");
      expect(health.trend).toBe("improving");
      expect(health.trendLabel).toBe("↗ Improving");
      expect(health.explanation).toContain("improving");
    });
  });
});

