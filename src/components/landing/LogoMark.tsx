import { cn } from "@/lib/utils";

/** Three logged days and today's square, highlighted. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid h-7 w-7 shrink-0 grid-cols-2 gap-[3px]", className)}
    >
      <span className="rounded-[3px] bg-foreground" />
      <span className="rounded-[3px] bg-foreground" />
      <span className="rounded-[3px] bg-foreground" />
      <span className="rounded-[3px] bg-highlight shadow-[inset_0_0_0_1.5px_hsl(var(--foreground))]" />
    </span>
  );
}
