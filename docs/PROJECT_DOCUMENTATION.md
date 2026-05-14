# Project Documentation - HealthReserve

Last updated: 2026-05-13

## 1) Project Overview

HealthReserve is a full-stack telemedicine platform.
It supports patient and doctor workflows, role-based access, appointment flows, medical records, and an AI assistant.

Main goals:
- Provide a clean and reliable healthcare booking experience
- Keep deployment cost at zero for MVP stage
- Maintain a professional UI/UX with strong error handling and loading states

## 2) Live Status (Deployed vs Ready)

### Deployed now
- Frontend app is live on Firebase Hosting
- URL: https://healthreserve01.web.app
- Core UI, navigation, theming, and floating assistant are visible and usable

### Ready but not deployed yet
- Backend services in functions/
- Real appointment persistence flows
- Full medical records write/read flows
- Real AI responses through Gemini-backed API path

## 3) What Works Right Now

- Login and authenticated navigation
- Continue with Google (forced account chooser)
- Continue with Email (sign in + sign up)
- Forgot Password (password reset email)
- Continue with Phone OTP
- Doctor browsing, filtering, and profile viewing\n- Marketplace-style discovery sections, specialty rails, condition shortcuts, and budget filters
- Floating AI assistant widget (fallback response mode)
- Dark/light theme
- Error boundary and network/offline UI handling
- Smooth transitions and loading states

## 4) What Needs Backend Deployment

- Actual appointment create/update persistence
- Medical records persistence and retrieval
- Notification workflows end-to-end
- Real AI responses (non-fallback)

## 5) Architecture Summary

Frontend:
- React 19 + TypeScript + Vite
- TailwindCSS
- Route-based pages under src/pages
- Shared UI components under src/components

Backend:
- Node.js services in functions/
- Firestore as managed database
- Firebase Auth and Storage integration

AI:
- Chat UI in frontend
- Fallback mode already implemented
- Real mode requires Gemini key and backend route wiring

## 6) Key Implementations Completed

- Floating assistant available across authenticated pages
- Sidebar AI page link removed (assistant is now global floating widget)
- Chat service graceful fallback when Gemini key is missing
- Authentication updated with email sign in/sign up and forgot password flow\n- Google login configured with select_account prompt for account switching
- Google login configured with select_account prompt for account switching
- ErrorBoundary component to prevent total app crashes
- Network status banner for online/offline state
- Smart loader, skeleton states, empty states, and transition helpers

## 7) Deployment Guide (Simple and Clean)

Preferred free path:
- Frontend: Firebase Hosting (already done)
- Backend: Render.com free web service

### Step-by-step

1. Create Render account
- URL: https://render.com
- Connect GitHub repository

2. Create backend web service
- Name: healthreserve-api
- Branch: main
- Build command: cd functions && npm install
- Start command: node functions/index.js

3. Add environment variables in Render
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID
- GEMINI_API_KEY (optional but recommended)
- NODE_ENV=production

4. Deploy backend
- Wait for successful build and service start
- Copy Render service URL

5. Connect frontend to backend
- Add/update .env.production in project root:

```env
VITE_API_URL=https://your-render-service.onrender.com
VITE_GEMINI_API_KEY=your_gemini_key_if_used
```

6. Redeploy frontend

```bash
npm run build
firebase deploy --only hosting
```

7. Validate end-to-end
- Appointment creation saves
- Medical records save/read works
- AI assistant can return real responses (if key configured)

## 8) Environment Variables

Frontend (.env.production or .env.local):
- VITE_API_URL
- VITE_GEMINI_API_KEY (optional if backend-only model is used)

Backend (Render service environment):
- Firebase config values listed above
- GEMINI_API_KEY
- NODE_ENV

## 9) Cost Model (MVP)

Estimated monthly cost for MVP deployment path:
- Firebase Hosting: free tier
- Firestore: free tier (within limits)
- Render backend: free tier
- Gemini: free tier limits

Target MVP cost: $0

## 10) Testing Checklist

After deployment, test these in order:

1. Auth flow (Google, Email, Forgot Password, Phone)
2. Doctor search + filters
3. Book appointment and verify persistence
4. Medical records save/read
5. AI assistant response path
6. Theme switch and responsive layout
7. Offline banner behavior

## 11) Known Gaps and Next Priorities

Current known gaps:
- Backend deployment still pending in production path
- AI may still use fallback until key and endpoint wiring are complete

Priority next steps:
1. Deploy backend on Render
2. Wire frontend API URL
3. Run checklist and confirm persistence flows
4. Add automated tests for critical flows

## 12) Important Links

- Live app: https://healthreserve01.web.app
- Render: https://render.com
- Firebase Console: https://console.firebase.google.com/project/healthreserve01
- Gemini key console: https://makersuite.google.com/app/apikey

## 13) Repository Map

- src/: frontend application
- functions/: backend services and APIs
- firestore.rules: database security rules
- firebase.json: firebase deployment config
- docs/PROJECT_DOCUMENTATION.md: this master document

## 14) Final Summary

Project is in a strong MVP state:
- Frontend is live and polished
- Backend is ready and close to full production behavior
- Authentication now supports Google account switching + Email + Forgot Password
- One deployment pass on backend + env wiring will enable complete end-to-end functionality

