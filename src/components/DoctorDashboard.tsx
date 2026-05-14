import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DoctorProfile, Appointment, User } from '../types';
import { Card, Button, cn } from './ui/core';
import { Calendar, Clock, User as UserIcon, Check, X, ClipboardList, ShieldCheck } from 'lucide-react';
import { notifyAppointmentConfirmed, notifyAppointmentCompleted } from '../services/notificationService';
import { format } from 'date-fns';

export function DoctorDashboard({ profile }: { profile: DoctorProfile }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'appointments'), 
      where('doctorId', '==', profile.userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps: Appointment[] = [];
      snapshot.forEach(d => {
        apps.push({ id: d.id, ...d.data() } as Appointment);
      });
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
  }, [profile.userId]);

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      
      const app = appointments.find(a => a.id === id);
      if (app) {
        // Fetch patient details for notification
        const patientSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', app.patientId)));
        const patientData = patientSnap.docs[0]?.data() as User;

        if (status === 'confirmed' && patientData) {
          // Patient gets confirmation notification
          await notifyAppointmentConfirmed(
            patientData,
            { name: profile.userId, specialization: profile.specialization },
            app.date,
            app.time
          );
        }
        
        if (status === 'completed' && patientData) {
          // Patient gets review request after completion
          await notifyAppointmentCompleted(
            patientData,
            { name: profile.userId, specialization: profile.specialization }
          );
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const pending = appointments.filter(a => a.status === 'pending');
  const upcoming = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-2 dark:text-slate-100">Practice Dashboard</h1>
          <p className="text-slate-500 font-medium dark:text-slate-400">Overview of your daily schedule and consultation requests.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-100 p-6 rounded-[28px] flex items-center gap-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400">
              <ClipboardList size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Today's</p>
              <p className="text-2xl font-black text-slate-900 leading-none dark:text-slate-100">{upcoming.length}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] flex items-center gap-4 shadow-xl shadow-slate-900/10 dark:bg-slate-950 dark:border-slate-800">
            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1 text-white/50">Pending</p>
              <p className="text-2xl font-black text-white leading-none">{pending.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 dark:text-slate-100">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                Incoming Requests
              </h2>
            </div>
            
            {pending.length === 0 ? (
              <Card className="text-center py-20 bg-slate-50/20 border-dashed border-2 flex flex-col items-center dark:bg-slate-900/20 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-800 dark:text-slate-600">
                  <Check size={40} />
                </div>
                <p className="text-slate-400 font-bold text-xl mb-2 tracking-tight">Queue is Empty</p>
                <p className="text-slate-400/60 text-sm font-medium">New patient requests will appear here instantly.</p>
              </Card>
            ) : (
              <div className="grid gap-5">
                {pending.map(app => (
                  <AppointmentCard 
                    key={app.id} 
                    app={app} 
                    onConfirm={() => updateStatus(app.id, 'confirmed')}
                    onCancel={() => updateStatus(app.id, 'cancelled')}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 dark:text-slate-100">
                <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                Confirmed Schedule
              </h2>
            </div>
            {upcoming.length === 0 ? (
              <Card className="text-center py-20 bg-slate-50/20 border-dashed border-2 flex flex-col items-center dark:bg-slate-900/20 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-800 dark:text-slate-600">
                  <Calendar size={40} />
                </div>
                <p className="text-slate-400 font-bold text-xl mb-2 tracking-tight">No Events Scheduled</p>
                <p className="text-slate-400/60 text-sm font-medium">Approve requests to start filling your calendar.</p>
              </Card>
            ) : (
              <div className="grid gap-5">
                {upcoming.map(app => (
                  <AppointmentCard 
                    key={app.id} 
                    app={app} 
                    onComplete={() => updateStatus(app.id, 'completed')}
                    onCancel={() => updateStatus(app.id, 'cancelled')}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
            <Card className="sticky top-10 !p-8">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-bold tracking-tight dark:text-slate-100">Availability</h2>
               <div className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded-md font-bold uppercase tracking-widest dark:bg-slate-100 dark:text-slate-900">Live</div>
             </div>
             
             <div className="space-y-10">
               <div>
                 <p className="text-[10px] font-black text-slate-300 uppercase mb-5 tracking-[0.2em] text-center dark:text-slate-500">Active Days</p>
                 <div className="grid grid-cols-7 gap-2">
                   {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                     const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                     const isActive = profile.availability.days.includes(fullDays[idx]);
                     return (
                       <div key={idx} className="flex flex-col items-center gap-2">
                         <div className={cn(
                           "aspect-square w-full rounded-xl flex items-center justify-center text-[10px] font-black transition-all",
                           isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-50 text-slate-300 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600"
                         )}>
                           {day}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                 <p className="text-[10px] font-black text-slate-300 uppercase mb-5 tracking-[0.2em] text-center dark:text-slate-500">Managed Slots</p>
                 <div className="grid grid-cols-3 gap-2">
                   {profile.availability.slots.map(slot => (
                     <div key={slot} className="text-center py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                       {slot}
                     </div>
                   ))}
                 </div>
               </div>

               <Button 
                variant="outline" 
                className="w-full mt-4 bg-slate-900 text-white border-none hover:bg-slate-800"
                onClick={() => setShowEditModal(true)}
               >
                 Modify Schedule
               </Button>
             </div>
           </Card>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-3">Enterprise Support</p>
            <p className="text-3xl font-black mb-6 tracking-tight">Clinic Help</p>
            <Button variant="secondary" className="w-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20">
              Contact Admin
            </Button>
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditAvailabilityModal 
          profile={profile} 
          onClose={() => setShowEditModal(false)} 
        />
      )}
    </div>
  );
}

function EditAvailabilityModal({ profile, onClose }: { profile: DoctorProfile; onClose: () => void }) {
  const [days, setDays] = useState<string[]>(profile.availability.days);
  const [slots, setSlots] = useState<string[]>(profile.availability.slots);
  const [loading, setLoading] = useState(false);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const allSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const toggleDay = (day: string) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleSlot = (slot: string) => {
    setSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'doctorProfiles', profile.userId), {
        availability: { days, slots }
      });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `doctorProfiles/${profile.userId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <Card className="max-w-2xl w-full !p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Configure Availability</h2>
          <Button variant="ghost" size="sm" onClick={onClose} icon={X} />
        </div>

        <div className="space-y-10">
          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-[0.2em] text-center">Select Working Days</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {allDays.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-xs font-bold transition-all",
                    days.includes(day) 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-200"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-5 tracking-[0.2em] text-center">Service Time Windows</p>
            <div className="grid grid-cols-3 gap-3">
              {allSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-xs font-bold transition-all",
                    slots.includes(slot) 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-200"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <Button variant="outline" className="flex-1 py-4" onClick={onClose}>Discard Changes</Button>
            <Button className="flex-1 py-4" onClick={handleSave} loading={loading}>Save Protocol</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AppointmentCard({ app, onConfirm, onCancel, onComplete }: { 
  app: Appointment; 
  onConfirm?: () => void; 
  onCancel?: () => void;
  onComplete?: () => void;
}) {
  const navigate = require('react-router-dom').useNavigate();

  return (
    <Card className="!p-6 border-l-8 border-l-blue-600 group hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.99] transition-all dark:border-slate-800 dark:hover:border-blue-600">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 dark:bg-slate-800 dark:border-slate-700 dark:group-hover:bg-blue-600">
            <UserIcon size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight dark:text-slate-100">{app.patientName || 'Anonymous Patient'}</h4>
            <div className="flex items-center gap-5 mt-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar size={14} className="text-blue-600" />
                {app.date}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Clock size={14} className="text-blue-600" />
                {app.time}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onConfirm && (
            <Button size="md" className="bg-green-600 hover:bg-green-700 shadow-green-500/20" onClick={onConfirm} icon={Check}>
              Confirm
            </Button>
          )}
          {onComplete && app.status === 'confirmed' && (
             <div className="flex gap-2">
               <Button size="md" variant="outline" onClick={() => navigate(`/consultation/${app.id}`)}>
                 Video Call
               </Button>
               <Button size="md" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate(`/prescription-builder/${app.id}`)}>
                 Prescribe
               </Button>
               <Button size="md" variant="secondary" onClick={onComplete} icon={Check}>
                 Finalize
               </Button>
             </div>
          )}
          {onCancel && (
            <Button variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={onCancel} icon={X}>
              Reject
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
