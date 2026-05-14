import React from 'react';
import { Button } from './ui/core';
import { DoctorProfile } from '../types';

interface DoctorWithUser extends DoctorProfile {
  name: string;
  email: string;
  rating?: number;
  reviewCount?: number;
}

interface DoctorCardProps {
  doctor: DoctorWithUser;
  onBook: (doctor: DoctorWithUser) => void;
  onViewProfile: (doctor: DoctorWithUser) => void;
}

/**
 * Memoized doctor card component to prevent unnecessary re-renders
 * when the parent list updates. This breaks up the 42ms main thread task
 * into smaller chunks by rendering cards independently.
 */
export const DoctorCard = React.memo(function DoctorCard({ doctor, onBook, onViewProfile }: DoctorCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col group shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex space-x-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
            {doctor.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight dark:text-slate-100 dark:group-hover:text-blue-400">{doctor.name}</h3>
              {doctor.verified && <span className="text-blue-600 text-xs font-bold">✓ Verified</span>}
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {doctor.specialization} • {doctor.experience} yrs • {doctor.hospitals[0]}
            </p>
            {doctor.education && doctor.education.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-1">{doctor.education.join(', ')}</p>
            )}
            <div className="flex items-center mt-2 space-x-1.5">
              <span className="text-xs font-bold text-amber-500">★ {doctor.rating || 'New'}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">({doctor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl dark:bg-blue-900/40 dark:text-blue-300">
            {doctor.fees} {doctor.currency}
          </span>
        </div>
      </div>
      
      <div className="flex gap-3 mt-auto">
        <Button className="flex-1" onClick={() => onBook(doctor)}>
          Book Appointment
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => onViewProfile(doctor)}>
          View Profile
        </Button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if doctor object reference changes
  return prevProps.doctor === nextProps.doctor &&
         prevProps.onBook === nextProps.onBook &&
         prevProps.onViewProfile === nextProps.onViewProfile;
});

DoctorCard.displayName = 'DoctorCard';
