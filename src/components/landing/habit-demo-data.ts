import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * Deterministic sample data for the landing-page habit grid.
 * Every insight sentence is computed from the generated cells, so the
 * numbers it quotes always match the squares it highlights.
 */

export const DEMO_WEEKS = 12;

export type DemoCellState = "done" | "missed" | "today" | "future";

export interface DemoCell {
  key: string;
  date: Date;
  /** 0 = Monday … 6 = Sunday */
  row: number;
  /** 0 = oldest week … DEMO_WEEKS - 1 = current week */
  col: number;
  /** Days before today (0 = today, negative = future). */
  offset: number;
  state: DemoCellState;
}

export interface DemoInsight {
  text: string;
  evidence: DemoCell[];
}

export interface DemoHabit {
  id: string;
  name: string;
  /** Consecutive completed days ending yesterday. */
  baseStreak: number;
  seed: number;
  /** Chance of a miss per weekday, Monday first. */
  missRate: number[];
  insight: (cells: DemoCell[], streak: number) => DemoInsight;
}

function seededRandom(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const missed = (cells: DemoCell[]) => cells.filter((c) => c.state === "missed");

export const DEMO_HABITS: DemoHabit[] = [
  {
    id: "read",
    name: "Read 30 min",
    baseStreak: 14,
    seed: 11,
    missRate: [0.2, 0.18, 0.2, 0.22, 0.26, 0.3, 0.28],
    insight: (cells, streak) => {
      const tracked = cells.filter((c) => c.state === "done" || c.state === "missed");
      const done = tracked.filter((c) => c.state === "done").length;
      return {
        text: `${streak} days in a row without a miss, and ${done} of your last ${tracked.length} days overall.`,
        evidence: cells.filter((c) => c.state === "done" && c.offset <= streak && c.offset >= 0),
      };
    },
  },
  {
    id: "walk",
    name: "Morning walk",
    baseStreak: 5,
    seed: 42,
    missRate: [0.05, 0.72, 0.05, 0.07, 0.05, 0.08, 0.08],
    insight: (cells) => {
      const misses = missed(cells);
      const tuesdays = misses.filter((c) => c.row === 1);
      return {
        text: `Tuesday is your weak spot: ${tuesdays.length} of your ${misses.length} missed walks fell on one.`,
        evidence: tuesdays,
      };
    },
  },
  {
    id: "sugar",
    name: "No sugar after 8 PM",
    baseStreak: 3,
    seed: 7,
    missRate: [0.04, 0.04, 0.05, 0.06, 0.12, 0.62, 0.55],
    insight: (cells) => {
      const misses = missed(cells);
      const weekend = misses.filter((c) => c.row >= 5);
      return {
        text: `Weekends are where it slips: ${weekend.length} of your ${misses.length} misses were on a Saturday or Sunday.`,
        evidence: weekend,
      };
    },
  },
];

export function buildDemoCells(today: Date, habit: DemoHabit): DemoCell[] {
  const day = startOfDay(today);
  const rand = seededRandom(habit.seed);
  const todayRow = (day.getDay() + 6) % 7;
  const start = addDays(day, -todayRow - 7 * (DEMO_WEEKS - 1));
  const cells: DemoCell[] = [];

  for (let col = 0; col < DEMO_WEEKS; col++) {
    for (let row = 0; row < 7; row++) {
      const date = addDays(start, col * 7 + row);
      const offset = differenceInCalendarDays(day, date);
      let state: DemoCellState;

      if (offset < 0) state = "future";
      else if (offset === 0) state = "today";
      else if (offset <= habit.baseStreak) state = "done";
      else if (offset === habit.baseStreak + 1) state = "missed";
      else {
        // Misses thin out over time: older weeks are shakier than recent ones.
        const age = offset / (DEMO_WEEKS * 7);
        state = rand() < habit.missRate[row] * (0.55 + 0.9 * age) ? "missed" : "done";
      }

      cells.push({ key: `${col}-${row}`, date, row, col, offset, state });
    }
  }

  return cells;
}
