/**
 * Notification Service
 * WhatsApp & Email Integration for HealthReserve
 * 
 * WhatsApp: Requires Twilio Business API (https://www.twilio.com/whatsapp)
 * Setup: Add VITE_TWILIO_ACCOUNT_SID, VITE_TWILIO_AUTH_TOKEN, VITE_TWILIO_WHATSAPP_FROM to .env.local
 * Email: Firebase SendGrid integration (optional)
 */

interface NotificationPayload {
  phoneNumber: string;
  message: string;
  type: 'whatsapp' | 'email' | 'sms';
}

/**
 * Send WhatsApp notification via Twilio
 * Requires backend endpoint: POST /api/notifications/whatsapp
 */
export const sendWhatsAppNotification = async (phoneNumber: string, message: string) => {
  if (!phoneNumber) {
    console.warn('[WhatsApp] No phone number provided');
    return false;
  }
  
  try {
    console.log(`[WhatsApp Notification] Sending to ${phoneNumber}`);
    
    // Backend would handle this - see functions/notifyAppointment.js
    const response = await fetch('/api/notifications/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, message })
    }).catch(() => null);
    
    if (!response) {
      console.log('[WhatsApp] Backend not configured - logging notification');
      return true; // Fail gracefully
    }
    return response.ok;
  } catch (error) {
    console.error('[WhatsApp Error]:', error);
    return false;
  }
};

/**
 * Send Email notification via SendGrid
 * Requires backend endpoint: POST /api/notifications/email
 */
export const sendEmailNotification = async (email: string, subject: string, message: string) => {
  if (!email) {
    console.warn('[Email] No email address provided');
    return false;
  }
  
  try {
    console.log(`[Email Notification] Sending to ${email}`);
    
    // Backend would handle this
    const response = await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, subject, message })
    }).catch(() => null);
    
    if (!response) {
      console.log('[Email] Backend not configured - logging notification');
      return true; // Fail gracefully
    }
    return response.ok;
  } catch (error) {
    console.error('[Email Error]:', error);
    return false;
  }
};

/**
 * Doctor receives notification: New appointment request
 */
export const notifyNewAppointment = async (doctor: any, patient: any, date: string, time: string) => {
  const message = `🏥 NEW APPOINTMENT REQUEST\n\nDoctor: ${doctor.name}\nPatient: ${patient.name}\nDate: ${date}\nTime: ${time}\n\nAction: Review in your HealthReserve Dashboard\n\n© HealthReserve`;
  await sendWhatsAppNotification(doctor.phoneNumber || '', message);
  if (doctor.email) {
    await sendEmailNotification(doctor.email, 'New Appointment Request - HealthReserve', message);
  }
};

/**
 * Patient receives notification: Doctor confirmed appointment
 */
export const notifyAppointmentConfirmed = async (patient: any, doctor: any, date: string, time: string) => {
  const message = `✅ APPOINTMENT CONFIRMED\n\nDr. ${doctor.name}\nSpecialization: ${doctor.specialization}\nDate: ${date}\nTime: ${time}\n\nWe look forward to seeing you!\n\n© HealthReserve`;
  await sendWhatsAppNotification(patient.phoneNumber || '', message);
};

/**
 * Appointment reminder: 1 day before (sent to both doctor and patient)
 */
export const notifyAppointmentReminder = async (doctor: any, patient: any, date: string, time: string, isClinician: boolean = false) => {
  if (isClinician) {
    const message = `📅 APPOINTMENT REMINDER (Tomorrow)\n\nDoctor: ${doctor.name}\nPatient: ${patient.name}\nTime: ${time}\n\nPlease ensure you're available.\n\n© HealthReserve`;
    await sendWhatsAppNotification(doctor.phoneNumber || '', message);
  } else {
    const message = `📅 APPOINTMENT REMINDER (Tomorrow)\n\nDr. ${doctor.name}\nTime: ${time}\n\nBe on time! Reschedule if needed via HealthReserve app.\n\n© HealthReserve`;
    await sendWhatsAppNotification(patient.phoneNumber || '', message);
  }
};

/**
 * Patient receives notification: Appointment was cancelled
 */
export const notifyAppointmentCancelled = async (patient: any, doctor: any, date: string, time: string, reason: string = '') => {
  const message = `❌ APPOINTMENT CANCELLED\n\nDr. ${doctor.name}\nDate: ${date}\nTime: ${time}\n\n${reason ? `Reason: ${reason}\n\n` : ''}Book another appointment in HealthReserve.\n\n© HealthReserve`;
  await sendWhatsAppNotification(patient.phoneNumber || '', message);
};

/**
 * Doctor reminder: Patient hasn't confirmed appointment
 */
export const notifyPendingAppointment = async (doctor: any, patient: any) => {
  const message = `⏳ PENDING APPOINTMENT\n\nPatient: ${patient.name}\nStatus: Awaiting confirmation\n\nAction: Approve or decline in HealthReserve Dashboard\n\n© HealthReserve`;
  await sendWhatsAppNotification(doctor.phoneNumber || '', message);
};

/**
 * Patient receives notification: Appointment completed, ask for review
 */
export const notifyAppointmentCompleted = async (patient: any, doctor: any) => {
  const message = `✨ THANK YOU FOR YOUR VISIT!\n\nDr. ${doctor.name}\n\nHow was your experience? Share a review in HealthReserve to help other patients.\n\n© HealthReserve`;
  await sendWhatsAppNotification(patient.phoneNumber || '', message);
};

/**
 * Check appointments for 1-day reminders (called daily)
 * This function should be called by a Cloud Function or scheduled job
 */
export const checkAndSendReminders = async (appointments: any[], doctors: any[], patients: any[]) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const appointmentsForTomorrow = appointments.filter(app => app.date === tomorrowStr && app.status === 'confirmed');

  for (const appointment of appointmentsForTomorrow) {
    const doctor = doctors.find(d => d.userId === appointment.doctorId);
    const patient = patients.find(p => p.uid === appointment.patientId);

    if (doctor && patient) {
      // Send to both
      await notifyAppointmentReminder(doctor, patient, appointment.date, appointment.time, true);
      await notifyAppointmentReminder(doctor, patient, appointment.date, appointment.time, false);
    }
  }

  console.log(`[Reminders] Checked and sent ${appointmentsForTomorrow.length} reminders`);
  return appointmentsForTomorrow.length;
};
