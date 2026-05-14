import React, { useEffect, useState } from 'react';
import { Loader, AlertCircle, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/core';

interface SmartLoaderProps {
  duration?: number; // How long to wait before showing error
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
  showAfter?: number; // Only show loader after this many ms (to avoid flashing)
}

/**
 * Intelligent loader that shows error after timeout
 * Useful for detecting network issues or slow responses
 */
export function SmartLoader({
  duration = 30000, // 30 seconds
  message = 'Syncing Health Data...',
  errorMessage = 'Taking longer than expected. Please check your connection.',
  onRetry,
  showAfter = 500,
}: SmartLoaderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), showAfter);
    const timeoutTimer = setTimeout(() => setHasTimedOut(true), duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(timeoutTimer);
    };
  }, [duration, showAfter]);

  if (!isVisible) return null;

  if (hasTimedOut) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 px-6"
      >
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Connection Issue
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
          {errorMessage}
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <Wifi size={18} />
            Retry
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="mb-4"
      >
        <Loader size={48} className="text-blue-600 dark:text-blue-400" />
      </motion.div>
      <p className="text-slate-500 dark:text-slate-400 font-medium">{message}</p>
    </motion.div>
  );
}

/**
 * Skeleton shimmer animation
 */
export function SkeletonShimmer() {
  return (
    <motion.div
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="w-full h-full bg-gradient-to-r from-slate-200 via-white to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

/**
 * Pulse animation for skeleton loaders
 */
export function PulseAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}