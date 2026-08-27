import { describe, it, expect } from "vitest";
import { format, subMonths, getDaysInMonth, startOfMonth } from "date-fns";

describe("LeetCode Heatmap Grid Calculation", () => {
  it("generates 12 distinct month blocks", () => {
    const today = new Date("2026-08-27T12:00:00Z");
    const monthsBack = 12;
    const monthKeys: string[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      monthKeys.push(format(monthDate, "yyyy-MM"));
    }

    expect(monthKeys).toHaveLength(12);
    expect(monthKeys[11]).toBe("2026-08");
    expect(monthKeys[0]).toBe("2025-09");
  });

  it("calculates accurate day alignment and week columns for a month", () => {
    const testMonth = new Date(2026, 1, 1); // Feb 2026
    const daysInFeb = getDaysInMonth(testMonth);
    const startDayOfWeek = startOfMonth(testMonth).getDay(); // Sunday = 0

    expect(daysInFeb).toBe(28);
    expect(startDayOfWeek).toBe(0); // Feb 1, 2026 is Sunday

    // Total columns needed for Feb 2026 with 28 days starting on Sunday is exactly 4 weeks (28 / 7 = 4)
    const totalSlots = startDayOfWeek + daysInFeb;
    const weekColumns = Math.ceil(totalSlots / 7);
    expect(weekColumns).toBe(4);
  });
});
