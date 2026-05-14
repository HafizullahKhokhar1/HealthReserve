import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, DoctorProfile, Hospital, Appointment } from '../types';
import { PatientDashboard } from '../components/PatientDashboard';
import { DoctorDashboard } from '../components/DoctorDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { Card, Button } from '../components/ui/core';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctorProfile() {
      if (user?.role === 'doctor') {
        try {
          const docRef = doc(db, 'doctorProfiles', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile({ userId: user.uid, ...docSnap.data() } as DoctorProfile);
          }
        } catch (error) {
          console.error('Error fetching doctor profile:', error);
        }
      }
      setLoading(false);
    }
    fetchDoctorProfile();
  }, [user]);

  if (loading) return (
    <div className="p-10">
      <div className="h-64 bg-white rounded-3xl animate-pulse shadow-sm" />
    </div>
  );

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'patient') {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <PatientDashboard />
      </Suspense>
    );
  }

  if (user?.role === 'doctor') {
    if (!profile) {
      return <DoctorProfileSetup onComplete={(p) => setProfile(p)} />;
    }
    return <DoctorDashboard profile={profile} />;
  }

  return <div>Access Denied</div>;
}

function DoctorProfileSetup({ onComplete }: { onComplete: (p: DoctorProfile) => void }) {
  const { user } = useAuth();
  const [specialization, setSpecialization] = useState('');
  const [fees, setFees] = useState(0);
  const [currency, setCurrency] = useState('PKR');
  const [experience, setExperience] = useState(0);
  const [education, setEducation] = useState('');
  const [licenses, setLicenses] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || !specialization) return;
    setLoading(true);
    try {
      const profileData: DoctorProfile = {
        userId: user.uid,
        specialization,
        bio,
        fees,
        currency,
        experience,
        education: education ? education.split(',').map(e => e.trim()).filter(Boolean) : [],
        licenses: licenses ? licenses.split(',').map(l => l.trim()).filter(Boolean) : [],
        verified: false,
        hospitals: ['General Hospital'],
        availability: {
          days: ['Monday', 'Wednesday', 'Friday'],
          slots: ['09:00', '10:00', '11:00', '14:00', '15:00']
        },
        rating: 0,
        reviewCount: 0,
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'doctorProfiles', user.uid), profileData);
      onComplete(profileData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `doctorProfiles/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 px-6 max-w-4xl mx-auto pb-20">
      <Card className="p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-2 tracking-tight dark:text-slate-100">Professional Profile Setup</h2>
        <p className="text-slate-500 mb-8 dark:text-slate-400">Complete your LinkedIn-style profile so patients can trust your credentials</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Specialization *</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="e.g. Cardiologist"
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Years of Experience *</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              min="0"
              value={experience}
              onChange={e => setExperience(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Consultation Fee *</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                min="0"
                value={fees}
                onChange={e => setFees(Number(e.target.value))}
              />
              <select className="px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option>PKR</option>
                <option>USD</option>
                <option>EUR</option>
                <option>AED</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Degrees/Qualifications</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="e.g. MBBS, MD, DM (comma separated)"
              value={education}
              onChange={e => setEducation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Licenses & Certifications</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              placeholder="e.g. Medical License, Board Certification (comma separated)"
              value={licenses}
              onChange={e => setLicenses(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Professional Bio</label>
            <textarea 
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white min-h-24"
              placeholder="Tell patients about your background, expertise, approach, and why they should choose you"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
          <Button className="md:col-span-2 w-full py-3 text-lg" onClick={handleSave} loading={loading}>
            Complete Profile Setup
          </Button>
        </div>
      </Card>
    </div>
  );
}
