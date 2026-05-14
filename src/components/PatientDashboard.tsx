import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { DoctorProfile, Appointment } from '../types';
import { Card, Button, cn } from './ui/core';
import { MapPin, DollarSign, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { notifyNewAppointment } from '../services/notificationService';
import { getRecommendedDoctorOrder } from '../services/recommendationService';
import { useDoctorsList } from '../hooks/useDoctorsList';
import { useDebounce } from '../hooks/useDebounce';
import { DoctorCard } from './DoctorCard';

// Lazy load heavy components to reduce initial bundle
const DoctorProfileModal = lazy(() => import('./DoctorProfileModal'));

interface DoctorWithUser extends DoctorProfile {
  name: string;
  email: string;
  rating?: number;
  reviewCount?: number;
}

export function PatientDashboard() {
  const { user } = useAuth();
  const { doctors, loading } = useDoctorsList();
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<DoctorWithUser | null>(null);
  const [viewDoctor, setViewDoctor] = useState<DoctorWithUser | null>(null);
  
  // Filter states
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [recommendedOrder, setRecommendedOrder] = useState<string[]>([]);

  // Debounce search term to avoid excessive re-renders and ranking calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // AI ranking effect - triggered by debounced search and filters
  useEffect(() => {
    let cancelled = false;

    async function rankDoctors() {
      if (doctors.length === 0) {
        setRecommendedOrder([]);
        return;
      }

      const order = await getRecommendedDoctorOrder(doctors, {
        searchTerm: debouncedSearchTerm,
        selectedSpecialization,
        selectedCurrency,
        minFee,
        maxFee,
        minRating,
      });

      if (!cancelled) {
        setRecommendedOrder(order);
      }
    }

    void rankDoctors();

    return () => {
      cancelled = true;
    };
  }, [doctors, debouncedSearchTerm, selectedSpecialization, selectedCurrency, minFee, maxFee, minRating]);

  // Memoize filtering to avoid re-filtering on every render
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      // Text search - use debounced search term
      const matchesSearch = d.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                           d.specialization.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Specialization filter
      if (selectedSpecialization && d.specialization !== selectedSpecialization) return false;

      // Currency filter
      if (selectedCurrency && d.currency !== selectedCurrency) return false;

      // Fee range filter
      if (minFee && d.fees < Number(minFee)) return false;
      if (maxFee && d.fees > Number(maxFee)) return false;

      // Rating filter
      if (minRating && (d.rating || 0) < Number(minRating)) return false;

      return true;
    });
  }, [doctors, debouncedSearchTerm, selectedSpecialization, selectedCurrency, minFee, maxFee, minRating]);

  // Sort filtered doctors by AI recommendations
  const sortedDoctors = useMemo(() => {
    return filteredDoctors.slice().sort((a, b) => {
      if (!recommendedOrder || recommendedOrder.length === 0) return 0;
      const aiIndexA = recommendedOrder.indexOf(a.userId);
      const aiIndexB = recommendedOrder.indexOf(b.userId);
      const rankA = aiIndexA === -1 ? Number.MAX_SAFE_INTEGER : aiIndexA;
      const rankB = aiIndexB === -1 ? Number.MAX_SAFE_INTEGER : aiIndexB;
      return rankA - rankB;
    });
  }, [filteredDoctors, recommendedOrder]);

  // Get unique values for filter dropdowns
  const specializations = Array.from(new Set(doctors.map(d => d.specialization))).sort();
  const currencies = Array.from(new Set(doctors.map(d => d.currency))).sort();

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Instant Consultation</h1>
          <p className="text-blue-100 opacity-90 max-w-md text-lg leading-relaxed font-medium">
            Find the best doctors around the world and book an appointment in less than 60 seconds.
          </p>
          <Button variant="secondary" className="mt-8 bg-white text-blue-600 hover:bg-blue-50 border-none px-8">
            Explore All Specialists
          </Button>
        </div>
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[80px]"></div>
      </motion.div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight dark:text-slate-100">Recommended Specialists</h2>
        <div className="flex gap-2">
          <div className="bg-white border border-slate-100 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-400 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Online Now
          </div>
        </div>
      </div>

      {/* Filter UI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6">Filter Doctors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Specialization</label>
            <select 
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Currency</label>
            <select 
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Currencies</option>
              {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Min Fee</label>
            <input 
              type="number" 
              min="0"
              value={minFee}
              onChange={(e) => setMinFee(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Max Fee</label>
            <input 
              type="number" 
              min="0"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              placeholder="Any"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Min Rating (★)</label>
            <select 
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="0">Any Rating</option>
              <option value="3">3 Stars+</option>
              <option value="3.5">3.5 Stars+</option>
              <option value="4">4 Stars+</option>
              <option value="4.5">4.5 Stars+</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <>
          {/* Hero Section Skeleton */}
          <div className="bg-slate-200 dark:bg-slate-800 rounded-[32px] p-10 h-48 animate-pulse"></div>

          {/* Header + Online Status Skeleton */}
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

          {/* Doctor Cards Skeleton */}
          <div className="space-y-6">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-48 animate-pulse"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Showing <span className="text-blue-600 dark:text-blue-400 font-black">{filteredDoctors.length}</span> of {doctors.length} specialists
            </p>
            {(selectedSpecialization || selectedCurrency || minFee || maxFee || minRating !== '0') && (
              <button 
                onClick={() => {
                  setSelectedSpecialization('');
                  setSelectedCurrency('');
                  setMinFee('');
                  setMaxFee('');
                  setMinRating('0');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedDoctors.map(doctor => (
            <DoctorCard
              key={doctor.userId}
              doctor={doctor}
              onBook={setBookingDoctor}
              onViewProfile={setViewDoctor}
            />
          ))}
          </div>
        </div>
      )}

      {bookingDoctor && (
        <BookingModal 
          doctor={bookingDoctor} 
          onClose={() => setBookingDoctor(null)} 
        />
      )}
      {viewDoctor && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div></div>}>
          <DoctorProfileModal doctor={viewDoctor} open={true} onClose={() => setViewDoctor(null)} />
        </Suspense>
      )}
    </div>
  );
}

// Skeleton loader card component for loading state
function SkeletonCard() {
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

function BookingModal({ doctor, onClose }: { doctor: DoctorWithUser; onClose: () => void }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBook = async () => {
    setError('');
    
    // Validation
    if (!user) {
      setError('Please sign in first');
      return;
    }
    
    if (!user.phoneNumber) {
      setError('Please complete your profile with phone number');
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    // Check if date is in future
    const bookingDate = new Date(selectedDate);
    if (bookingDate < new Date()) {
      setError('Please select a future date');
      return;
    }

    setLoading(true);
    try {
      const appointment: Omit<Appointment, 'id'> = {
        patientId: user.uid,
        doctorId: doctor.userId,
        doctorName: doctor.name,
        patientName: user.name,
        hospitalId: doctor.hospitals[0],
        hospitalName: doctor.hospitals[0],
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'appointments'), appointment);
      
      // Notify doctor via WhatsApp with proper phone number
      await notifyNewAppointment(
        { name: doctor.name, phoneNumber: doctor.phoneNumber || '(doctor-phone)' },
        { name: user.name, phoneNumber: user.phoneNumber },
        selectedDate,
        selectedTime
      );

      setSuccess(true);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      handleFirestoreError(err, OperationType.CREATE, 'appointments');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 dark:bg-slate-950/60">
        <Card className="max-w-md w-full text-center py-12">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-slate-100">Booking Requested!</h2>
          <p className="text-slate-500 mb-8 dark:text-slate-400">
            Your appointment with {doctor.name} has been requested. You will be notified once they confirm.
          </p>
          <Button onClick={onClose} className="w-full">Done</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6 dark:bg-slate-950/60">
      <Card className="max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-slate-100">Book with {doctor.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>&times;</Button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2 dark:text-slate-300">
              <Calendar size={16} />
              Select Date
            </label>
            <input 
              type="date" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2 dark:text-slate-300">
              <Clock size={16} />
              Select Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {doctor.availability.slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={cn(
                    'py-2 text-sm rounded-lg border transition-all',
                    selectedTime === slot 
                      ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                      : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="flex justify-between mb-4">
              <span className="text-slate-500 dark:text-slate-400">Consultation Fee</span>
              <span className="font-bold dark:text-slate-100">{doctor.fees} {doctor.currency}</span>
            </div>
            <Button className="w-full py-4 text-lg" onClick={handleBook} loading={loading} disabled={!selectedDate || !selectedTime}>
              Confirm Booking
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
