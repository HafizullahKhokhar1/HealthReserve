import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '../components/AdminDashboard';

export function HospitalsPage() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="bg-slate-50 min-h-full dark:bg-slate-950">
      {/* For now, reusing AdminDashboard as it contains the hospital management. 
          In a more complex app, we'd split these. */}
      <AdminDashboard />
    </div>
  );
}
