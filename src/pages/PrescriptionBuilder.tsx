import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui/core';
import { Pill, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Appointment, Prescription } from '../types';
import { showToast } from '../lib/toast';

export function PrescriptionBuilder() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!appointmentId) return;
      try {
        const docRef = doc(db, 'appointments', appointmentId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAppointment({ id: snap.id, ...snap.data() } as Appointment);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [appointmentId]);

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const handleSave = async () => {
    if (!user || !appointment) return;
    
    // Validate
    const validMedicines = medicines.filter(m => m.name.trim() !== '');
    if (validMedicines.length === 0) {
      showToast({ title: 'Error', message: 'Add at least one medicine', variant: 'error' });
      return;
    }

    setSaving(true);
    try {
      const prescription: Omit<Prescription, 'id'> = {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id,
        medicines: validMedicines,
        instructions,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'prescriptions'), prescription);
      showToast({ title: 'Success', message: 'Prescription sent to patient', variant: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showToast({ title: 'Error', message: 'Failed to save prescription', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'doctor') {
    return <div className="p-8">Unauthorized</div>;
  }

  if (loading) {
    return <div className="p-8">Loading patient details...</div>;
  }

  if (!appointment) {
    return <div className="p-8 text-center text-rose-500">Appointment not found.</div>;
  }

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors dark:hover:text-white"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Digital Prescription</h1>
        <p className="text-slate-500 font-medium mt-1">For patient: <span className="font-bold text-slate-900 dark:text-white">{appointment.patientName}</span></p>
      </div>

      <Card className="!p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-slate-100">
            <Pill className="text-blue-600" /> Medication
          </h2>
          <Button variant="ghost" size="sm" onClick={handleAddMedicine} icon={Plus}>Add Item</Button>
        </div>

        <div className="space-y-4">
          {medicines.map((med, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 relative">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Medicine Name</label>
                <input 
                  type="text" 
                  value={med.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  placeholder="e.g. Amoxicillin" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dosage</label>
                <input 
                  type="text" 
                  value={med.dosage}
                  onChange={(e) => handleChange(index, 'dosage', e.target.value)}
                  placeholder="e.g. 500mg" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Frequency</label>
                <input 
                  type="text" 
                  value={med.frequency}
                  onChange={(e) => handleChange(index, 'frequency', e.target.value)}
                  placeholder="e.g. 1-0-1 (Morning, Night)" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2 relative">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Duration</label>
                <input 
                  type="text" 
                  value={med.duration}
                  onChange={(e) => handleChange(index, 'duration', e.target.value)}
                  placeholder="e.g. 5 Days" 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                {medicines.length > 1 && (
                  <button 
                    onClick={() => handleRemoveMedicine(index)}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <label className="block text-sm font-bold mb-2 dark:text-slate-100">General Instructions & Advice</label>
          <textarea 
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            placeholder="Dietary restrictions, rest recommendations, etc."
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} loading={saving} icon={Save}>
            Sign & Send Prescription
          </Button>
        </div>
      </Card>
    </div>
  );
}
