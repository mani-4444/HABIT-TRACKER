import { cn } from "@/lib/utils";

/** Four logged days, one colour per habit. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid h-8 w-8 shrink-0 rotate-[-6deg] grid-cols-2 gap-[3px]", className)}
    >
      <span className="rounded-[4px] bg-brand-violet" />
      <span className="rounded-[4px] bg-brand-coral" />
      <span className="rounded-[4px] bg-brand-mint" />
      <span className="rounded-[4px] bg-brand-sun" />
    </span>
  );
}
