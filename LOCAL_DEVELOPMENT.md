# Local Supabase Development Guide

Run Supabase locally for faster development and debugging without using the web app!

## Prerequisites

- Docker Desktop (or compatible container runtime)
- Node.js 20+ (already installed)

## Quick Start

### 1. Start Local Supabase

```bash
npx supabase start
```

**First time:** This downloads Docker images (~5-10 minutes). Subsequent starts are much faster.

**Output:** You'll see credentials like:
```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

### 2. Copy Local Credentials

After `supabase start`, copy the **anon key** and update `.env.local`:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with the values from `supabase start` output:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<copy-from-supabase-start-output>
```

### 3. Run Migrations

The migrations are already set up. They run automatically when you start Supabase, but you can reset if needed:

```bash
# Reset database (applies all migrations)
npx supabase db reset

# Or apply migrations manually
npx supabase migration up
```

### 4. Start Your App

```bash
npm run dev
```

The app will now use your **local** Supabase instance!

## Access Local Supabase Studio

Open your browser to: **http://localhost:54323**

This is your local Supabase dashboard where you can:
- View/edit tables
- Run SQL queries
- See real-time data
- Debug issues

## Useful Commands

```bash
# Start Supabase
npx supabase start

# Stop Supabase (preserves data)
npx supabase stop

# Stop and reset database
npx supabase stop --no-backup

# Check status
npx supabase status

# View logs
npx supabase logs

# Reset database (apply migrations fresh)
npx supabase db reset

# Create new migration
npx supabase migration new migration_name
```

## Switching Between Local and Production

### Use Local (for development)
```bash
# Make sure .env.local exists with local credentials
npm run dev
```

### Use Production (for testing)
```bash
# Make sure .env exists with production credentials
npm run dev
```

**Note:** Vite loads `.env.local` first, then `.env`. So `.env.local` takes precedence.

## Troubleshooting

### "Docker not running"
- Start Docker Desktop
- Wait for it to fully start
- Try `npx supabase start` again

### "Port already in use"
- Stop existing Supabase: `npx supabase stop`
- Or change ports in `supabase/config.toml`

### "Migration failed"
- Check migration files in `supabase/migrations/`
- Reset database: `npx supabase db reset`
- Check logs: `npx supabase logs`

### Data not appearing
- Verify `.env.local` has correct local credentials
- Check Supabase Studio: http://localhost:54323
- Restart dev server after changing `.env.local`

## Benefits of Local Development

✅ **Faster** - No network latency  
✅ **Free** - No API limits  
✅ **Offline** - Works without internet  
✅ **Safe** - Test without affecting production  
✅ **Debug** - Full access to database logs  
✅ **Reset** - Easy to start fresh  

## Production Deployment

When ready to deploy:
1. Use production `.env` file (not `.env.local`)
2. Make sure migrations are applied to production
3. Test with production Supabase instance
