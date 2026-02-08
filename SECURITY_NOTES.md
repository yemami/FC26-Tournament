# 🔒 Security Notes - API Keys

## ⚠️ Important: Never Commit Secret Keys!

**Secret keys should NEVER be:**
- Committed to git
- Exposed in client-side code
- Shared publicly
- Used in React/Vite apps

## Key Types

### ✅ Publishable Key (Anon Key) - Safe for Client
- **Use in:** React apps, client-side code
- **Location:** `.env` file (already set up)
- **Format:** `sb_publishable_...` or `eyJhbGc...` (legacy)
- **Safe to:** Commit to git (if needed), use in browser

### ❌ Secret Key - Server-Side Only
- **Use in:** Backend servers, API routes, serverless functions
- **Location:** Server environment variables only
- **Format:** `sb_secret_...` or `eyJhbGc...` (legacy service_role)
- **Never:** Put in client code, commit to git, expose in browser

## Your Current Setup

### Production (`.env`)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_... ✅ CORRECT (get from Supabase dashboard)
```

### Local Development (`.env.local`)
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<from-supabase-start-output> ✅ CORRECT
```

## What About the Secret Key?

Your secret key (from Supabase dashboard) is:
- ✅ Safe to use in backend/server code
- ✅ Useful for admin operations
- ❌ **NOT needed** for this React app
- ❌ **DO NOT** put it in `.env` or `.env.local`

## If You Need Server-Side Operations

If you later add a backend API, use the secret key there:

```javascript
// Backend only (Node.js, serverless function, etc.)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Secret key here
)
```

## Current Status

✅ Your app is correctly configured with the **publishable key**  
✅ Secret key is safe (not in code)  
✅ `.env` is in `.gitignore` (won't be committed)

## Summary

- **React App:** Uses publishable/anon key ✅
- **Secret Key:** Keep it safe, don't use in React app ✅
- **Local Dev:** Use local anon key from `supabase start` ✅
