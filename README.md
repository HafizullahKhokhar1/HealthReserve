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
