import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/core';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.reset} className="flex items-center gap-2">
            <RefreshCw size={18} />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary alternative using try-catch
 */
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) throw error;
  }, [error]);

  return setError;
}