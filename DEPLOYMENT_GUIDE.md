# 🔐 Vercel Deployment Guide with Passcode Authentication

## Environment Variables Required for Vercel

You need to configure **3 environment variables** in Vercel:

### Go to: **Project Settings → Environment Variables**

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://mfbacthyllpiprnncyia.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYmFjdGh5bGxwaXBybm5jeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzU3NjAsImV4cCI6MjA5MDI1MTc2MH0.JUJlu7zZq-4cVZN5t5gvg8fRlGTDSFFJ5byCOVXjqWo` | Supabase anonymous key |
| `VITE_APP_PASSCODE` | **`YOUR_CHOSEN_PASSCODE`** | Your secure passcode for app access (1 day token) |

⚠️ **IMPORTANT**: Set your own secure passcode for `VITE_APP_PASSCODE` - don't use the example!

---

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add passcode authentication and update environment config"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** or **"Add New... → Project"**
3. Import your Git repository: **naxweb-systems/naxwebdesigns_management**
4. **Project Name**: `naxweb-manager` (for naxweb-manager.vercel.app)
5. Framework Preset: **Vite** (auto-detected)
6. Click **"Deploy"**

### 3. Configure Environment Variables

**Immediately after creating the project:**

1. Go to **Project Settings → Environment Variables**
2. Click **"Add Variable"** for each:
   - Add `VITE_SUPABASE_URL` (value above)
   - Add `VITE_SUPABASE_ANON_KEY` (value above)
   - Add `VITE_APP_PASSCODE` (your chosen secure passcode)
3. Set each variable for **Production, Preview, and Development** environments
4. Click **"Save"** after each variable

### 4. Redeploy with Environment Variables

After adding all environment variables:

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Click **"Redeploy"** (or deploy again if it didn't auto-redeploy)
4. Wait for build to complete (~1-2 minutes)

### 5. Access Your App

Your app will be live at: **https://naxweb-manager.vercel.app**

You'll see a passcode authentication screen. Enter the passcode you set in `VITE_APP_PASSCODE` to access the dashboard.

---

## Security Features

✅ **Passcode Protection**: All users must enter the passcode to access the app  
✅ **Session Storage**: Authentication persists for the browser session  
✅ **Environment Variables**: Sensitive data stored securely in Vercel, not in code  
✅ **No Hardcoded Credentials**: All sensitive values loaded from Vercel environment  

---

## How Authentication Works

1. User visits the website
2. Sees passcode entry screen (blocks all access)
3. Enters the passcode you configured
4. If correct, gains access to the full dashboard
5. Session persists until browser is closed

---

## Updating Passcode

To change the passcode:

1. Update `VITE_APP_PASSCODE` in Vercel settings
2. Redeploy the application
3. New passcode will be active immediately

---

## Troubleshooting

**App shows login but won't accept passcode:**
- Verify `VITE_APP_PASSCODE` is set correctly in Vercel
- Check that it's set for all environments (Production, Preview, Development)
- Redeploy to apply changes

**Build fails:**
- Ensure all 3 environment variables are set before deploying
- Check Vercel build logs for specific errors

**Supabase connection fails:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Make sure variables are set for the correct environment

---

## Notes

- The `.env` file is now in `.gitignore` - never commit sensitive data
- Local development: create `.env` file with all 3 variables
- Production: all config comes from Vercel environment variables
- Passcode provides basic authentication (not military-grade security)
- For production apps, consider upgrading to full user authentication system
