'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// --- FadeIn ---
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.4, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- StaggerContainer + StaggerItem ---
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const staggerContainerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: { staggerChildren: staggerDelay },
  }),
};

export function StaggerContainer({ children, staggerDelay = 0.06, className }: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// --- PageTransition ---
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- AnimatedBar ---
interface AnimatedBarProps {
  percentage: number;
  color?: string;
  height?: string;
  delay?: number;
  className?: string;
}

export function AnimatedBar({ percentage, color = 'bg-primary', height = 'h-2', delay = 0, className }: AnimatedBarProps) {
  return (
    <motion.div
      className={`${color} ${height} rounded-full ${className ?? ''}`}
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    />
  );
}

// --- ScaleOnTap ---
interface ScaleOnTapProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnTap({ children, className, scale = 0.97 }: ScaleOnTapProps) {
  return (
    <motion.div whileTap={{ scale }} className={className}>
      {children}
    </motion.div>
  );
}

// --- AnimatedTabContent ---
interface AnimatedTabContentProps {
  children: ReactNode;
  tabKey: string;
  className?: string;
}

export function AnimatedTabContent({ children, tabKey, className }: AnimatedTabContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export { AnimatePresence, motion };
