import { useEffect, useRef, useState } from "react";

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Counts from 0 up to `value` over `duration` ms whenever `value` changes.
 * Honours prefers-reduced-motion by settling on the final value immediately.
 */
export function useCountUp(value, duration = 600) {
  const [display, setDisplay] = useState(value);
  const frame = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !Number.isFinite(value)) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      // rAF hands back the frame start time, which can precede `start`; without
      // the lower clamp the easing curve goes negative and the number flashes
      // below zero on the first frame.
      const progress = Math.min(Math.max((now - start) / duration, 0), 1);
      setDisplay(value * easeOut(progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return display;
}
