# HealthReserve - Gemini API Setup Guide

## 📍 Where to Put Your Gemini API Key

### Option 1: Local Development (.env file)
1. Create a `.env` file in the project root: `h:\Projects\Full Stack Projects\healthreserve\.env`
2. Add these lines:
```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_MODEL=gemini-1.5-flash
```

3. Run the dev server:
```bash
npm run dev
```

The app will automatically use your API key in the browser.

---

### Option 2: Production (Firebase Hosting - RECOMMENDED)
For production deployment, add environment variables to your Firebase hosting configuration.

**Step 1: Get your Gemini API key**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable the "Generative Language API"
- Go to "Credentials" → Create API Key
- Copy the key

**Step 2: Add to Firebase**
Create or update `.env.production` in project root:
```
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_MODEL=gemini-1.5-flash
```

**Step 3: Update vite.config.ts (if needed)**
The config already supports environment variables through Vite.

**Step 4: Deploy**
```bash
npm run build
firebase deploy --only hosting
```

---

### Option 3: Using Firebase Environment Config (Secure - For Cloud Functions)
If you deploy Cloud Functions later:

1. Set the secret in Firebase:
```bash
firebase functions:config:set gemini.key="your_api_key_here"
firebase functions:config:set gemini.model="gemini-1.5-flash"
```

2. Deploy functions:
```bash
firebase deploy --only functions
```

---

## 🔐 Security Notes

⚠️ **Important:** The `VITE_GEMINI_API_KEY` with the `VITE_` prefix is exposed to the browser (client-side key).
- This is **intentional for testing/development**
- For production, consider implementing a backend-side API key holder
- You can implement rate limiting and request validation on your backend

---

## 🧪 Testing the AI Features

### Test 1: Floating AI Assistant
- Log into the app
- Look for the blue chat button in the bottom-right corner
- Click it to open the AI chat
- Ask: "What should I look for in a doctor?"

### Test 2: Doctor Profile AI Chat (In-App)
- Click "View Profile" on any doctor card
- In the modal, there will be an "Ask..." button at the bottom (if you previously configured chat)
- Ask about the doctor's specialization, experience, etc.

### Test 3: Without API Key
- All features still work with local fallback responses
- The AI will provide pre-written helpful responses
- Add your API key anytime to enable full Gemini AI capabilities

---

## 📝 Current Deployment Status

✅ **App is LIVE:** https://healthreserve01.web.app

### Current Features:
- ✅ Floating AI Assistant (any doctor question)
- ✅ Dark/Light mode toggle (fixed and working)
- ✅ Search button in header
- ✅ Doctor profile editing with availability management
- ✅ Public doctor portfolio pages (shareable URLs)
- ✅ Notification panel
- ✅ Patient-doctor AI chat in profiles
- ✅ AI fallback responses (works without API key)

### To Enable Full AI:
1. Get Gemini API key (free tier available)
2. Add to `.env` (development) or Firebase (production)
3. Restart dev server or redeploy to Firebase
4. Test the floating AI assistant

---

## 🚀 Quick Commands

**Development:**
```bash
npm run dev          # Start local dev server
npm run build        # Build for production
npm run lint         # Check TypeScript
```

**Firebase:**
```bash
firebase deploy --only hosting    # Deploy frontend
firebase deploy --only functions  # Deploy Cloud Functions
firebase logs                     # View logs
```

---

## 💡 How AI Features Work

### Without API Key:
- Floating AI provides helpful preset responses
- Doctor profiles show local summaries from reviews
- All features work seamlessly

### With API Key:
- Floating AI uses Google Gemini for intelligent responses
- Answers are context-aware and personalized
- Doctor profile AI provides detailed AI-generated summaries

---

## 📞 Support

If you encounter issues:
1. Check that VITE_GEMINI_API_KEY is correctly set
2. Clear browser cache (Ctrl+Shift+Delete)
3. Rebuild the app: `npm run build`
4. Redeploy: `firebase deploy --only hosting`

Happy coding! 🎉
