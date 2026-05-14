/**
 * Chat Service - Handles Gemini AI chat with proper error handling and fallbacks
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  error?: boolean;
}

export interface ChatContext {
  doctorName: string;
  specialization: string;
  experience?: number;
  clinic?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Array<{ comment: string; rating: number }>;
}

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export class ChatService {
  private static log(message: string, data?: any) {
    if (DEBUG) {
      console.log(`[ChatService] ${message}`, data || '');
    }
  }

  static buildContextPrompt(context: ChatContext): string {
    const parts: string[] = [];
    
    parts.push(`You are a helpful AI assistant for patients inquiring about doctors.`);
    parts.push(`You represent Dr. ${context.doctorName} and provide accurate information based on their profile.`);
    parts.push('');
    
    parts.push('Doctor Information:');
    parts.push(`- Name: ${context.doctorName}`);
    parts.push(`- Specialization: ${context.specialization}`);
    if (context.experience) parts.push(`- Experience: ${context.experience} years`);
    if (context.clinic) parts.push(`- Clinic: ${context.clinic}`);
    if (context.verified !== undefined) parts.push(`- Verified: ${context.verified ? 'Yes' : 'No'}`);
    if (context.rating) parts.push(`- Rating: ${context.rating}/5 (${context.reviewCount || 0} reviews)`);
    
    if (context.reviews && context.reviews.length > 0) {
      parts.push('');
      parts.push('Recent Patient Reviews:');
      context.reviews.slice(0, 3).forEach(r => {
        parts.push(`- "⭐ ${r.rating}/5: ${r.comment}"`);
      });
    }
    
    parts.push('');
    parts.push('Guidelines:');
    parts.push('- Be helpful and professional');
    parts.push('- Keep responses concise (2-3 sentences)');
    parts.push('- If asked about appointment booking, suggest contacting the clinic directly');
    parts.push('- If the question is outside your scope, politely redirect to doctor-related topics');
    parts.push('- Never provide medical advice, only information about the doctor');
    
    return parts.join('\n');
  }

  static async sendMessage(
    userMessage: string,
    context: ChatContext,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    this.log('Sending message to Gemini', { message: userMessage });

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      this.log('API key not configured');
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to .env file.');
    }

    try {
      const systemPrompt = this.buildContextPrompt(context);
      
      // Build conversation history for context
      const conversationContext = conversationHistory
        ? conversationHistory
            .slice(-4) // Last 2 exchanges to stay within token limits
            .map(msg => `${msg.sender === 'user' ? 'Patient' : 'AI Assistant'}: ${msg.text}`)
            .join('\n')
        : '';

      const fullPrompt = conversationContext
        ? `${systemPrompt}\n\nPrevious conversation:\n${conversationContext}\n\nPatient: ${userMessage}`
        : `${systemPrompt}\n\nPatient: ${userMessage}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: fullPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
              topP: 0.95,
              topK: 40,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        this.log('Gemini API error', error);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in .env');
        }
        if (response.status === 429) {
          throw new Error('API rate limited. Please try again in a moment.');
        }
        throw new Error(`API Error: ${error?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        this.log('No text in Gemini response', data);
        throw new Error('No response from Gemini API');
      }

      this.log('Gemini response received', generatedText);
      return generatedText;

    } catch (error) {
      this.log('Chat error', error);
      throw error;
    }
  }

  static getFallbackResponse(context: ChatContext): string {
    const responses = [
      `Dr. ${context.doctorName} is a highly qualified ${context.specialization} specialist${
        context.experience ? ` with ${context.experience}+ years of experience` : ''
      }. I'd be happy to help answer your questions about their qualifications or services. What would you like to know?`,
      
      `Based on patient reviews, Dr. ${context.doctorName} is known for excellent care in ${context.specialization}. ${
        context.rating ? `They have a ${context.rating}/5 rating from satisfied patients.` : ''
      } Feel free to ask me anything about their expertise!`,
      
      `Welcome! I'm here to help you learn more about Dr. ${context.doctorName}'s practice. Ask me about their specialization, experience, availability, or anything else you'd like to know!`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export default ChatService;
