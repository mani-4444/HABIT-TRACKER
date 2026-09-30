import { describe, it, expect } from "vitest";
import { addDays } from "date-fns";
import {
  DEMO_HABITS,
  DEMO_WEEKS,
  buildDemoCells,
} from "@/components/landing/habit-demo-data";

const habit = (id: string) => DEMO_HABITS.find((h) => h.id === id)!;
const days = Array.from({ length: 366 }, (_, i) => addDays(new Date(2026, 0, 1), i));

describe("landing habit demo data", () => {
  it("builds a full grid with today in the last column", () => {
    for (const day of days.slice(0, 14)) {
      const cells = buildDemoCells(day, habit("read"));
      expect(cells).toHaveLength(DEMO_WEEKS * 7);
      const today = cells.filter((c) => c.state === "today");
      expect(today).toHaveLength(1);
      expect(today[0].col).toBe(DEMO_WEEKS - 1);
    }
  });

  it("keeps the reading streak exact", () => {
    const h = habit("read");
    for (const day of days) {
      const cells = buildDemoCells(day, h);
      const { evidence } = h.insight(cells, h.baseStreak);
      expect(evidence).toHaveLength(h.baseStreak);
      expect(cells.find((c) => c.offset === h.baseStreak + 1)?.state).toBe("missed");
    }
  });

  it("makes Tuesday the most-missed day for walks, every day of the year", () => {
    const h = habit("walk");
    for (const day of days) {
      const cells = buildDemoCells(day, h);
      const perRow = [0, 0, 0, 0, 0, 0, 0];
      cells.filter((c) => c.state === "missed").forEach((c) => perRow[c.row]++);
      const others = perRow.filter((_, row) => row !== 1);
      expect(perRow[1]).toBeGreaterThan(Math.max(...others));
    }
  });

  it("puts most sugar slips on weekends, every day of the year", () => {
    const h = habit("sugar");
    for (const day of days) {
      const cells = buildDemoCells(day, h);
      const { evidence } = h.insight(cells, h.baseStreak);
      const misses = cells.filter((c) => c.state === "missed").length;
      expect(evidence.length * 2).toBeGreaterThan(misses);
    }
  });
});
