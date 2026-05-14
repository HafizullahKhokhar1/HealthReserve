import React from 'react';

export function DoctorCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col animate-pulse">
      {/* Avatar + Info Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex space-x-5 flex-1">
          {/* Avatar Placeholder */}
          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex-shrink-0"></div>
          
          {/* Text Content Placeholders */}
          <div className="flex-1 space-y-3">
            {/* Name and Verified Badge */}
            <div className="flex items-center gap-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-40"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-16"></div>
            </div>
            
            {/* Specialization + Experience + Hospital */}
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
            
            {/* Education */}
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3"></div>
            
            {/* Rating + Reviews */}
            <div className="flex items-center gap-2 pt-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-24"></div>
            </div>
          </div>
        </div>
        
        {/* Fee Badge */}
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl w-24 flex-shrink-0"></div>
      </div>
      
      {/* Buttons Section */}
      <div className="flex gap-3 mt-auto">
        <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}
