import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Hospital, User } from '../types';
import { Card, Button, cn } from './ui/core';
import { Building2, Users, Plus, Edit2, Trash2, ShieldCheck, Activity } from 'lucide-react';

export function AdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddHospital, setShowAddHospital] = useState(false);

  useEffect(() => {
    // Real-time hospitals sync
    const unsubHospitals = onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      const hList: Hospital[] = [];
      snapshot.forEach(d => hList.push({ id: d.id, ...d.data() } as Hospital));
      setHospitals(hList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'hospitals');
    });

    // Real-time users sync
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: User[] = [];
      snapshot.forEach(d => uList.push({ uid: d.id, ...d.data() } as User));
      setUsers(uList);
      
      const doctors = uList.filter(u => u.role === 'doctor').length;
      setStats(prev => ({ ...prev, users: uList.length, doctors }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // Appointments count
    const fetchAppointments = async () => {
      const aSnap = await getDocs(collection(db, 'appointments'));
      setStats(prev => ({ ...prev, appointments: aSnap.size }));
    };
    fetchAppointments();

    return () => {
      unsubHospitals();
      unsubUsers();
    };
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10 group/admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-2 dark:text-slate-100">Systems Control</h1>
          <p className="text-slate-500 font-medium tracking-tight dark:text-slate-400">Platform-wide management and infrastructure configuration.</p>
        </div>
        <Button onClick={() => setShowAddHospital(true)} icon={Plus} size="lg">
          Register Hospital
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <StatCard label="Total Members" value={stats.users} color="blue" icon={Users} />
        <StatCard label="Specialists" value={stats.doctors} color="emerald" icon={ShieldCheck} />
        <StatCard label="Total Bookings" value={stats.appointments} color="indigo" icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <section className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Global Registry</h2>
          </div>

          <Card className="!p-0 overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 border border-slate-200 uppercase dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                            {u.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 tracking-tight dark:text-slate-100">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          u.role === 'doctor' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          u.role === 'admin' ? "bg-slate-900 text-white border-slate-900" :
                          "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {u.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {u.role === 'doctor' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'doctorProfiles', u.uid), { verified: true });
                                  import('../lib/toast').then(({ showToast }) => showToast({ title: 'Doctor Verified', message: `${u.name} is now verified.`, variant: 'success' }));
                                } catch (e) {
                                  import('../lib/toast').then(({ showToast }) => showToast({ title: 'Error', message: 'Could not verify doctor.', variant: 'error' }));
                                }
                              }}
                            >
                              <ShieldCheck size={14} className="mr-1" /> Verify
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-slate-900 rounded-full dark:bg-slate-100"></div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Facilities</h2>
          </div>

          <div className="space-y-4">
            {hospitals.map(hospital => (
              <Card key={hospital.id} className="!p-6 group/h relative hover:border-blue-200 transition-all dark:hover:border-blue-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 group-hover/h:bg-slate-900 group-hover/h:text-white transition-all duration-300 dark:bg-slate-800 dark:group-hover/h:bg-slate-100 dark:group-hover/h:text-slate-900">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate dark:text-slate-100">{hospital.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">{hospital.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {showAddHospital && (
        <HospitalModal onClose={() => setShowAddHospital(false)} />
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-500/20 dark:shadow-blue-900/40',
    emerald: 'bg-emerald-600 shadow-emerald-500/20 dark:shadow-emerald-900/40',
    indigo: 'bg-indigo-600 shadow-indigo-500/20 dark:shadow-indigo-900/40'
  };

  return (
    <Card className="!p-8 bg-white border border-slate-100 flex items-center gap-6 dark:bg-slate-900 dark:border-slate-800">
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl", colors[color])}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
          {label}
        </p>
        <p className="text-4xl font-black text-slate-900 leading-none dark:text-slate-100">
          {value}
        </p>
      </div>
    </Card>
  );
}

function HospitalModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !location) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'hospitals'), { name, location, address });
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'hospitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
      <Card className="max-w-md w-full !p-10 shadow-2xl">
        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">New Facility</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Hospital Name</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Location / State</label>
            <input 
              className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Address</label>
            <textarea 
              className="w-full bg-slate-50 border-none rounded-xl py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[100px]"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} loading={loading}>Save Facility</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
