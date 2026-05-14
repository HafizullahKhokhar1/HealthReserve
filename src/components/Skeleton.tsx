import React from 'react';
import { cn } from './ui/core';

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar Skeleton */}
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
        
        {/* Content Skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-48" />
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-40" />
        </div>

        {/* Price Skeleton */}
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-24 flex-shrink-0" />
      </div>

      {/* Button Skeleton */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

export function DoctorListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AppointmentSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48" />
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-64" />
      <div className="flex gap-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-24" />
      </div>
    </div>
  );
}

export function MedicalRecordSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-40" />
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      ))}
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-32" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
      <FilterSkeleton />
      <DoctorListSkeleton />
    </div>
  );
}