import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card } from './ui/core';
import { Star, MapPin, Briefcase, CheckCircle, X, Loader } from 'lucide-react';
import FloatingChat from './FloatingChat';

interface DoctorProfileProps {
  open: boolean;
  onClose: () => void;
  doctor: any;
}

export function DoctorProfileModal({ open, onClose, doctor }: DoctorProfileProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !doctor) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const q = query(collection(db, 'reviews'), where('doctorId', '==', doctor.userId));
        const snap = await getDocs(q);
        const docs: any[] = [];
        snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
        if (mounted) setReviews(docs);
      } catch (e) {
        console.error('Failed to load reviews for doctor', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [open, doctor]);

  if (!open || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      {/* Main Modal with Profile */}
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden mr-96">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-2xl font-bold dark:text-slate-100">Doctor Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close profile"
          >
            <X className="w-6 h-6 dark:text-slate-400" />
          </button>
        </div>

        {/* Content - LinkedIn-style Profile */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Doctor Info Section */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                {doctor.name?.charAt(0).toUpperCase()}
              </div>

              {/* Doctor Details */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold dark:text-slate-100">{doctor.name}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                  {doctor.specialization}
                </p>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold dark:text-slate-100">
                        {doctor.rating ? doctor.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">
                      {doctor.reviewCount || 0} reviews
                    </span>
                  </div>

                  {doctor.verified && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold dark:text-slate-100 mb-4">About</h2>
            <div className="space-y-3">
              {doctor.experience && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <span className="dark:text-slate-300">
                    <strong>{doctor.experience}+ years</strong> of experience
                  </span>
                </div>
              )}
              {doctor.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="dark:text-slate-300">{doctor.city}</span>
                </div>
              )}
              {doctor.clinic && (
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <span className="dark:text-slate-300">{doctor.clinic}</span>
                </div>
              )}
              {doctor.fees && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded">
                    {doctor.currency} {doctor.fees}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-bold dark:text-slate-100 mb-4">
                Patient Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.slice(0, 5).map(review => (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium dark:text-slate-100">
                        {review.patientName}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          )}
        </div>
      </Card>

      {/* Floating Chat Panel on the Right */}
      <FloatingChat doctor={doctor} reviews={reviews} isOpen={open} onClose={() => {}} />
    </div>
  );
}

export default DoctorProfileModal;
