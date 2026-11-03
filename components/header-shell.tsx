"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";

/** Шапка уезжает вверх при прокрутке вниз и возвращается при прокрутке вверх или фокусе с клавиатуры. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(y - prev) < 4) return; // мелкая прокрутка не дёргает шапку
    setHidden(y > prev && y > 160);
  });

  return (
    <motion.header
      className="sticky top-0 z-30"
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onFocusCapture={() => setHidden(false)}
    >
      {children}
    </motion.header>
  );
}
