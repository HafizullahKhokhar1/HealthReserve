import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Appointment, Review } from '../types';
import { Card, Button, cn } from '../components/ui/core';
import { Calendar, Clock, Stethoscope, User, XCircle, CheckCircle2, History, RefreshCw, Star } from 'lucide-react';
import { showToast } from '../lib/toast';

export function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleApp, setRescheduleApp] = useState<Appointment | null>(null);
  const [reviewApp, setReviewApp] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const field = user.role === 'patient' ? 'patientId' : 'doctorId';
    const q = query(
      collection(db, 'appointments'), 
      where(field, '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps: Appointment[] = [];
      snapshot.forEach(d => {
        apps.push({ id: d.id, ...d.data() } as Appointment);
      });
      // Sort: Upcoming soonest, then by date descending
      apps.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
      setAppointments(apps);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => unsubscribe();
  }, [user]);

  const cancelAppointment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const active = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const past = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  if (loading) {
    return (
      <div className="p-10">
        <div className="h-40 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-10 space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-2 dark:text-slate-100">My Health Sessions</h1>
        <p className="text-slate-500 font-medium dark:text-slate-400">History of your medical interactions and scheduled visits.</p>
      </div>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight dark:text-slate-100">Upcoming & Active</h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center justify-center h-6 min-w-6">
            {active.length}
          </span>
        </div>
        
        {active.length === 0 ? (
          <Card className="text-center py-20 bg-slate-50/20 border-dashed border-2 flex flex-col items-center dark:bg-slate-900/20 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-800 dark:text-slate-600">
              <Calendar size={40} />
            </div>
            <p className="text-slate-400 font-bold text-xl mb-2 tracking-tight">No Active Sessions</p>
            <p className="text-slate-400/60 text-sm font-medium">Your confirmed appointments will appear here.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {active.map(app => (
              <AppointmentItem 
                key={app.id} 
                app={app} 
                isPatient={user?.role === 'patient'} 
                onCancel={() => cancelAppointment(app.id)}
                onReschedule={() => setRescheduleApp(app)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight dark:text-slate-100">Session Archive</h2>
          <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center justify-center h-6 min-w-6 dark:bg-slate-800 dark:text-slate-400">
            {past.length}
          </span>
        </div>
        <div className="grid gap-6">
          {past.map(app => (
            <AppointmentItem 
              key={app.id} 
              app={app} 
              isPatient={user?.role === 'patient'} 
              onReview={app.status === 'completed' ? () => setReviewApp(app) : undefined}
            />
          ))}
        </div>
      </section>

      {rescheduleApp && (
        <RescheduleModal 
          appointment={rescheduleApp} 
          onClose={() => setRescheduleApp(null)}
          onReschedule={async (newDate, newTime) => {
            try {
              await updateDoc(doc(db, 'appointments', rescheduleApp.id), { 
                date: newDate,
                time: newTime,
                rescheduledAt: new Date().toISOString()
              });
              setRescheduleApp(null);
            } catch (error) {
              handleFirestoreError(error, OperationType.UPDATE, `appointments/${rescheduleApp.id}`);
            }
          }}
        />
      )}

      {reviewApp && user?.role === 'patient' && (
        <ReviewModal 
          appointment={reviewApp} 
          onClose={() => setReviewApp(null)}
          onSubmit={async (rating, comment) => {
            try {
              await addDoc(collection(db, 'reviews'), {
                doctorId: reviewApp.doctorId,
                patientId: user.uid,
                patientName: user.name,
                appointmentId: reviewApp.id,
                rating,
                comment,
                createdAt: serverTimestamp()
              });
              setReviewApp(null);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, 'reviews');
            }
          }}
        />
      )}
    </div>
  );
}

function AppointmentItem({ app, isPatient, onCancel, onReschedule, onReview }: { 
  app: Appointment; 
  isPatient: boolean;
  onCancel?: () => void;
  onReschedule?: () => void;
  onReview?: () => void;
}) {
  const statusStyles = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
    confirmed: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30',
    completed: 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700',
    cancelled: 'bg-rose-50 text-rose-400 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30',
  };

  return (
    <Card className="!p-8 group shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 dark:bg-blue-900/30 dark:text-blue-400">
            {isPatient ? <Stethoscope size={32} /> : <User size={32} />}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
                {isPatient ? `Dr. ${app.doctorName}` : app.patientName}
              </h3>
              <div className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                statusStyles[app.status]
              )}>
                {app.status}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Calendar size={14} className="text-blue-600" />
                {app.date}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={14} className="text-blue-600" />
                {app.time}
              </div>
            </div>
          </div>
        </div>

        {onCancel && app.status === 'pending' && (
          <div className="flex gap-3 self-start md:self-center">
            <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20" onClick={onReschedule} icon={RefreshCw}>
              Reschedule
            </Button>
            <Button variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={onCancel} icon={XCircle}>
              Revoke Session
            </Button>
          </div>
        )}
        {onCancel && app.status === 'confirmed' && (
          <div className="flex gap-3 self-start md:self-center">
            <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20" onClick={onReschedule} icon={RefreshCw}>
              Reschedule
            </Button>
            <Button variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={onCancel} icon={XCircle}>
              Cancel
            </Button>
          </div>
        )}
        {isPatient && app.status === 'completed' && (
          <Button variant="ghost" className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20 self-start md:self-center" onClick={onReview} icon={Star}>
            Leave Review
          </Button>
        )}
      </div>
    </Card>
  );
}

function RescheduleModal({ appointment, onClose, onReschedule }: { 
  appointment: Appointment;
  onClose: () => void;
  onReschedule: (date: string, time: string) => Promise<void>;
}) {
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);
  const [loading, setLoading] = useState(false);

  const availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setLoading(true);
    try {
      await onReschedule(newDate, newTime);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reschedule Appointment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Date & Time</label>
            <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
              {appointment.date} at {appointment.time}
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Date *</label>
            <input 
              type="date" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Time *</label>
            <select 
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select a time slot</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleReschedule}
              loading={loading}
              disabled={!newDate || !newTime}
            >
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ReviewModal({ appointment, onClose, onSubmit }: { 
  appointment: Appointment;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (comment.trim().length < 10) {
      showToast({ title: 'Review too short', message: 'Please write at least 10 characters in your review.', variant: 'error' });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(rating, comment);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Share Your Experience</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">How would you rate Dr. {appointment.doctorName}?</label>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={cn(
                    'w-12 h-12 rounded-xl font-bold text-2xl transition-all',
                    rating >= star 
                      ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400' 
                      : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-2">{rating} Star{rating !== 1 ? 's' : ''}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Feedback *</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience... (minimum 10 characters)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-24 resize-none"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{comment.length} characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="ghost"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSubmit}
              loading={loading}
              disabled={comment.trim().length < 10}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
