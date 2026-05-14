import React from 'react';
import { Card } from '../components/ui/core';

export function TermsOfService() {
  return (
    <div className="bg-slate-50 min-h-screen dark:bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">Terms of Service</h1>
        <p className="text-slate-500 mb-10">Last updated: May 10, 2026</p>

        <Card className="p-8 prose dark:prose-invert max-w-none">
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using HealthReserve, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h3>2. Medical Emergency Disclaimer</h3>
          <p><strong>DO NOT USE THIS PLATFORM FOR MEDICAL EMERGENCIES.</strong> If you are experiencing a medical emergency, call your local emergency services (e.g., 911) immediately.</p>

          <h3>3. Platform Role</h3>
          <p>HealthReserve acts strictly as a technology platform connecting patients with independent healthcare professionals. HealthReserve itself does not provide medical advice, diagnosis, or treatment.</p>

          <h3>4. Payments and Refunds</h3>
          <p>Consultation fees are collected prior to the appointment. If a doctor fails to attend a confirmed appointment, a full refund will be issued. Cancellations by patients must be made at least 24 hours in advance to receive a refund.</p>

          <h3>5. Doctor Verification</h3>
          <p>While HealthReserve verifies the medical licenses of doctors upon registration, it is the patient's responsibility to ensure the doctor meets their specific needs.</p>
        </Card>
      </div>
    </div>
  );
}
