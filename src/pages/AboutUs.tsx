import React from 'react';
import { ShieldCheck, Globe, Activity, Users } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="bg-slate-50 min-h-screen dark:bg-slate-950 pb-20">
      <div className="bg-blue-600 dark:bg-blue-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Our Mission</h1>
        <p className="text-xl max-w-2xl mx-auto text-blue-100">
          Democratizing healthcare access through technology. We connect you with the world's best specialists in seconds.
        </p>
      </div>

      <div className="container mx-auto px-4 mt-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold mb-6 dark:text-white">Healthcare Without Borders</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
              HealthReserve was founded on a simple principle: geographical location shouldn't dictate the quality of healthcare you receive. Our platform brings world-class medical expertise directly to your home through secure, high-definition video consultations.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              We meticulously verify every specialist on our platform, ensuring that whether you need a second opinion on a complex neurological condition or a routine pediatric consultation, you are in the safest hands possible.
            </p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl h-80 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-2xl">
             <Globe size={100} className="text-slate-400 dark:text-slate-600" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 dark:bg-blue-900/30 dark:text-blue-400">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Verified Excellence</h3>
            <p className="text-slate-500 dark:text-slate-400">Every doctor undergoes a rigorous 5-step background and medical license verification process.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Activity size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">End-to-End Care</h3>
            <p className="text-slate-500 dark:text-slate-400">From AI-driven symptom analysis to digital prescriptions and medical records management.</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 dark:bg-purple-900/30 dark:text-purple-400">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 dark:text-white">Patient First</h3>
            <p className="text-slate-500 dark:text-slate-400">24/7 support, intuitive interfaces, and complete transparency in pricing and reviews.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
