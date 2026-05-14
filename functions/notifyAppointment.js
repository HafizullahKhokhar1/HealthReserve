/**
 * Firebase Cloud Function for WhatsApp Notifications
 * 
 * SETUP STEPS:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. In project root, run: firebase init functions
 * 3. Create this file in: functions/notifyAppointment.js
 * 4. Add to functions/package.json dependencies:
 *    "twilio": "^4.0.0"
 * 5. Set environment variables:
 *    firebase functions:config:set twilio.sid="ACxxxxxx" twilio.token="your_token" twilio.from="+1234567890"
 * 6. Deploy: firebase deploy --only functions
 */

const functions = require('firebase-functions');
const twilio = require('twilio');
const admin = require('firebase-admin');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

admin.initializeApp();

// Secret Manager helper for Gemini API key (fallback to functions.config)
let _cachedGeminiKey = null;
async function getGeminiKey() {
  // Prefer functions config for simplicity in CI/development
  const cfgKey = functions.config().gemini && functions.config().gemini.key;
  if (cfgKey) return cfgKey;

  if (_cachedGeminiKey) return _cachedGeminiKey;

  try {
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || process.env.FUNCTIONS_PROJECT;
    if (!projectId) {
      console.warn('[SecretManager] No project id available; skipping Secret Manager lookup');
      return null;
    }
    const name = `projects/${projectId}/secrets/gemini-api-key/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    const secret = version.payload.data.toString('utf8');
    _cachedGeminiKey = secret;
    return secret;
  } catch (err) {
    console.warn('[SecretManager] Failed to access gemini secret:', err.message || err);
    return null;
  }
}

// Initialize Twilio client
const getTwilioClient = () => {
  const cfg = functions.config().twilio || {};
  const twilioSid = cfg.sid;
  const twilioToken = cfg.token;
  const twilioFrom = cfg.from;

  // If credentials are missing, return null and let callers simulate/log instead of throwing
  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.warn('[Twilio] Credentials not found in functions config. WhatsApp sends will be simulated.');
    return null;
  }

  return twilio(twilioSid, twilioToken);
};

/**
 * HTTP Cloud Function for sending WhatsApp messages
 * 
 * POST /sendWhatsApp
 * Body: { phoneNumber: "+1234567890", message: "..." }
 */
exports.sendWhatsApp = functions.https.onRequest(async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  if (req.method !== 'POST') {
    res.status(400).json({ error: 'POST request required' });
    return;
  }

  try {
    const { phoneNumber, message } = req.body;

    // Validation
    if (!phoneNumber || !message) {
      res.status(400).json({ error: 'Missing phoneNumber or message' });
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      res.status(400).json({ error: 'Phone number must start with +' });
      return;
    }

    const client = getTwilioClient();
    const twilioFrom = (functions.config().twilio || {}).from;

    // If client not configured, simulate send and return a fake sid
    if (!client) {
      const fakeSid = `SIMULATED-${Date.now()}`;
      console.log(`[WhatsApp][SIMULATED] To ${phoneNumber} - ${message}`);
      res.status(200).json({ success: true, sid: fakeSid, to: phoneNumber, simulated: true });
      return;
    }

    // Send WhatsApp message
    const result = await client.messages.create({
      from: `whatsapp:${twilioFrom}`,
      to: `whatsapp:${phoneNumber}`,
      body: message
    });

    console.log(`[WhatsApp] Sent to ${phoneNumber}. SID: ${result.sid}`);

    res.status(200).json({ success: true, sid: result.sid, to: phoneNumber });
  } catch (error) {
    console.error('[WhatsApp Error]:', error);
    res.status(500).json({
      error: error.message,
      details: 'Check Twilio credentials and phone format'
    });
  }
});

/**
 * Scheduled Cloud Function for daily appointment reminders
 * 
 * SETUP: Configure Cloud Scheduler to trigger daily at 9 AM
 */
exports.sendDailyReminders = functions.pubsub
  .schedule('0 9 * * *')  // Every day at 9 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('[Reminders] Starting daily appointment reminder check...');

      const db = admin.firestore();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Get all confirmed appointments for tomorrow
      const appointmentsSnap = await db.collection('appointments')
        .where('date', '==', tomorrowStr)
        .where('status', '==', 'confirmed')
        .get();

      console.log(`[Reminders] Found ${appointmentsSnap.docs.length} appointments for tomorrow`);

      let remindersSent = 0;
      const client = getTwilioClient();
      const twilioFrom = (functions.config().twilio || {}).from;

      // Process each appointment
      for (const appDoc of appointmentsSnap.docs) {
        const appointment = appDoc.data();

        try {
          // Get doctor details
          const doctorSnap = await db.collection('users').doc(appointment.doctorId).get();
          const doctorData = doctorSnap.data();

          // Get patient details
          const patientSnap = await db.collection('users').doc(appointment.patientId).get();
          const patientData = patientSnap.data();

          // Send reminder to doctor
          // Send to doctor
          if (doctorData?.phoneNumber) {
            const doctorMessage = `📅 APPOINTMENT REMINDER (Tomorrow)\n\nPatient: ${appointment.patientName}\nTime: ${appointment.time}\n\nBe ready for your consultation.\n\n© HealthReserve`;

            if (!client) {
              console.log(`[Reminder][SIMULATED] To doctor ${doctorData.phoneNumber}: ${doctorMessage}`);
            } else {
              await client.messages.create({ from: `whatsapp:${twilioFrom}`, to: `whatsapp:${doctorData.phoneNumber}`, body: doctorMessage });
              console.log(`[Reminder] Sent to doctor: ${doctorData.phoneNumber}`);
            }
          }

          // Send to patient
          if (patientData?.phoneNumber) {
            const patientMessage = `📅 APPOINTMENT REMINDER (Tomorrow)\n\nDr. ${appointment.doctorName}\nTime: ${appointment.time}\n\nBe on time! Reschedule in app if needed.\n\n© HealthReserve`;

            if (!client) {
              console.log(`[Reminder][SIMULATED] To patient ${patientData.phoneNumber}: ${patientMessage}`);
            } else {
              await client.messages.create({ from: `whatsapp:${twilioFrom}`, to: `whatsapp:${patientData.phoneNumber}`, body: patientMessage });
              console.log(`[Reminder] Sent to patient: ${patientData.phoneNumber}`);
            }
          }

          remindersSent += 2;
        } catch (appError) {
          console.error(`[Reminder Error] for appointment ${appDoc.id}:`, appError);
        }
      }

      console.log(`[Reminders] Successfully sent ${remindersSent} reminders`);
      return { success: true, remindersSent };
    } catch (error) {
      console.error('[Reminders Error]:', error);
      throw error;
    }
  });

/**
 * Firestore Trigger: Send notification when appointment status changes
 */
exports.onAppointmentStatusChange = functions.firestore
  .document('appointments/{appointmentId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Only process if status changed
      if (before.status === after.status) {
        return null;
      }

      console.log(`[Status Change] Appointment ${context.params.appointmentId}: ${before.status} → ${after.status}`);

      const db = admin.firestore();
      const client = getTwilioClient();
      const twilioFrom = (functions.config().twilio || {}).from;

      // Get patient and doctor details
      const patientSnap = await db.collection('users').doc(after.patientId).get();
      const doctorSnap = await db.collection('users').doc(after.doctorId).get();

      const patientData = patientSnap.data();
      const doctorData = doctorSnap.data();

      // Confirmed: Send notification to patient
      if (after.status === 'confirmed' && patientData?.phoneNumber) {
        const message = `✅ APPOINTMENT CONFIRMED\n\nDr. ${after.doctorName}\nDate: ${after.date}\nTime: ${after.time}\n\nWe look forward to seeing you!\n\n© HealthReserve`;
        if (!client) {
          console.log(`[Status Change][SIMULATED] To patient ${patientData.phoneNumber}: ${message}`);
        } else {
          await client.messages.create({ from: `whatsapp:${twilioFrom}`, to: `whatsapp:${patientData.phoneNumber}`, body: message });
          console.log('[Status Change] Sent confirmation to patient');
        }
      }

      // Completed: Send review prompt to patient
      if (after.status === 'completed' && patientData?.phoneNumber) {
        const message = `✨ THANK YOU FOR YOUR VISIT!\n\nDr. ${after.doctorName}\n\nShare a review in HealthReserve to help other patients!\n\n© HealthReserve`;
        if (!client) {
          console.log(`[Status Change][SIMULATED] To patient ${patientData.phoneNumber}: ${message}`);
        } else {
          await client.messages.create({ from: `whatsapp:${twilioFrom}`, to: `whatsapp:${patientData.phoneNumber}`, body: message });
          console.log('[Status Change] Sent review prompt to patient');
        }
      }

      // Cancelled: Notify patient
      if (after.status === 'cancelled' && patientData?.phoneNumber) {
        const message = `❌ APPOINTMENT CANCELLED\n\nDr. ${after.doctorName}\nDate: ${after.date}\n\nBook another appointment in HealthReserve.\n\n© HealthReserve`;
        if (!client) {
          console.log(`[Status Change][SIMULATED] To patient ${patientData.phoneNumber}: ${message}`);
        } else {
          await client.messages.create({ from: `whatsapp:${twilioFrom}`, to: `whatsapp:${patientData.phoneNumber}`, body: message });
          console.log('[Status Change] Sent cancellation notice to patient');
        }
      }

      return { success: true, status: after.status };
    } catch (error) {
      console.error('[Status Change Error]:', error);
      throw error;
    }
  });

  /**
   * Callable Cloud Function: Recommend doctors for a user.
   * If you later integrate Gemini or another model, replace scoring below
   * with a call to the external model and return ranked results.
   *
   * Input (data): { userId?: string, filters?: { specialization?: string } }
   * Returns: { recommendations: Array<{ userId, name, specialization, rating, fees, currency, verified }> }
   */
  exports.recommendDoctors = functions.https.onCall(async (data, context) => {
    try {
      const geminiKey = await getGeminiKey();
      if (geminiKey) {
        console.log('[recommendDoctors] Gemini key available; external scoring can be used');
      } else {
        console.log('[recommendDoctors] No Gemini key found; using local scoring fallback');
      }
      const db = admin.firestore();
      const { userId, filters } = data || {};

      // Gather doctor profiles and user records
      const profilesSnap = await db.collection('doctorProfiles').get();
      const usersSnap = await db.collection('users').where('role', '==', 'doctor').get();

      const userMap = {};
      usersSnap.forEach(u => userMap[u.id] = u.data());

      // Gather ratings
      const reviewsSnap = await db.collection('reviews').get();
      const ratingsByDoctor = {};
      reviewsSnap.forEach(r => {
        const rev = r.data();
        if (!ratingsByDoctor[rev.doctorId]) ratingsByDoctor[rev.doctorId] = [];
        ratingsByDoctor[rev.doctorId].push(rev.rating || 0);
      });

      const scored = [];
      profilesSnap.forEach(p => {
        const pid = p.id;
        const profile = p.data();
        const userRec = userMap[pid] || {};

        // Basic score: rating weight + specialization match + verified
        const ratings = ratingsByDoctor[pid] || [];
        const avgRating = ratings.length ? (ratings.reduce((a,b) => a+b,0)/ratings.length) : 0;

        let score = avgRating * 10; // amplify rating
        if (filters && filters.specialization && profile.specialization === filters.specialization) score += 20;
        if (profile.verified) score += 5;
        // prefer lower fees moderately
        const fees = typeof profile.fees === 'number' ? profile.fees : parseFloat(profile.fees || '0');
        score += Math.max(0, 10 - Math.min(10, fees / 100));

        scored.push({
          userId: pid,
          name: userRec.name || profile.name || 'Unknown',
          specialization: profile.specialization || '',
          rating: Math.round((avgRating + Number.EPSILON) * 10) / 10,
          fees: profile.fees || 0,
          currency: profile.currency || 'USD',
          verified: profile.verified || false,
          score
        });
      });

      // Sort by score desc
      scored.sort((a,b) => b.score - a.score);

      return { recommendations: scored.slice(0, 50) };
    } catch (error) {
      console.error('[recommendDoctors Error]:', error);
      throw new functions.https.HttpsError('internal', 'Recommendation failed');
    }
  });
