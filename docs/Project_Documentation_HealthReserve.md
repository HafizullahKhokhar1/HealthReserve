Project Documentation — HealthReserve

1. Introduction

HealthReserve is a full-stack telehealth and appointment-management platform connecting patients, doctors, and administrators. The platform offers booking, medical records, video consultations, prescriptions, and an AI assistant that helps users find information about doctors and services.

2. Objectives

- Provide a secure, reliable patient-doctor booking and consultation platform.
- Enable doctors to manage availability and patient records.
- Offer a responsive web UI optimized for desktop and mobile.
- Integrate an AI assistant for patient guidance, with graceful fallback when backend AI is unavailable.
- Deliver a deployable, maintainable codebase ready for market validation and pitching.

3. Requirements Analysis

3.1 Functional Requirements
- User authentication (patients, doctors, admins).
- Doctor profiles and search.
- Appointment booking and cancellation.
- Video consultations with appointment context.
- Secure storage of medical records.
- Prescription builder and download.
- Notifications (in-app, FCM/email) for appointment reminders.
- AI assistant (floating UI) for patient queries; fallbacks when external AI is unavailable.

3.2 Non-Functional Requirements
- Secure authentication and role-based access control.
- GDPR/PHI-conscious data handling (encrypt sensitive data at rest/in transit).
- High perceived performance and fast UI load.
- Scalable backend (Cloud Functions + managed DB).
- CI/CD friendly repository with infrastructure-as-code for Firebase setup.

4. System Design

4.1 High-level Architecture
- Frontend: React + Vite + TypeScript, TailwindCSS for styling.
- Backend: Firebase (Firestore, Cloud Functions), FCM for push notifications, Firebase Hosting.
- AI: Google Gemini via the Generative Language API (server-side calls in Cloud Functions) with client-side fallback when API key absent.
- Storage: Firestore for structured data, Firebase Storage for file uploads.

4.2 Component Diagram (text)
- Client (React): routes, components, FloatingChat, ToastHost, Header/Sidebar, pages.
- Services (client-side): chatService, fcmService, notificationService, recommendationService.
- Functions (server-side): notifyAppointment, doctorSummary, other admin endpoints.
- External APIs: Gemini (Generative Language API), third-party video provider (if used), email provider.

4.3 Data Model (summary)
- Users: { id, name, role, email, profile, ... }
- Doctors: { id, userId, specialization, experience, clinic, schedule, rating }
- Appointments: { id, patientId, doctorId, time, status, notes }
- MedicalRecords: { id, patientId, entries[], files[] }

5. Implementation Details

5.1 Frontend
- Entry: `src/main.tsx` and `src/App.tsx`.
- Auth: `src/hooks/useAuth.tsx` handles session and role.
- Floating AI Assistant: `src/components/FloatingChat.tsx` — now integrated into authenticated layout and renders for logged-in users. Uses `src/services/chatService.ts` with graceful fallback when Gemini key missing.
- UI components: `src/components/ui/*` and pages under `src/pages/`.
- Routing: client-side via `react-router-dom` with protected layout for authenticated users.

5.2 Backend & Serverless
- Cloud Functions live under `functions/` and provide utility endpoints and notifications. Deploying functions requires the Firebase project to be on Blaze plan due to Artifact Registry and Cloud Build needs.
- Design note: Keep AI key server-side in Functions for secure calls to Gemini; client-side should only use fallback responses.

5.3 Chat Service
- `src/services/chatService.ts` contacts Gemini when `VITE_GEMINI_API_KEY` is present; otherwise it returns a safe fallback message so the UI remains usable without backend AI.
- Best practice: Move actual key usage to a Cloud Function endpoint that authenticates requests and calls Gemini, preventing key exposure.

5.4 Security
- Enforce Firestore rules in `firestore.rules` (already present). Verify rules for role-based access.
- Do not store API keys in the repository. Use environment variables in deployment pipelines and Cloud Functions Secrets Manager.

6. Testing Results

6.1 Manual UI Tests
- Verified that the floating assistant button appears for authenticated users (bottom-right) and opens the chat UI.
- Verified fallback responses from `ChatService` when Gemini key is not configured.
- Performed a production build locally (`npm run build`) — build succeeded; bundle size warning noted.

6.2 Automated Tests
- No unit tests present in repo. Recommendation: Add Jest/Testing Library tests for critical components (`useAuth`, `FloatingChat`, `Patient flows`).

6.3 Known Issues
- Full AI functionality requires server-side API access (Blaze plan) and secure function endpoints.
- Large bundle size; consider code-splitting and lazy-loading heavy pages.

7. Deployment Plan

7.1 Quick hosting-only deploy (done)
- Run `npm run build` then `firebase deploy --only hosting`.
- This publishes the frontend at the Hosting URL but backend Cloud Functions will not be deployed.

7.2 Full deployment (recommended for production)
- Upgrade Firebase project to Blaze plan (billing required) to enable `artifactregistry.googleapis.com` and `cloudbuild.googleapis.com`.
- Store secrets (Gemini key) in Cloud Functions environment or Secret Manager.
- Deploy functions: `firebase deploy --only functions` (or full `firebase deploy`).

7.3 CI/CD
- Add GitHub Actions workflow to: run `npm ci`, `npm run build`, and `firebase deploy --only hosting` on `main` branch merges. For functions, run deploy after verifying billing/secrets.

8. Team & Roles (recommended)
- Product Owner: defines feature priorities and acceptance criteria.
- Frontend Engineer(s): implement UI, accessibility, performance.
- Backend Engineer(s): Cloud Functions, security, API integration.
- DevOps: CI/CD, billing and hosting configuration.
- QA Engineer: testing, exploratory and automated tests.

9. Timeline & Milestones (suggested)
- Week 0: Stabilize UI, fix critical bugs, ensure build reproducibility.
- Week 1-2: Implement server-side secure AI endpoint (Cloud Function), integrate Gemini securely.
- Week 3: Add automated tests and CI/CD, load testing on critical endpoints.
- Week 4: Finalize docs, privacy policy, terms, prepare pitch demo.

10. Risks & Mitigations
- Billing surprises after Blaze upgrade: set budget alerts, use Cloud Functions schedules for low usage during testing.
- Data privacy: ensure encryption and least-privilege access in Firestore rules.
- Model usage costs: throttle/limit calls, implement caching of AI responses for repeated queries.

11. Future Scope
- Mobile app (React Native) with shared backend.
- Multilingual AI assistant and contextual medical triage (with strict disclaimers).
- Analytics dashboard for doctor performance and appointment trends.

Appendix A: Actionable Next Steps
- Upgrade Firebase to Blaze to deploy functions and enable secure Gemini integration.
- Move Gemini calls to a Cloud Function protected by IAM or API key stored in Secret Manager.
- Add unit and integration tests and a CI pipeline for automated releases.
- Optimize bundle size (code-splitting, lazy load heavy components).

---

Contact: Project maintainer (update `README.md` with contact details and roles).