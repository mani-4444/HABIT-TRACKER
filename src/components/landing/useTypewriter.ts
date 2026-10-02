import { useEffect, useState } from "react";

/**
 * Reveals `text` a couple of characters at a time while `active` is true.
 * Shows the whole text at once when the visitor prefers reduced motion.
 */
export function useTypewriter(text: string, active = true, msPerStep = 22) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(timer);
          return c;
        }
        return c + 2;
      });
    }, msPerStep);
    return () => window.clearInterval(timer);
  }, [text, active, msPerStep]);

  return { shown: text.slice(0, count), done: count >= text.length };
}
