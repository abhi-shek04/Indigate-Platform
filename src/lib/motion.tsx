"use client";

import { motion, type Variants, type Transition } from "framer-motion";
import * as React from "react";

// ---- Easing curves (premium, cinematic) ----
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeInOutQuart: Transition["ease"] = [0.76, 0, 0.24, 1];
export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.8,
};
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

// ---- Reusable variants ----
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easeOutExpo } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// Stagger container — children fade up in sequence
export const staggerContainer = (
  stagger = 0.08,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

// ---- Scroll-reveal wrapper ----
// Animates children into view when scrolled into the viewport.
export function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  once = true,
  amount = 0.2,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  variants?: Variants;
  delay?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

// Staggered container that reveals on scroll
export function RevealGroup({
  children,
  stagger = 0.08,
  delayChildren = 0,
  once = true,
  amount = 0.15,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}

export { motion };
