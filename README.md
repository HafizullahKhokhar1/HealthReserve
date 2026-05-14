# HealthReserve

HealthReserve is a modern healthcare marketplace that helps patients find and book trusted doctors in Karachi and other cities. The project includes patient and provider portals, appointment booking (video & in-clinic), medical records management, and a modular UI for doctor discovery.

Live site: https://healthreserve01.web.app/

Key features implemented in this branch:
- Search-first public homepage with hero slider and visible pricing
- Specialty rails, condition shortcuts, and curated service cards
- Improved doctor cards with trust badges, ratings, and clear fees
- Email sign-in, Google sign-in (forced account chooser), and forgot-password flow
- Inline SVG illustrations to avoid blocked external images
- SEO meta tags and Open Graph metadata

Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

Notes
- This branch contains UI/UX improvements focused on the public landing and patient discovery flows.
- The Firebase project is configured for `healthreserve01` hosting (see firebase.json). Do not publish secrets; set environment variables as needed.

Screenshots
- Live homepage (deployed): https://healthreserve01.web.app/

Contributing
- I created a branch `healthreserve/ui-landing-updates` with all UI improvements. If you want the updates merged into `main`, open a PR on GitHub and review conflicts.

---
Generated and updated by the HealthReserve development assistant.
# HealthReserve

Modern telemedicine web app for patients, doctors, and admins.

## Live App

- Frontend URL: https://healthreserve01.web.app
- Current state: frontend is deployed and working

## What README Covers

This README is intentionally short.

For full technical details, deployment steps, architecture, and status tracking, read:
- docs/PROJECT_DOCUMENTATION.md

## Quick Start

### Run locally

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Redeploy frontend

```bash
npm run build
firebase deploy --only hosting
```

## Authentication Methods

- Continue with Google (account chooser enabled)
- Continue with Email (sign in/sign up)
- Forgot Password via reset email
- Continue with Phone OTP

## Tech Stack

- React 19 + TypeScript + Vite
- TailwindCSS
- Firebase (Hosting, Firestore, Auth, Storage)
- Node.js backend in functions/
- Gemini API integration with fallback mode

## Current Product Status

- Deployed now: frontend UI and authenticated experience
- Ready but not deployed: backend APIs, full data persistence flows
- AI currently works in fallback mode when no key/backend is set

## Project Structure

- src/: frontend app
- functions/: backend services
- docs/: documentation

## License

Open source - use freely
