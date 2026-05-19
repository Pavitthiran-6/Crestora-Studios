import { useEffect, RefObject } from "react";

/**
 * useSmoothScroll — RAF lerp-based smooth scroll.
 *
 * Supports two modes:
 *  - Custom container div  →  pass containerRef
 *  - Window / document     →  pass null / omit containerRef
 *
 * How it works:
 *  1. Intercepts wheel & touch events, preventing default browser scroll.
 *  2. Accumulates a float "target" scroll position.
 *  3. Every RAF tick, lerps actual scrollTop → target with configurable ease.
 *  4. Because el.scrollTop is always the authoritative value, Framer Motion's
 *     useScroll / useScrollYProgress reads it correctly — zero interference.
 *
 * Ease guide:
 *  0.06 = ultra smooth / floaty
 *  0.09 = premium Apple-like  ← default
 *  0.12 = snappy smooth
 *  0.18 = near-instant
 */
export function useSmoothScroll(
  containerRef?: RefObject<HTMLDivElement | null>,
  ease = 0.08
) {
  useEffect(() => {
    const el: HTMLElement | null = containerRef 
      ? containerRef.current 
      : document.documentElement;

    if (!el) return;

    // Apply minimal hints without breaking CSS fixed positioning context
    // We removed transform: translateZ(0) and will-change: transform 
    // because they force the container to act as the coordinate system for position: fixed elements,
    // which breaks modals rendered inside this container.
    el.style.backfaceVisibility = "hidden";

    let target = el.scrollTop;
    let current = el.scrollTop;
    let raf = 0;
    let touchStartY = 0;
    let isScrolling = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, lo: number, hi: number) =>
      Math.min(Math.max(v, lo), hi);

    const tick = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      target = clamp(target, 0, maxScroll);

      const diff = target - current;

      // Use a slightly larger threshold to prevent tiny sub-pixel updates that cause lag
      if (Math.abs(diff) < 0.4) {
        current = target;
        el.scrollTop = target;
        isScrolling = false;
        return;
      }

      current = lerp(current, target, ease);
      el.scrollTop = current; 
      raf = requestAnimationFrame(tick);
    };

    const startTick = () => {
      if (!isScrolling) {
        isScrolling = true;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      let delta = e.deltaY;
      
      // Precision handling for different delta modes
      if (e.deltaMode === 1) delta *= 40;  
      if (e.deltaMode === 2) delta *= 800; 
      
      target += delta;
      startTick();
    };

    const onTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      // Don't prevent default if we want native behavior, but we want smooth
      e.preventDefault();
      e.stopPropagation();
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      target += dy * 1.8; // Increased sensitivity for mobile fluidity
      startTick();
    };

    const onNativeScroll = () => {
      if (!isScrolling) {
        target = el.scrollTop;
        current = el.scrollTop;
      }
    };

    const onFocusIn = () => {
      // When tabbing, the browser might natively scroll the container.
      // We need to immediately sync our target to prevent jumps.
      setTimeout(() => {
        target = el.scrollTop;
        current = el.scrollTop;
      }, 0);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("scroll", onNativeScroll, { passive: true });
    el.addEventListener("focusin", onFocusIn, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("scroll", onNativeScroll);
      el.removeEventListener("focusin", onFocusIn);
      cancelAnimationFrame(raf);
    };
  }, [containerRef?.current, ease]); // Dependent on the actual element
}
