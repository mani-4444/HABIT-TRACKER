import { cn } from "@/lib/utils";

/** The "H" tile used on the login and signup pages. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground shadow-ambient",
        className,
      )}
    >
      H
    </span>
  );
}
