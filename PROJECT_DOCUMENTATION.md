# HealthReserve - Project Documentation

## Project Overview
HealthReserve is a modern healthcare platform connecting patients with verified doctors for online consultations, in-clinic appointments, lab tests, and medicines delivery across Pakistan.

**Live Site:** https://healthreserve01.web.app/

---

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6.4.2
- **Styling:** Tailwind CSS with dark mode support
- **Animations:** Framer Motion
- **UI Icons:** Lucide React
- **Routing:** React Router v6

### Backend & Services
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Email/Password, Google OAuth, Phone with Recaptcha)
- **Hosting:** Firebase Hosting (healthreserve01 project)
- **Cloud Functions:** Firebase Functions (Node.js)
- **Push Notifications:** Firebase Cloud Messaging (FCM)

### Key Features
- Patient & Doctor authentication
- Doctor discovery with filtering (specialty, fee range, rating)
- Real-time appointment booking
- Video consultations (integration ready)
- Prescription builder
- Patient medical records
- Notification system (email, push, in-app)
- Doctor portfolio and profile management
- Patient dashboard with appointment history
- Admin dashboard for moderation
- SEO optimized landing page

---

## Project Structure

```
healthreserve/
├── src/
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── DoctorDashboard.tsx
│   │   ├── DoctorCard.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── FloatingChat.tsx
│   │   ├── NotificationPanel.tsx
│   │   └── ui/core.tsx      # UI component library
│   ├── pages/               # Page components
│   │   ├── Auth.tsx         # Landing page + login/signup
│   │   ├── Dashboard.tsx
│   │   ├── Appointments.tsx
│   │   ├── MedicalRecords.tsx
│   │   ├── DoctorProfileEdit.tsx
│   │   ├── PatientProfileEdit.tsx
│   │   ├── AiHealthAssistant.tsx
│   │   ├── VideoConsultation.tsx
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── chatService.ts   # AI chat integration
│   │   ├── fcmService.ts    # Push notifications
│   │   ├── notificationService.ts
│   │   └── recommendationService.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx
│   │   ├── useDoctorsList.ts
│   │   └── useTheme.ts
│   ├── lib/                 # Utilities
│   │   ├── firebase.ts      # Firebase initialization
│   │   └── toast.ts         # Toast notifications
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── types.ts             # TypeScript types
├── functions/               # Cloud Functions
│   ├── index.js            # Main functions
│   ├── doctorSummary.js    # Doctor data processing
│   ├── notifyAppointment.js # Appointment notifications
│   └── package.json
├── docs/                    # Documentation
│   ├── screenshots/         # UI screenshots
│   └── HealthReserve_Project_Documentation.docx
├── index.html              # HTML entry point (SEO optimized)
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── firebase.json           # Firebase configuration
├── .firebaserc             # Firebase project config
├── package.json            # Dependencies
└── README.md               # Quick start guide
```

---

## Key Components

### Auth.tsx (Landing Page + Auth)
Combines public homepage and authentication flows in one component.

**Landing Page Features:**
- Hero slider (3 rotating slides with fade transitions)
- Location-based search bar (Karachi)
- Specialty quick-access buttons (8 top specialties)
- Service cards (Consult Online, In-Clinic, Lab Tests, Medicines)
- Featured specialties section with doctor cards
- Health conditions shortcuts (6 common conditions)
- Trust indicators (ratings, consultations count)

**Authentication Flows:**
- Email/Password sign-up
- Email/Password sign-in
- Forgot password with email reset
- Google OAuth sign-in
- Phone number with SMS OTP verification
- Recaptcha verification for phone auth

### PatientDashboard.tsx
Doctor discovery and booking interface for authenticated patients.

**Features:**
- Marketplace-style doctor search
- Filters: specialty, fee range, rating, experience
- Sort options: recommended, fee, rating, experience
- AI-powered doctor recommendations
- Doctor card display with availability
- Appointment booking modal

### DoctorCard.tsx
Premium redesigned doctor card component showing:
- Gradient background with accent color
- Doctor avatar with verified badge
- Hospital affiliation and experience
- Consultation fees (clear price display)
- Patient reviews and ratings
- Availability section
- Book Now / View Profile buttons

---

## Authentication Setup

### Firebase Requirements
1. **Email/Password:** Enabled in Firebase Authentication
2. **Google OAuth:** Google Sign-In enabled with web client ID
3. **Phone Verification:** Recaptcha v3 enabled for security
4. **Firestore:** Read/write rules configured for user data

### User Roles
- `patient` - Can search doctors, book appointments, manage medical records
- `doctor` - Can manage profile, accept appointments, create prescriptions
- `admin` - Can moderate content, manage disputes, view analytics

User role stored in Firestore `users` collection under `role` field.

---

## Firebase Deployment

### Build & Deploy Commands
```bash
# Build production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy specific functions
firebase deploy --only functions

# Full deployment
firebase deploy
```

### Firebase Project Details
- **Project ID:** healthreserve01
- **Hosting URL:** https://healthreserve01.web.app/
- **Region:** Default (us-central1)

### Environment Variables (.env)
```
VITE_FIREBASE_API_KEY=<api-key>
VITE_FIREBASE_AUTH_DOMAIN=<auth-domain>
VITE_FIREBASE_PROJECT_ID=healthreserve01
VITE_FIREBASE_STORAGE_BUCKET=<storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
```

---

## Current Status & Known Items

### Completed
- Landing page redesign with hero slider and animations
- Doctor dashboard with marketplace-style filtering
- Doctor card premium redesign
- Email/Password authentication code (needs verification)
- Firebase hosting setup and deployment
- SEO meta tags
- Professional README

### In Progress / To Fix
- **Email/Password Login:** Verify functionality works end-to-end
- **Search Section Redesign:** Implement OlaDoc-style hero search with slider and fade animations
- **UI Polish:** Fix all reported UI issues and inconsistencies
- **Animations:** Add smooth animations to all interactive elements
- **Quality Assurance:** Test all functionality across components

### Firebase Changes Needed (If Any)
- User will notify if additional Firestore rules needed
- Additional authentication methods can be enabled as required

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy

# Check Firebase status
firebase status
```

---

## Contact & Support
Project Lead: HealthReserve Team
GitHub: https://github.com/HafizullahKhokhar1/HealthReserve
Live: https://healthreserve01.web.app/

---

**Last Updated:** May 14, 2026
