import { useEffect, useRef } from "react";

/**
 * Marks every `[data-reveal]` element inside the returned ref with
 * `data-shown` the first time it scrolls into view. The CSS in index.css
 * handles the actual transition (and turns it off for reduced motion).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const show = (el: Element) => el.setAttribute("data-shown", "");

    if (!("IntersectionObserver" in window)) {
      targets.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return ref;
}
