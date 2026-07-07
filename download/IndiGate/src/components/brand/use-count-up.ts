"use client";

import { useEffect, useRef, useState } from "react";

// Count-up animation using requestAnimationFrame.
// Re-animates when the target value changes (e.g. when API data loads).
export function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(target);
  const prevTargetRef = useRef(target);

  useEffect(() => {
    if (target === prevTargetRef.current) return;
    prevTargetRef.current = target;
    if (target === 0) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
