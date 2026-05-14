import React from 'react';
import { DoctorCardSkeleton } from './DoctorCardSkeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10">
      {/* Hero Section Skeleton */}
      <div className="bg-slate-200 dark:bg-slate-800 rounded-[32px] p-10 h-48 animate-pulse"></div>

      {/* Header + Online Status */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 animate-pulse"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-32 animate-pulse"></div>
      </div>

      {/* Filter Section Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-32 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-24"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Count + Doctor Cards */}
      <div className="space-y-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-48 animate-pulse"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
