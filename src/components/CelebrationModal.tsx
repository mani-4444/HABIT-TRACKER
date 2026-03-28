import { useEffect, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

interface ConfettiParticleData {
  color: string;
  left: number;
  delay: number;
  duration: number;
}

const CONFETTI_COLORS = [
  "bg-yellow-400",
  "bg-pink-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
];

const CONFETTI_COUNT = 30;

// Generate stable confetti data once
function generateConfettiData(): ConfettiParticleData[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, index) => ({
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
  }));
}

// Simple confetti particle using CSS
function ConfettiParticle({ data }: { data: ConfettiParticleData }) {
  return (
    <div
      className={cn(
        "absolute w-2 h-2 rounded-full opacity-0",
        data.color,
        "animate-confetti",
      )}
      style={{
        left: `${data.left}%`,
        top: "-10px",
        animationDelay: `${data.delay}s`,
        animationDuration: `${data.duration}s`,
      }}
    />
  );
}

export function CelebrationModal({
  open,
  onClose,
  autoCloseDelay = 3000,
}: CelebrationModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Memoize confetti data to prevent re-generation on re-renders
  // Re-generates only when modal opens (open changes to true)
  const confettiData = useMemo(() => {
    if (!open) return [];
    return generateConfettiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-close after delay
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [open, autoCloseDelay, handleClose]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      {/* Overlay with backdrop blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Confetti container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiData.map((data, i) => (
          <ConfettiParticle key={i} data={data} />
        ))}
      </div>

      {/* Modal content */}
      <div className="relative z-10 w-[90vw] max-w-md mx-4 animate-celebration-enter">
        <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-2xl p-10 text-center relative overflow-hidden ring-1 ring-white/10">
          {/* Gradient background accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-primary/10 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm hover:shadow transition-all duration-200"
            aria-label="Close celebration modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="text-7xl animate-bounce drop-shadow-lg mb-4">🎉</div>

            {/* Title */}
            <h2
              id="celebration-title"
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              Congratulations!
            </h2>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg">
              You completed all your habits today!
            </p>

            {/* Motivational message */}
            <p className="text-sm text-muted-foreground/80 pt-2">
              Amazing work! Keep building that consistency. 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
