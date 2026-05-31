/**
 * Framer Motion Transition Presets
 * ----------------------------------
 * Consistent transition and spring configurations.
 */

import type { Transition } from 'framer-motion';

// ─── Spring Presets ──────────────────────────────────────────────────

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
  mass: 0.8,
};

export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
  mass: 1,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
  mass: 0.5,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 1,
};

// ─── Ease Presets ────────────────────────────────────────────────────

export const easeOut: Transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const easeInOut: Transition = {
  duration: 0.4,
  ease: [0.42, 0, 0.58, 1],
};

export const easeFastOut: Transition = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1],
};

export const easeSlowIn: Transition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1],
};

// ─── Layout Transition ──────────────────────────────────────────────

export const layoutTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// ─── Stagger Configuration ──────────────────────────────────────────

export const staggerConfig = {
  fast: 0.03,
  normal: 0.06,
  slow: 0.1,
  verySlow: 0.15,
} as const;
