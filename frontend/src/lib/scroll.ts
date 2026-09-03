import { useEffect, useState, type RefObject } from "react";

/**
 * Premium scroll-motion toolkit.
 *
 * Design rules:
 *  - rAF-driven, transform/opacity only (GPU-friendly, no layout thrash)
 *  - scroll progress is read once per frame, never continuously
 *  - every hook no-ops cleanly when the user prefers reduced motion
 *  - modules are independent: remove one without touching the others
 */

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scroll progress (0 → 1) of a section from the moment its top reaches the
 * viewport bottom until its bottom leaves the viewport top.
 */
export function useSectionProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let running = false;
    const measure = () => {
      running = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const scrolled = vh - rect.top;
      const p = Math.min(1, Math.max(0, scrolled / total));
      setProgress(prev => (Math.abs(prev - p) > 0.001 ? p : prev));
    };
    const onScroll = () => {
      if (!running) { running = true; raf = requestAnimationFrame(measure); }
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return progress;
}

/** Progress (0 → 1) across a pinned range: from `startOffset` px above the
 * element's top hitting the viewport top, over `length` px of scrolling. */
export function usePinProgress(ref: RefObject<HTMLElement | null>, length: number): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let running = false;
    const measure = () => {
      running = false;
      const rect = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / length));
      setProgress(prev => (Math.abs(prev - p) > 0.001 ? p : prev));
    };
    const onScroll = () => {
      if (!running) { running = true; raf = requestAnimationFrame(measure); }
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, length]);
  return progress;
}

/** True once the element has entered the viewport (fires once by default). */
export function useInView<T extends HTMLElement>(ref: RefObject<T | null>, {
  threshold = 0.2,
  once = true,
  rootMargin = "0px 0px -8% 0px",
} = {}): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, once, rootMargin]);
  return inView;
}

/** Parallax: element translates vertically by `strength` px across its
 * viewport transit. rAF-throttled, transform-only, disabled for reduced
 * motion and on small screens. */
export function useParallax(ref: RefObject<HTMLElement | null>, strength = 60): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;
    let raf = 0;
    let running = false;
    const update = () => {
      running = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const mid = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-mid / vh) * strength}px, 0)`;
    };
    const onScroll = () => {
      if (!running) { running = true; raf = requestAnimationFrame(update); }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.style.transform = "";
    };
  }, [ref, strength]);
}

/** Hero exit choreography: returns multipliers driven by scroll progress
 * over the first `range` px of scrolling. */
export function useHeroProgress(range = 480): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    let running = false;
    const measure = () => {
      running = false;
      const p = Math.min(1, Math.max(0, window.scrollY / range));
      setProgress(prev => (Math.abs(prev - p) > 0.001 ? p : prev));
    };
    const onScroll = () => {
      if (!running) { running = true; raf = requestAnimationFrame(measure); }
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [range]);
  return progress;
}

/** Map a progress value through an easing curve. */
export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function remap(progress: number, from: number, to: number): number {
  return clamp01((progress - from) / (to - from));
}
