import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  emoji?: string
  disabled?: boolean
}

export function HabitCheckbox({
  checked,
  onCheckedChange,
  label,
  emoji,
  disabled = false,
}: HabitCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border p-4 transition-all duration-200",
        "hover:border-primary/30 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked
          ? "border-success/30 bg-success-muted"
          : "border-border bg-card shadow-soft",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
          checked
            ? "border-success bg-success"
            : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
        )}
      >
        {checked && (
          <Check className="h-4 w-4 text-success-foreground animate-check-bounce" />
        )}
      </div>
      
      <div className="flex flex-1 items-center gap-3">
        {emoji && <span className="text-xl">{emoji}</span>}
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            checked ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {label}
        </span>
      </div>
    </button>
  )
}
