"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";
import { springSoft } from "@/lib/motion";

/**
 * MagneticButton — subtly follows the cursor on hover for a premium feel.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  ...props
}: React.ComponentProps<typeof motion.button> & { strength?: number }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * strength);
    y.set(relY * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * SpotlightCard — a cursor-following radial spotlight on hover.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 153, 51, 0.12)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, ${spotlightColor}, transparent 45%)`,
  );

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("group relative overflow-hidden", className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/**
 * TiltCard — subtle 3D tilt on hover with depth.
 */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 300, damping: 20 });
  const sry = useSpring(ry, { stiffness: 300, damping: 20 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      transition={springSoft}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollProgress — a thin gradient bar at the very top of the viewport
 * that tracks reading progress.
 */
export function ScrollProgress() {
  const scaleX = useSpring(useMotionValue(0), {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      scaleX.set(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scaleX]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-brand-gradient"
      style={{ scaleX }}
    />
  );
}

/**
 * ShimmerText — animated gradient sweep across text.
 */
export function ShimmerText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block bg-[linear-gradient(110deg,var(--ink),var(--ink),var(--saffron),var(--crimson),var(--ink))] bg-[length:200%_100%] bg-clip-text text-transparent [background-position:200%_0] animate-[shimmer-text_4s_linear_infinite]",
        className,
      )}
    >
      {children}
    </span>
  );
}
