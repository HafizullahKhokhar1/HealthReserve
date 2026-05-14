import React, { useEffect, useState } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/core';

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <WifiOff size={20} className="text-yellow-600 dark:text-yellow-500" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              You're offline. Some features may not work properly.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Error boundary for network-specific issues
 */
export function NetworkErrorHandler({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  if (!error) return null;

  const isNetworkError = 
    error.message.includes('network') ||
    error.message.includes('Network') ||
    error.message.includes('fetch');

  if (!isNetworkError) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-4">
      <AlertCircle size={20} className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Connection Error</h3>
        <p className="text-sm text-red-800 dark:text-red-300 mb-4">
          {error.message || 'Unable to connect to the server. Please check your internet connection.'}
        </p>
        <Button size="sm" onClick={onRetry} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}

/**
 * Higher-order component for handling async operations with network errors
 */
export function withNetworkError<P extends object>(
  Component: React.ComponentType<P & { isLoading: boolean; error: Error | null; retry: () => void }>,
) {
  return (props: P) => {
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const retry = () => {
      setError(null);
      setIsLoading(false);
    };

    return (
      <div>
        <NetworkStatusBanner />
        {error && <NetworkErrorHandler error={error} onRetry={retry} />}
        <Component {...props} isLoading={isLoading} error={error} retry={retry} />
      </div>
    );
  };
}