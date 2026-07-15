"use client";

import { useEffect, useRef, useState } from "react";

// Count-up animation using requestAnimationFrame.
// Restarts the animation whenever `target` changes (e.g. when stats load).
export function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (target <= 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    rafRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
