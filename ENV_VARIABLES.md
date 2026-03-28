# 📋 Environment Variables Summary

## Required Vercel Environment Variables

Copy these values to **Vercel → Project Settings → Environment Variables**

### Complete List (3 Variables)

```
VITE_SUPABASE_URL=https://mfbacthyllpiprnncyia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYmFjdGh5bGxwaXBybm5jeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzU3NjAsImV4cCI6MjA5MDI1MTc2MH0.JUJlu7zZq-4cVZN5t5gvg8fRlGTDSFFJ5byCOVXjqWo
VITE_APP_PASSCODE=YOUR_SECURE_PASSCODE_HERE
```

---

## Quick Setup Instructions

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `naxweb-manager`

2. **Open Environment Variables**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in sidebar
   - Click **"Add Variable"**

3. **Add Each Variable**
   For each of the 3 variables above:
   - Click "Add Variable"
   - Paste the **Name** (e.g., `VITE_SUPABASE_URL`)
   - Paste the **Value**
   - Select environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

4. **Redeploy**
   - Go to **"Deployments"** tab
   - Click latest deployment
   - Click **"Redeploy"**
   - Wait for build to complete

5. **Test Access**
   - Visit: https://naxweb-manager.vercel.app
   - Enter your passcode
   - Verify dashboard loads

---

## ⚠️ Important Notes

### Passcode Security
- Choose a **strong, unique passcode** (minimum 8 characters)
- Don't use obvious values like "1234" or "password"
- The passcode is required to access the app
- You can change it anytime by updating `VITE_APP_PASSCODE` in Vercel

### Token Duration
- Session persists for **browser session** (until browser is closed)
- Users must re-enter passcode after closing browser
- This provides basic protection for casual access

### No Hardcoded Values
✅ All sensitive data now comes from Vercel environment  
✅ No credentials are hardcoded in the source code  
✅ `.env` file is excluded from Git (in `.gitignore`)  
✅ Safe to share repository publicly  

---

## Local Development Setup

For local testing, create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://mfbacthyllpiprnncyia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYmFjdGh5bGxwaXBybm5jeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzU3NjAsImV4cCI6MjA5MDI1MTc2MH0.JUJlu7zZq-4cVZN5t5gvg8fRlGTDSFFJ5byCOVXjqWo
VITE_APP_PASSCODE=testpass123
```

Then run:
```bash
npm install
npm run dev
```

---

## Troubleshooting

**Can't login with passcode:**
- Check Vercel logs to confirm `VITE_APP_PASSCODE` is set
- Redeploy to apply new environment variable
- Clear browser cache and try again

**Build fails:**
- Ensure all 3 variables are set before deploying
- Check for typos in variable names
- Review Vercel deployment logs

**Supabase errors:**
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure anonymous key has proper permissions

---

## Files Changed

These files ensure environment variables are properly loaded:

- ✅ `src/Auth.jsx` - Passcode authentication component
- ✅ `src/App.jsx` - Integrated authentication
- ✅ `src/lib/supabase.js` - Uses env variables (not hardcoded)
- ✅ `vite.config.js` - Build-time config injection
- ✅ `public/config.json` - Runtime passcode config
- ✅ `.gitignore` - Excludes sensitive data
- ✅ `.env` - Local development template

---

**Ready to deploy!** 🚀

Just add the 3 environment variables in Vercel and redeploy.
