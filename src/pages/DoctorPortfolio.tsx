import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, Button } from '../components/ui/core';
import { Star, Briefcase, Calendar, MapPin, Phone, Mail } from 'lucide-react';

interface DoctorData {
  userId: string;
  name: string;
  specialization: string;
  experience: number;
  clinic: string;
  bio: string;
  profilePicUrl?: string;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  email?: string;
  phoneNumber?: string;
}

interface Availability {
  day: string;
  days?: string[];
  startTime: string;
  endTime: string;
  location: string;
  hospitalName: string;
  checkupFee: number;
  otherFees?: string;
}

export function DoctorPortfolioPage() {
  const { username } = useParams<{ username: string }>();
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    async function loadDoctor() {
      try {
        // Find doctor by username
        const profilesSnap = await getDocs(
          query(collection(db, 'doctorProfiles'), where('username', '==', username))
        );

        if (profilesSnap.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const profileDoc = profilesSnap.docs[0];
        const profileData = profileDoc.data() as DoctorData;
        const userId = profileDoc.id;

        setDoctor({
          userId,
          ...profileData,
          email: profileData.email,
          phoneNumber: profileData.phoneNumber
        });

        // Load availabilities
        const availSnap = await getDocs(
          query(collection(db, 'doctorAvailabilities'), where('doctorId', '==', userId))
        );
        const avails: Availability[] = [];
        availSnap.forEach(doc => {
          avails.push(doc.data() as Availability);
        });
        setAvailabilities(avails);

        // Load reviews
        const reviewsSnap = await getDocs(
          query(collection(db, 'reviews'), where('doctorId', '==', userId))
        );
        const revs: any[] = [];
        reviewsSnap.forEach(doc => {
          revs.push(doc.data());
        });
        setReviews(revs);
      } catch (err) {
        console.error('Error loading doctor:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadDoctor();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">Loading doctor profile...</p>
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2 dark:text-slate-100">Doctor Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400">The doctor profile you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8 items-start">
            <div className="flex-shrink-0">
              {doctor.profilePicUrl ? (
                <img
                  src={doctor.profilePicUrl}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-bold">
                  {doctor.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{doctor.name}</h1>
                {doctor.verified && <span className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">✓ Verified</span>}
              </div>
              <p className="text-xl text-blue-100 mb-3">{doctor.specialization}</p>
              <div className="flex items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span>{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>{doctor.rating?.toFixed(1) || 'New'} rating ({doctor.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* About */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">About</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{doctor.bio}</p>

          {doctor.clinic && (
            <div className="space-y-2">
              <h3 className="font-bold dark:text-slate-100">Primary Clinic</h3>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="w-5 h-5" />
                <span>{doctor.clinic}</span>
              </div>
            </div>
          )}
        </Card>

        {/* Contact */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">Contact</h2>
          <div className="space-y-3">
            {doctor.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <a href={`mailto:${doctor.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {doctor.email}
                </a>
              </div>
            )}
            {doctor.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <a href={`tel:${doctor.phoneNumber}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {doctor.phoneNumber}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Availabilities */}
        {availabilities.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">Availability & Fees</h2>
            <div className="space-y-4">
              {availabilities.map((avail, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold dark:text-slate-100">{avail.days?.length ? avail.days.join(', ') : avail.day}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{avail.startTime} - {avail.endTime}</p>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{avail.checkupFee}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {avail.hospitalName} - {avail.location}
                    </p>
                    {avail.otherFees && (
                      <p className="text-slate-500 dark:text-slate-500">Other fees: {avail.otherFees}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-slate-100">Patient Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="p-4 border-l-4 border-blue-500 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold dark:text-slate-100">{review.userName || 'Anonymous'}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-slate-100">Ready to book?</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Visit HealthReserve to schedule your appointment</p>
          <Button className="px-8" onClick={() => window.location.href = '/dashboard'}>
            Book Appointment
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default DoctorPortfolioPage;
