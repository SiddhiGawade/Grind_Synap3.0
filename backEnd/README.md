# Backend for Synap

This is a tiny Express-based auth backend used for local development.

Endpoints

- POST /api/auth/signup
  - body: { name, email, password, role }
  - returns 201 on success (file-based) or 501 if Supabase is configured

- POST /api/auth/signin
  - body: { email, password, role }
  - returns { token, user } for file-based auth or profile info for Supabase auth

- GET /api/auth/me
  - headers: Authorization: Bearer <token>
  - returns { user }

- POST /api/auth/sync-profile (Supabase only)
  - body: { userId, email, name, role }
  - syncs user profile to Supabase profiles table

Quick start

1. Copy `.env.example` to `.env` and set a strong JWT_SECRET.

2. Install dependencies and run server:

```powershell
cd backEnd
npm install
npm run dev
```

The server defaults to port 4000 and allows CORS from http://localhost:5173.

Supabase Integration
-------------------

For production authentication using Supabase:

1. Set up environment variables:
   - Frontend: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `frontEnd/.env`
   - Backend: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `backEnd/.env`

2. Create the database schema:
   - Run the SQL in `backEnd/sql/create_profiles_table.sql` in your Supabase SQL editor

3. Authentication flow:
   - Signup: Client calls Supabase Auth directly, then syncs profile to backend
   - Signin: Client authenticates with Supabase, backend validates role and syncs profile
   - Role enforcement: Backend validates user roles against the profiles table

4. Data storage:
   - User credentials: Stored in Supabase Auth (auth.users)
   - User profiles: Stored in profiles table with role, name, and metadata
   - Role-based access: Enforced during signin and maintained in profiles table

Keep the `SUPABASE_SERVICE_KEY` secret and do not commit it to version control.
