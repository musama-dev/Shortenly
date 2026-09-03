import { useEffect } from "react";
import { prefersReducedMotion } from "./scroll";

/**
 * Wires up every `[data-reveal]` element inside the ref scope. One observer
 * for the whole tree — cheap, and independent of the elements themselves.
 */
export function useRevealScope(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (prefersReducedMotion()) {
      els.forEach(el => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}
