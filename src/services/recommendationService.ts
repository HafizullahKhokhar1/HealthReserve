type DoctorCandidate = {
  userId: string;
  name: string;
  specialization: string;
  currency: string;
  fees: number;
  rating: number;
  reviewCount: number;
  verified?: boolean;
  experience?: number;
};

type RecommendationFilters = {
  searchTerm: string;
  selectedSpecialization: string;
  selectedCurrency: string;
  minFee: string;
  maxFee: string;
  minRating: string;
};

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';

function scoreDoctor(doctor: DoctorCandidate, filters: RecommendationFilters): number {
  let score = 0;

  const search = filters.searchTerm.trim().toLowerCase();
  if (search) {
    if (doctor.name.toLowerCase().includes(search)) score += 30;
    if (doctor.specialization.toLowerCase().includes(search)) score += 25;
  }

  if (filters.selectedSpecialization && doctor.specialization === filters.selectedSpecialization) score += 30;
  if (filters.selectedCurrency && doctor.currency === filters.selectedCurrency) score += 15;

  if (filters.minRating) {
    const minRating = Number(filters.minRating);
    if (doctor.rating >= minRating) score += 20;
  }

  if (filters.minFee) {
    const minFee = Number(filters.minFee);
    if (doctor.fees >= minFee) score += 3;
  }

  if (filters.maxFee) {
    const maxFee = Number(filters.maxFee);
    if (doctor.fees <= maxFee) score += 3;
  }

  score += Math.min(doctor.rating * 10, 50);
  score += Math.min(doctor.reviewCount * 2, 10);
  if (doctor.verified) score += 8;
  if (doctor.experience) score += Math.min(doctor.experience, 10);

  // Slight preference for lower fees to help surface accessible doctors
  score += Math.max(0, 20 - doctor.fees / 1000);

  return score;
}

function buildCandidatePayload(doctors: DoctorCandidate[], filters: RecommendationFilters) {
  return doctors.map(doctor => ({
    userId: doctor.userId,
    name: doctor.name,
    specialization: doctor.specialization,
    currency: doctor.currency,
    fees: doctor.fees,
    rating: doctor.rating,
    reviewCount: doctor.reviewCount,
    verified: doctor.verified ?? false,
    experience: doctor.experience ?? 0,
    localScore: scoreDoctor(doctor, filters),
  }));
}

async function getGeminiRecommendationOrder(doctors: DoctorCandidate[], filters: RecommendationFilters): Promise<string[] | null> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = [
      'Rank these doctors for a patient based on search relevance, specialization match, rating, experience, verified status, and reasonable fees.',
      'Return ONLY valid JSON in this exact shape: {"order":["doctorId1","doctorId2",...] }',
      'Do not include markdown or extra text.',
      '',
      `Filters: ${JSON.stringify(filters)}`,
      `Doctors: ${JSON.stringify(buildCandidatePayload(doctors, filters))}`,
    ].join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.order)) return null;

    return parsed.order.filter((id: unknown) => typeof id === 'string');
  } catch (error) {
    console.warn('[recommendationService] Gemini ranking failed, falling back to local ranking:', error);
    return null;
  }
}

export async function getRecommendedDoctorOrder(
  doctors: DoctorCandidate[],
  filters: RecommendationFilters
): Promise<string[]> {
  const geminiOrder = await getGeminiRecommendationOrder(doctors, filters);
  if (geminiOrder && geminiOrder.length > 0) {
    return geminiOrder;
  }

  return buildCandidatePayload(doctors, filters)
    .sort((a, b) => b.localScore - a.localScore)
    .map((doctor) => doctor.userId);
}
