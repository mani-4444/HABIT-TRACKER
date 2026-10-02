import type { CSSProperties } from "react";
import type { HabitHealthCategory } from "@/lib/health";

/** Sets the `--tone` variable used by the `.tone-*` helpers in index.css. */
export const toneStyle = (tone: string): CSSProperties =>
  ({ "--tone": `var(${tone})` }) as CSSProperties;

export const HEALTH_TONES: Record<HabitHealthCategory, { label: string; tone: string }> = {
  strong: { label: "Strong", tone: "--tone-mint" },
  on_track: { label: "On Track", tone: "--tone-sky" },
  at_risk: { label: "At Risk", tone: "--tone-amber" },
  ignored: { label: "Ignored", tone: "--tone-rose" },
  new: { label: "New habit", tone: "--tone-slate" },
};
