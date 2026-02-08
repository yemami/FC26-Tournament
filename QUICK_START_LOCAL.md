# 🚀 Quick Start: Local Supabase Development

Run Supabase **locally** for debugging without the web app!

## Step 1: Start Docker

**macOS:**
- Open **Docker Desktop** app
- Wait until it shows "Docker is running" in the menu bar

**Check if Docker is running:**
```bash
docker ps
```
If you see a list (even if empty), Docker is running ✅

## Step 2: Start Local Supabase

```bash
npm run supabase:start
```

**First time:** Downloads Docker images (~5-10 min)  
**After that:** Starts in ~30 seconds

**You'll see output like:**
```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Setup Local Environment

1. Copy the **anon key** from the output above
2. Create `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Edit `.env.local` and paste your local credentials:
   ```
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<paste-anon-key-from-step-2>
   ```

## Step 4: Start Your App

```bash
npm run dev
```

🎉 **Your app now uses local Supabase!**

## Access Local Supabase Studio

Open: **http://localhost:54323**

This is your **local dashboard** where you can:
- View/edit tables
- Run SQL queries  
- See real-time data
- Debug issues

## Useful Commands

```bash
# Start Supabase
npm run supabase:start

# Stop Supabase (keeps data)
npm run supabase:stop

# Check status
npm run supabase:status

# Reset database (fresh start)
npm run supabase:reset

# View logs
npm run supabase:logs
```

## Switching Between Local and Production

**Local (development):**
- Uses `.env.local` (takes priority)
- Faster, offline, free

**Production (testing):**
- Uses `.env` 
- Real cloud database

## Troubleshooting

**"Docker daemon not running"**
→ Start Docker Desktop app

**"Port already in use"**
→ Run `npm run supabase:stop` first

**"Migration failed"**
→ Run `npm run supabase:reset`

**Data not saving**
→ Check `.env.local` has correct credentials
→ Restart dev server after changing `.env.local`

## Benefits

✅ **Faster** - No network latency  
✅ **Free** - No API limits  
✅ **Offline** - Works without internet  
✅ **Safe** - Test without affecting production  
✅ **Debug** - Full database access  
