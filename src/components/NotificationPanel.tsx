import React from 'react';
import { Card, Button, cn } from './ui/core';
import { Bell, X } from 'lucide-react';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-24 z-50 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg dark:text-slate-100">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-400 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">You'll get notified about appointments and updates here</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <Button variant="ghost" className="w-full text-center text-sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
