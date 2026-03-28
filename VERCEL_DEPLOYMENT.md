# Vercel Deployment Guide

## Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

**Settings → Environment Variables**

| Variable Name | Value |
|--------------|-------|
| `VITE_SUPABASE_URL` | `https://mfbacthyllpiprnncyia.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYmFjdGh5bGxwaXBybm5jeWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzU3NjAsImV4cCI6MjA5MDI1MTc2MH0.JUJlu7zZq-4cVZN5t5gvg8fRlGTDSFFJ5byCOVXjqWo` |

## Deployment Steps

1. **Push to Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Framework Preset: **Vite** (auto-detected)
   - Add the environment variables above in Settings → Environment Variables
   - Click "Deploy"

3. **Add Environment Variables in Vercel**:
   - After creating the project, go to **Project Settings → Environment Variables**
   - Add both variables for **Production**, **Preview**, and **Development** environments
   - Click "Save"

4. **Redeploy** (if needed):
   - Go to **Deployments** tab
   - Click "Redeploy" on the latest deployment to apply environment variables

## Notes

- All environment variables are prefixed with `VITE_` to expose them to the Vite client-side app
- The `vercel.json` configuration file is already created with proper build settings
- No build command changes needed - uses default Vite build
