/*
 Server-side callable to generate doctor AI summary.
 - Fetches doctor profile and recent reviews from Firestore
 - Uses Secret Manager (preferred) or functions.config().gemini.key for Gemini API key
 - If no key available, returns a local summary similar to client fallback
 - To deploy: requires Blaze billing for Secret Manager access and Functions deployment
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

admin.initializeApp();

let _cachedGeminiKey = null;
async function getGeminiKey() {
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

function buildLocalSummary(doctor, reviews) {
  const parts = [];
  parts.push(`${doctor.name} is a ${doctor.specialization} with ${doctor.experience || 'N/A'} years of experience.`);
  if (doctor.clinic) parts.push(`Works at ${doctor.clinic}.`);
  if (doctor.verified) parts.push('Verified practitioner.');
  if (doctor.rating) parts.push(`Average rating: ${doctor.rating} (${doctor.reviewCount || 0} reviews).`);

  const positive = (reviews || []).filter(r => /success|recovered|effective|excellent|helped|improved/i.test(r.comment || ''));
  if (positive.length > 0) {
    const sample = positive.slice(0, 3).map(r => `"${r.comment}" — ${r.userName || 'patient'}`).join(' ');
    parts.push(`Patients often mention successful outcomes: ${sample}`);
  } else if ((reviews || []).length > 0) {
    const sample = (reviews || []).slice(0, 3).map(r => `"${r.comment}"`).join('; ');
    parts.push(`Recent feedback: ${sample}`);
  }

  return parts.join(' ');
}

exports.getDoctorAISummary = functions.https.onCall(async (data, context) => {
  try {
    const { doctorId, maxReviews = 10 } = data || {};
    if (!doctorId) throw new functions.https.HttpsError('invalid-argument', 'Missing doctorId');

    const db = admin.firestore();
    const profileSnap = await db.collection('doctorProfiles').doc(doctorId).get();
    const userSnap = await db.collection('users').doc(doctorId).get();

    if (!profileSnap.exists) throw new functions.https.HttpsError('not-found', 'Doctor profile not found');

    const profile = profileSnap.data() || {};
    const user = userSnap.exists ? userSnap.data() : {};

    // Get recent reviews
    const reviewsSnap = await db.collection('reviews')
      .where('doctorId', '==', doctorId)
      .orderBy('createdAt', 'desc')
      .limit(maxReviews)
      .get();

    const reviews = [];
    reviewsSnap.forEach(r => reviews.push({ id: r.id, ...r.data() }));

    const doctor = {
      userId: doctorId,
      name: user.name || profile.name || 'Unknown',
      specialization: profile.specialization || '',
      experience: profile.experience || 0,
      clinic: profile.clinic || profile.hospitals?.[0] || '',
      verified: !!profile.verified,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || reviews.length,
      bio: profile.bio || profile.description || ''
    };

    // Attempt external Gemini call
    const geminiKey = await getGeminiKey();
    if (geminiKey) {
      try {
        const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const prompt = `Provide a concise summary (3-5 sentences) about this doctor based on the data and reviews. Include likely successful case types and a professional overview.\n\nDoctor: ${JSON.stringify(doctor)}\n\nReviews: ${JSON.stringify(reviews)}`;

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 300 }
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          return { summary: text || buildLocalSummary(doctor, reviews), source: 'gemini' };
        }
        console.warn('[doctorSummary] Gemini responded non-OK, falling back');
      } catch (err) {
        console.warn('[doctorSummary] Gemini call failed', err.message || err);
      }
    }

    // Fallback to local summarizer
    const local = buildLocalSummary(doctor, reviews);
    return { summary: local, source: 'local' };
  } catch (error) {
    console.error('[getDoctorAISummary Error]:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate doctor summary');
  }
});
