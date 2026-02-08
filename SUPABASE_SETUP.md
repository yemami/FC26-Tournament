# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: FC26-Tournament (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes 1-2 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 5: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see three tables:
   - `players`
   - `tournaments`
   - `matches`

## Step 6: Test the App

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. The app should now use Supabase instead of localStorage!

## Migration from localStorage

If you have existing tournament data in localStorage, it will automatically sync to Supabase when you:
1. Open the app
2. The app will detect localStorage data and migrate it

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env` file exists in the project root
- Check that variable names start with `VITE_`
- Restart your dev server after creating/updating `.env`

### Error: "relation does not exist"
- Make sure you ran the SQL script (`supabase-setup.sql`) in SQL Editor
- Check that all tables were created successfully

### Data not saving
- Check browser console for errors
- Verify your Supabase project is active (not paused)
- Check RLS policies are set correctly (should allow all operations)

## Next Steps

Once setup is complete, the app will:
- ✅ Save all data to Supabase database
- ✅ Sync across devices/browsers
- ✅ Persist data even after clearing browser cache
- ✅ Support multiple tournaments (future enhancement)
