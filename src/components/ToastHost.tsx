import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { TOAST_EVENT, type ToastPayload } from '../lib/toast';

interface ToastItem extends ToastPayload {
  id: string;
}

const variantStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/90 dark:text-emerald-50',
  error: 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/40 dark:bg-rose-950/90 dark:text-rose-50',
  info: 'border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900/40 dark:bg-blue-950/90 dark:text-blue-50',
} as const;

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const;

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>;
      const payload = customEvent.detail;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: ToastItem = {
        id,
        title: payload.title,
        message: payload.message,
        variant: payload.variant || 'info',
      };

      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3200);
    };

    window.addEventListener(TOAST_EVENT, handleToast as EventListener);
    return () => window.removeEventListener(TOAST_EVENT, handleToast as EventListener);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 w-[min(92vw,24rem)] pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant || 'info'];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className={`pointer-events-auto rounded-3xl border p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-md ${variantStyles[toast.variant || 'info']}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold tracking-tight leading-tight">{toast.title}</p>
                  {toast.message && <p className="mt-1 text-sm opacity-90 leading-relaxed">{toast.message}</p>}
                </div>
                <button
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  className="shrink-0 rounded-full p-1 opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastHost;
