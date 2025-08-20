# Deploy Backend Updates to Render

## Issues Found
1. Your Render backend needs the updated CORS code I just added to `backEnd/server.js`
2. The FRONTEND_BASE environment variable on Render needs to be set correctly

## Steps to Fix

### Step 1: Deploy Updated Code to Render
Your Render service needs the new CORS code. Deploy by either:

**Option A: Git Push (if Render is connected to your GitHub repo)**
```bash
git add .
git commit -m "Fix CORS for multiple origins"
git push origin main
```
Render will automatically redeploy.

**Option B: Manual Redeploy**
- Go to your Render dashboard
- Find your backend service "grind-synap3-0-1"
- Click "Manual Deploy" > "Deploy latest commit"

### Step 2: Update Environment Variables on Render
1. Go to Render Dashboard > Your backend service
2. Go to "Environment" tab
3. Update/Add these variables:

```
PORT=4000
JWT_SECRET=your-production-jwt-secret
SUPABASE_URL=https://rfqcamcuquogscttnrix.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWNhbWN1cXVvZ3NjdHRucml4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU1OTk4NiwiZXhwIjoyMDcxMTM1OTg2fQ.Yr4iIepCZoFRTYtFGJEasxgmhhrDb5yykvVXAgZmc_U
FRONTEND_BASE=https://grind-synap3-0-kappa.vercel.app
```

**Important**: Remove any trailing slash from FRONTEND_BASE if it exists.

### Step 3: Redeploy Backend (if env vars changed)
After updating environment variables, trigger a redeploy to load the new values.

### Step 4: Test
After deploy completes:
1. Visit your frontend: https://grind-synap3-0-kappa.vercel.app
2. Open browser DevTools > Console
3. Check if CORS errors are gone
4. Verify API calls show data loading

## Quick Test Commands
```bash
# Test CORS directly
curl -H "Origin: https://grind-synap3-0-kappa.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS \
     https://grind-synap3-0-1.onrender.com/api/auth/me

# Should return CORS headers without error
```

## Expected Result
- No more CORS errors in browser console
- API calls from frontend work correctly
- Data loads from backend/database
