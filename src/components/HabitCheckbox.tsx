import * as React from "react";
import { Check, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  emoji?: string;
  disabled?: boolean;
  streak?: number;
  isAtRisk?: boolean;
}

export function HabitCheckbox({
  checked,
  onCheckedChange,
  label,
  emoji,
  disabled = false,
  streak,
  isAtRisk = false,
}: HabitCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border p-4 transition-colors duration-150",
        "hover:border-primary/30 hover:bg-accent/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-success/30 bg-success-muted shadow-sm"
          : "border-border/50 bg-card shadow-sm",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors duration-150",
          checked
            ? "border-success bg-success shadow-inner"
            : "border-border bg-background shadow-inner group-hover:border-primary/50 group-hover:bg-primary/5",
        )}
      >
        {checked && <Check className="h-4 w-4 text-success-foreground" />}
      </div>

      <div className="flex flex-1 items-center gap-3">
        {emoji && <span className="text-xl">{emoji}</span>}
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            checked ? "text-muted-foreground line-through" : "text-foreground",
          )}
        >
          {label}
        </span>
      </div>

      {/* Streak indicator - simple, static presentation */}
      {streak !== undefined && (
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-semibold",
            streak === 0
              ? "text-muted-foreground/50"
              : isAtRisk
                ? "text-amber-500"
                : "text-orange-500",
          )}
          title={
            isAtRisk && streak > 0
              ? `${streak} day streak (pending today)`
              : streak > 0
                ? `${streak} day streak`
                : "No active streak"
          }
        >
          <Flame className="h-4 w-4" />
          <span>{streak}</span>
        </div>
      )}
    </button>
  );
}
