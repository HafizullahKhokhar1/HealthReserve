import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { Card, Button } from '../components/ui/core';
import { Upload, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { showToast } from '../lib/toast';

interface DoctorProfile {
  userId: string;
  name: string;
  specialization: string;
  experience: number;
  clinic: string;
  bio: string;
  phoneNumber?: string;
  verified?: boolean;
  profilePicUrl?: string;
  username?: string;
  availabilities?: Availability[];
  fees?: number;
  currency?: string;
  hospitals?: string[];
  education?: string[];
  rating?: number;
  reviewCount?: number;
}

interface Availability {
  id: string;
  day: string;
  days?: string[];
  startTime: string;
  endTime: string;
  location: string;
  hospitalName: string;
  checkupFee: number;
  otherFees?: string;
  details?: string;
}

export function DoctorProfileEdit() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (!user || user.role !== 'doctor') return;
    void loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      const profileRef = doc(db, 'doctorProfiles', user!.uid);
      const snap = await getDoc(profileRef);
      const data = snap.data() as DoctorProfile | undefined;

      if (data) {
        setProfile({ ...data, userId: user!.uid });
        setProfilePicPreview(data.profilePicUrl || '');
      } else {
        setProfile({
          userId: user!.uid,
          name: user!.name || '',
          specialization: '',
          experience: 0,
          clinic: '',
          bio: '',
          availabilities: []
        });
      }

      const availSnap = await getDocs(
        query(collection(db, 'doctorAvailabilities'), where('doctorId', '==', user!.uid))
      );
      const avails: Availability[] = [];
      availSnap.forEach((snapDoc) => {
        avails.push({ id: snapDoc.id, ...snapDoc.data() } as Availability);
      });
      setAvailabilities(avails);
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast({ title: 'Could not load profile', message: 'Please refresh and try again.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast({ title: 'Profile picture too large', message: 'Use an image smaller than 1MB.', variant: 'error' });
      return;
    }

    setProfilePicFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    if (!profile || !user) return;
    setSaving(true);

    try {
      let profilePicUrl = profile.profilePicUrl || '';
      if (profilePicFile && profilePicPreview) {
        profilePicUrl = profilePicPreview;
      }

      const profileData = {
        ...profile,
        profilePicUrl,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'doctorProfiles', user.uid), profileData, { merge: true });
      showToast({ title: 'Profile saved', message: 'Your doctor profile has been updated.', variant: 'success' });
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast({ title: 'Profile save failed', message: 'Please try again.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function addAvailability(avail: Availability) {
    if (!user) return;
    try {
      const availData = {
        ...avail,
        doctorId: user.uid,
        createdAt: serverTimestamp()
      };

      if (avail.id) {
        await setDoc(doc(db, 'doctorAvailabilities', avail.id), availData, { merge: true });
      } else {
        const newId = `avail-${Date.now()}`;
        await setDoc(doc(db, 'doctorAvailabilities', newId), { ...availData, id: newId });
        avail.id = newId;
      }

      setAvailabilities((prev) => {
        const index = prev.findIndex((item) => item.id === avail.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = avail;
          return updated;
        }
        return [...prev, avail];
      });
      setEditingAvailability(null);
      showToast({ title: 'Availability saved', message: 'Your working days are now updated.', variant: 'success' });
    } catch (error) {
      console.error('Error saving availability:', error);
      showToast({ title: 'Failed to save availability', message: 'Check your Firestore rules or try again.', variant: 'error' });
    }
  }

  async function deleteAvailability(id: string) {
    try {
      await deleteDoc(doc(db, 'doctorAvailabilities', id));
      setAvailabilities((prev) => prev.filter((item) => item.id !== id));
      showToast({ title: 'Availability removed', message: 'The schedule entry has been deleted.', variant: 'info' });
    } catch (error) {
      console.error('Error deleting availability:', error);
      showToast({ title: 'Delete failed', message: 'Could not remove the schedule entry.', variant: 'error' });
    }
  }

  if (!user || user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-500">Only doctors can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-8 dark:text-slate-100">Edit Your Profile</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-4 border-4 border-slate-200 dark:border-slate-700">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No photo</p>
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer font-bold text-sm">
              <Upload className="w-4 h-4" />
              Upload Photo (max 1MB)
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">Portfolio photo</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-slate-100">Name</label>
              <input
                type="text"
                value={profile?.name || ''}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-100">Specialization</label>
                <input
                  type="text"
                  value={profile?.specialization || ''}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, specialization: e.target.value } : null))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-100">Experience (years)</label>
                <input
                  type="number"
                  value={profile?.experience || 0}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, experience: Number(e.target.value) } : null))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 dark:text-slate-100">Username (Portfolio URL)</label>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">healthreserve.app/</span>
                <input
                  type="text"
                  value={profile?.username || ''}
                  onChange={(e) => setProfile((prev) => (prev ? { ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') } : null))}
                  placeholder="your_username"
                  className="flex-1 bg-transparent outline-none dark:text-white"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Your professional portfolio link</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 dark:text-slate-100">Bio</label>
              <textarea
                value={profile?.bio || ''}
                onChange={(e) => setProfile((prev) => (prev ? { ...prev, bio: e.target.value } : null))}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Tell patients about yourself..."
              />
            </div>
          </div>
        </div>

        <Button onClick={saveProfile} disabled={saving} className="mt-8">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </Card>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold dark:text-slate-100">Manage Availability</h2>
          <Button
            onClick={() => setEditingAvailability({ id: '', day: 'Monday', days: ['Monday'], startTime: '09:00', endTime: '17:00', location: '', hospitalName: '', checkupFee: 0 })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Availability
          </Button>
        </div>

        <div className="space-y-4">
          {availabilities.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">No availability slots added yet.</p>
          ) : (
            availabilities.map((avail) => (
              <div key={avail.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold dark:text-slate-100">{avail.days?.length ? avail.days.join(', ') : avail.day}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{avail.startTime} - {avail.endTime}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{avail.hospitalName} ({avail.location})</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">Checkup: {avail.checkupFee}</p>
                    {avail.otherFees && <p className="text-xs text-slate-500">Other fees: {avail.otherFees}</p>}
                    {avail.details && <p className="text-xs text-slate-500 mt-1">{avail.details}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setEditingAvailability(avail)} className="p-2">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => deleteAvailability(avail.id)} className="p-2 text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {editingAvailability && (
        <AvailabilityModal
          availability={editingAvailability}
          days={days}
          onClose={() => setEditingAvailability(null)}
          onSave={(updated) => void addAvailability(updated)}
        />
      )}
    </div>
  );
}

function AvailabilityModal({
  availability,
  days,
  onClose,
  onSave,
}: {
  availability: Availability;
  days: string[];
  onClose: () => void;
  onSave: (availability: Availability) => void;
}) {
  const [selectedDays, setSelectedDays] = useState<string[]>(availability.days?.length ? availability.days : [availability.day]);
  const [draft, setDraft] = useState<Availability>(availability);

  const toggleDay = (day: string) => {
    setSelectedDays((current) => current.includes(day)
      ? current.filter((value) => value !== day)
      : [...current, day]);
  };

  const handleSave = () => {
    if (selectedDays.length === 0) {
      showToast({ title: 'Pick at least one day', message: 'Availability needs one or more days selected.', variant: 'error' });
      return;
    }

    onSave({
      ...draft,
      day: selectedDays[0],
      days: selectedDays,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <Card className="w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold dark:text-slate-100">Add/Edit Availability</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 dark:text-slate-100">Days</label>
            <div className="grid grid-cols-2 gap-3">
              {days.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                    selectedDays.includes(day)
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${selectedDays.includes(day) ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                    {selectedDays.includes(day) ? '✓' : ''}
                  </span>
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-slate-100">Start Time</label>
              <input
                type="time"
                value={draft.startTime}
                onChange={(e) => setDraft((current) => ({ ...current, startTime: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-slate-100">End Time</label>
              <input
                type="time"
                value={draft.endTime}
                onChange={(e) => setDraft((current) => ({ ...current, endTime: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-slate-100">Hospital/Clinic Name</label>
            <input
              type="text"
              value={draft.hospitalName}
              onChange={(e) => setDraft((current) => ({ ...current, hospitalName: e.target.value }))}
              placeholder="e.g., City Medical Center"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-slate-100">Location/Address</label>
            <input
              type="text"
              value={draft.location}
              onChange={(e) => setDraft((current) => ({ ...current, location: e.target.value }))}
              placeholder="City or full address"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-slate-100">Checkup Fee</label>
            <input
              type="number"
              value={draft.checkupFee}
              onChange={(e) => setDraft((current) => ({ ...current, checkupFee: Number(e.target.value) }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-slate-100">Other Fees (optional)</label>
            <input
              type="text"
              value={draft.otherFees || ''}
              onChange={(e) => setDraft((current) => ({ ...current, otherFees: e.target.value }))}
              placeholder="e.g., Lab tests: 500, Follow-up: 200"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 dark:text-slate-100">Additional Details (optional)</label>
            <textarea
              value={draft.details || ''}
              onChange={(e) => setDraft((current) => ({ ...current, details: e.target.value }))}
              placeholder="Special notes, amenities, etc."
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} className="flex-1">
              Save Availability
            </Button>
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DoctorProfileEdit;
