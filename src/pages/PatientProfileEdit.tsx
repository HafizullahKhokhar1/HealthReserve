import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Card, Button } from '../components/ui/core';
import { Save, Upload, User as UserIcon } from 'lucide-react';
import { showToast } from '../lib/toast';

export function PatientProfileEdit() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    bloodGroup: '',
    allergies: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        bloodGroup: user.bloodGroup || '',
        allergies: user.allergies || '',
        emergencyContact: user.emergencyContact || ''
      });
      if (user.profilePicUrl) {
        setProfilePicPreview(user.profilePicUrl);
      }
    }
  }, [user]);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast({ title: 'Image too large', message: 'Please keep it under 1MB for now.', variant: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePicPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatePayload: any = { ...formData };
      
      if (profilePicPreview) {
        updatePayload.profilePicUrl = profilePicPreview;
      }

      await updateDoc(userRef, updatePayload);
      showToast({ title: 'Success', message: 'Profile updated successfully', variant: 'success' });
      
      // We would ideally also update the auth context user state here, 
      // but it will automatically update if we are listening to firestore in useAuth.
    } catch (error) {
      console.error(error);
      showToast({ title: 'Error', message: 'Failed to update profile', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'patient') {
    return <div className="p-8 text-center">Unauthorized access.</div>;
  }

  return (
    <div className="p-4 md:p-10 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Patient Profile</h1>
        <p className="text-slate-500 font-medium">Manage your personal and medical information.</p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-40 h-40 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-4 border-4 border-slate-200 dark:border-slate-700">
              {profilePicPreview ? (
                <img src={profilePicPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-400" />
              )}
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg cursor-pointer font-bold text-sm">
              <Upload className="w-4 h-4" />
              Change Photo
              <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-100">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-100">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-100">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="">Unknown</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 dark:text-slate-100">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 dark:text-slate-100">Allergies / Medical Conditions</label>
              <textarea
                value={formData.allergies}
                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:border-blue-500"
                placeholder="List any known allergies or chronic conditions..."
              />
            </div>
            
            <div className="pt-4">
              <Button onClick={handleSave} loading={loading} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
