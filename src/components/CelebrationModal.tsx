// CelebrationModal has been simplified to remove gamification, auto-close timers,
// modal popups, and confetti per discipline product guidelines.
export interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
}

export function CelebrationModal(_props: CelebrationModalProps) {
  return null;
}
