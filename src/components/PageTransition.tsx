import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  key?: string;
}

/**
 * Wraps page content with smooth fade and slide-in animations
 * Usage: <PageTransition><YourPageContent /></PageTransition>
 */
export function PageTransition({ children, key }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Smooth fade animation
 */
export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered item animation (for lists)
 */
export function StaggerContainer({ children, staggerDelay = 0.1 }: { children: React.ReactNode; staggerDelay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale animation for cards
 */
export function ScaleIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Modal/Drawer entrance animation
 */
export function ModalEnter({ children, isOpen = true }: { children: React.ReactNode; isOpen?: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="relative z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}