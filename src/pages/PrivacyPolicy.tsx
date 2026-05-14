import React from 'react';
import { Card } from '../components/ui/core';

export function PrivacyPolicy() {
  return (
    <div className="bg-slate-50 min-h-screen dark:bg-slate-950 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">Privacy Policy</h1>
        <p className="text-slate-500 mb-10">Last updated: May 10, 2026</p>

        <Card className="p-8 prose dark:prose-invert max-w-none">
          <h3>1. Data Collection</h3>
          <p>We collect information that you provide directly to us, including but not limited to your name, email address, phone number, and medical history. This information is strictly used to facilitate your telemedicine consultations.</p>
          
          <h3>2. Health Information Portability and Accountability Act (HIPAA)</h3>
          <p>HealthReserve complies with all HIPAA regulations. Your medical records, consultation videos, and prescriptions are encrypted at rest and in transit.</p>

          <h3>3. Video Consultations</h3>
          <p>Video consultations are NOT recorded by HealthReserve unless explicitly requested by both the patient and the doctor for medical record-keeping purposes. All video streams are peer-to-peer encrypted.</p>

          <h3>4. Data Sharing</h3>
          <p>We do not sell your personal or medical data to third parties. Your data is only shared with the healthcare professionals you choose to consult with on our platform.</p>

          <h3>5. Your Rights</h3>
          <p>You have the right to request access to, modification of, or deletion of your personal data at any time. You can do this via your Patient Profile or by contacting support.</p>
        </Card>
      </div>
    </div>
  );
}
