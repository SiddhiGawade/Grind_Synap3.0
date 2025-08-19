const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const DATA_FILE = path.join(__dirname, 'users.json');
const EVENTS_FILE = path.join(__dirname, 'events.json');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const app = express();
// Allow CORS from the frontend base configured in the backend .env (fallback to localhost:5173)
const FRONTEND_BASE = process.env.FRONTEND_BASE || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_BASE }));
app.use(express.json({ limit: '15mb' }));

// Serve uploaded files
const UPLOADS_DIR = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer setup for image uploads
let multer;
try {
  multer = require('multer');
} catch (e) {
  multer = null;
}

if (multer) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safe = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
      cb(null, `${unique}-${safe}`);
    }
  });
  const upload = multer({ storage });

  // Image upload endpoint
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const url = `/uploads/${req.file.filename}`;
      return res.json({ url, filename: req.file.filename });
    } catch (err) {
      console.error('Upload error', err);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
} else {
  console.warn('Multer not installed - upload endpoint disabled');
}

// Fallback upload endpoint (accepts base64) so front-end can work even if multer isn't installed
app.post('/api/upload-base64', async (req, res) => {
  try {
    const { filename, data } = req.body || {};
    if (!filename || !data) return res.status(400).json({ error: 'Missing filename or data' });
    // ensure uploads dir exists
    try { await fs.mkdir(UPLOADS_DIR, { recursive: true }); } catch (e) {}
    const safe = filename.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + safe;
    const dest = path.join(UPLOADS_DIR, unique);
    // data is expected to be data URL or base64 string
    const base64 = data.includes('base64,') ? data.split('base64,')[1] : data;
    const buffer = Buffer.from(base64, 'base64');
    await fs.writeFile(dest, buffer);
    const url = `/uploads/${unique}`;
    return res.json({ url, filename: unique });
  } catch (err) {
    console.error('base64 upload failed', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// Also expose /api/upload as a fallback when multer isn't available so front-end doesn't get 404
if (!multer) {
  app.post('/api/upload', async (req, res) => {
    try {
      const { filename, data } = req.body || {};
      if (!filename || !data) return res.status(400).json({ error: 'Missing filename or data' });
      try { await fs.mkdir(UPLOADS_DIR, { recursive: true }); } catch (e) {}
      const safe = filename.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + safe;
      const dest = path.join(UPLOADS_DIR, unique);
      const base64 = data.includes('base64,') ? data.split('base64,')[1] : data;
      const buffer = Buffer.from(base64, 'base64');
      await fs.writeFile(dest, buffer);
      const url = `/uploads/${unique}`;
      return res.json({ url, filename: unique });
    } catch (err) {
      console.error('fallback upload failed', err);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}

// Initialize Supabase admin client if service key is provided
let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { persistSession: false });
    console.log('Supabase admin client initialized');
  } catch (e) {
    console.error('Failed to initialize Supabase client', e);
    supabaseAdmin = null;
  }
}

async function readUsers() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      return [];
    }
    throw e;
  }
}

async function writeUsers(users) {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

async function readEvents() {
  try {
    const raw = await fs.readFile(EVENTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') {
      await fs.writeFile(EVENTS_FILE, '[]');
      return [];
    }
    throw e;
  }
}

async function writeEvents(events) {
  await fs.writeFile(EVENTS_FILE, JSON.stringify(events, null, 2));
}

// Fixed mapEventRow function - ensures all fields are properly mapped
function mapEventRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    aadhar: row.aadhar,
    organization: row.organization,
    designation: row.designation,
    eventType: row.event_type || row.eventType || 'event',
    eventTitle: row.event_title || row.eventTitle,
    eventDescription: row.event_description || row.eventDescription,
    startDate: row.start_date || row.startDate,
    startTime: row.start_time || row.startTime,
    endDate: row.end_date || row.endDate,
    endTime: row.end_time || row.endTime,
    numberOfMentors: row.number_of_mentors != null ? row.number_of_mentors : (row.numberOfMentors || 0),
    authorizedJudges: Array.isArray(row.authorized_judges) ? row.authorized_judges : (row.authorizedJudges || []),
    
    // Hackathon specific fields
    hackathonMode: row.hackathon_mode || row.hackathonMode,
    venue: row.venue,
    registrationDeadline: row.registration_deadline || row.registrationDeadline,
    eligibility: row.eligibility,
    minTeamSize: row.min_team_size || row.minTeamSize,
    maxTeamSize: row.max_team_size || row.maxTeamSize,
    maxParticipants: row.max_participants || row.maxParticipants,
    themes: row.themes,
    tracks: Array.isArray(row.tracks) ? row.tracks : (row.tracks || []),
    submissionGuidelines: row.submission_guidelines || row.submissionGuidelines,
    evaluationCriteria: row.evaluation_criteria || row.evaluationCriteria,
    prizeDetails: row.prize_details || row.prizeDetails,
    participationCertificates: row.participation_certificates != null ? row.participation_certificates : (row.participationCertificates || false),
    
    // Event specific fields
    eventCategory: row.event_category || row.eventCategory,
    eventMode: row.event_mode || row.eventMode,
    registrationFee: row.registration_fee || row.registrationFee,
    
    // General fields
    announcements: Array.isArray(row.announcements) ? row.announcements : (row.announcements || []),
    eventCode: row.event_code || row.eventCode,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
}

// Helper: attempt insert and on PGRST204 (missing column in schema cache) remove the offending column and retry
async function supabaseInsertWithColumnRetry(table, payload) {
  if (!supabaseAdmin) return { data: null, error: { message: 'Supabase not configured' } };
  let attemptPayload = { ...payload };
  const maxAttempts = 6;
  for (let i = 0; i < maxAttempts; i++) {
    const { data, error } = await supabaseAdmin.from(table).insert(attemptPayload).select().single();
    if (!error) return { data, error: null };
    // If missing column error, remove that key and retry
    if (error && error.code === 'PGRST204' && typeof error.message === 'string') {
      const m = error.message.match(/Could not find the '([^']+)' column/);
      const col = m ? m[1] : null;
      if (!col) return { data: null, error };
      // remove snake_case key if present
      if (Object.prototype.hasOwnProperty.call(attemptPayload, col)) {
        delete attemptPayload[col];
        continue;
      }
      // also try camelCase variant
      const camel = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (Object.prototype.hasOwnProperty.call(attemptPayload, camel)) {
        delete attemptPayload[camel];
        continue;
      }
      // nothing to remove -> give up
      return { data: null, error };
    }
    // other errors -> return
    return { data: null, error };
  }
  return { data: null, error: { message: 'Exceeded retry attempts' } };
}

// Helper: attempt update and on PGRST204 remove offending columns and retry
async function supabaseUpdateWithColumnRetry(table, filterColumn, filterValue, payload) {
  if (!supabaseAdmin) return { data: null, error: { message: 'Supabase not configured' } };
  let attemptPayload = { ...payload };
  const maxAttempts = 6;
  for (let i = 0; i < maxAttempts; i++) {
    const { data, error } = await supabaseAdmin.from(table).update(attemptPayload).eq(filterColumn, filterValue).select().single();
    if (!error) return { data, error: null };
    if (error && error.code === 'PGRST204' && typeof error.message === 'string') {
      const m = error.message.match(/Could not find the '([^']+)' column/);
      const col = m ? m[1] : null;
      if (!col) return { data: null, error };
      if (Object.prototype.hasOwnProperty.call(attemptPayload, col)) {
        delete attemptPayload[col];
        continue;
      }
      const camel = col.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (Object.prototype.hasOwnProperty.call(attemptPayload, camel)) {
        delete attemptPayload[camel];
        continue;
      }
      return { data: null, error };
    }
    return { data: null, error };
  }
  return { data: null, error: { message: 'Exceeded retry attempts' } };
}

// Unified event lookup: use Supabase when available, otherwise read from file
async function findEventByIdOrCode(id) {
  if (!id) return null;
  if (supabaseAdmin) {
    try {
      // First, try to lookup by id (UUID). If id isn't a valid UUID this can error; fall back to event_code lookup.
      try {
        const { data: byId, error: idErr } = await supabaseAdmin.from('events').select('*').eq('id', id).limit(1).single();
        if (!idErr && byId) return mapEventRow(byId) || null;
      } catch (e) {
        // ignore invalid UUID cast errors and fall back
      }

      const { data, error } = await supabaseAdmin.from('events')
        .select('*')
        .or(`event_code.eq.${String(id).toUpperCase()}`)
        .limit(1)
        .single();
      if (error) return null;
      return mapEventRow(data) || null;
    } catch (e) {
      console.warn('Supabase event lookup failed', e);
      return null;
    }
  }

  const events = await readEvents();
  return events.find(e => e.id === id || (e.eventCode && e.eventCode.toUpperCase() === String(id).toUpperCase())) || null;
}

// Small helper to generate a short human-friendly event code
function generateEventCode(len = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // avoid confusing chars
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    // If Supabase admin client is available, create user with email_confirm: true to bypass confirmation
    if (supabaseAdmin) {
      try {
        // First, check if user exists in auth.users and delete if found (cleanup orphaned auth users)
        try {
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (existingUser) {
            console.log(`Deleting existing auth user: ${existingUser.email}`);
            await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
          }
        } catch (cleanupErr) {
          console.warn('Failed to cleanup existing user:', cleanupErr);
          // Continue with signup anyway
        }

        // Create user in Supabase Auth (service role) with confirmed email
        const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password,
          email_confirm: true, // This bypasses email confirmation
          user_metadata: { name, role }
        });
        if (createErr) {
          console.error('Supabase createUser error', createErr);
          // If email already exists, return 409
          if (createErr?.message?.toLowerCase?.().includes('already')) {
            return res.status(409).json({ error: 'Email already in use' });
          }
          return res.status(500).json({ error: 'Failed to create user' });
        }

        // Insert profile into 'profiles' table
        try {
          const profile = {
            id: createdUser.user.id,
            name,
            email: email.toLowerCase(),
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Use upsert to avoid duplicate primary key errors if a profile already exists
          const { data: profileData, error: profileErr } = await supabaseAdmin
            .from('profiles')
            .upsert(profile, { onConflict: 'id' })
            .select()
            .single();

          if (profileErr) {
            // Log but don't fail the signup flow
            console.warn('Failed to upsert profile row', profileErr);
          }
        } catch (e) {
          console.warn('Profile upsert exception', e);
        }

        return res.status(201).json({ 
          message: 'User created successfully',
          user: {
            id: createdUser.user.id,
            email: createdUser.user.email,
            name,
            role
          }
        });
      } catch (e) {
        console.error('Supabase signup exception', e);
        return res.status(500).json({ error: 'Server error' });
      }
    } else {
      // Fallback: file-based users.json storage (only when Supabase NOT configured)
      const users = await readUsers();
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const user = {
        id: Date.now().toString(),
        name,
        email: email.toLowerCase(),
        role,
        passwordHash,
        createdAt: new Date().toISOString()
      };

      users.push(user);
      await writeUsers(users);

      return res.status(201).json({ message: 'User created' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
  const { email, password, role } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // If Supabase admin client is available, only validate profile data
    // The actual authentication should be done client-side with Supabase
    if (supabaseAdmin) {
      try {
        // Get user profile from profiles table to validate role
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, name, role')
          .eq('email', email.toLowerCase())
          .single();

        if (profileError || !profileData) {
          // User doesn't exist in Supabase profiles table
          // Check file-based users as fallback (for judges created in users.json)
          const users = await readUsers();
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user || (role && user.role !== role)) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }

          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }

          // No event-code based judge validation; judges authenticate with email/password only

          // Return file-based user authentication success
          const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
          const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
          return res.json({ token, user: payload });
        }

        // Check role if provided
        if (role && profileData.role !== role) {
          // Role mismatch - return generic error for privacy
          return res.status(401).json({ error: 'Invalid email or password' });
        }
  // No event-code based judge validation; rely on profile.role checks only

        // For Supabase-backed auth, return success with user profile
        // The client should have already authenticated with Supabase
        return res.json({ 
          success: true,
          user: {
            id: profileData.id,
            email: profileData.email,
            name: profileData.name,
            role: profileData.role
          },
          message: 'Profile validated successfully'
        });

      } catch (e) {
        console.error('Supabase profile validation error', e);
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    // Fallback: file-based authentication (only when Supabase not configured)
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || (role && user.role !== role)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

  // No event-code based judge validation on fallback auth

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    return res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Missing authorization' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization' });
    const token = parts[1];
    
    // First, try to verify as our own JWT token
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // Return user info from our JWT token (no sensitive data)
      return res.json({ user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role } });
    } catch (jwtError) {
      // JWT verification failed, try Supabase token verification
    }

    // If Supabase is configured, try to verify as Supabase access token
    if (supabaseAdmin) {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        
        // Get user profile from Supabase profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          // If no profile exists, use user metadata
          const meta = user.user_metadata || {};
          return res.json({ 
            user: { 
              id: user.id, 
              name: meta.name || user.email?.split('@')[0] || '', 
              email: user.email, 
              role: meta.role || 'participant' 
            } 
          });
        }
        
        // Return profile data
        return res.json({ 
          user: { 
            id: profile.id, 
            name: profile.name, 
            email: profile.email, 
            role: profile.role 
          } 
        });
      } catch (supabaseError) {
        console.error('Supabase token verification failed:', supabaseError);
      }
    }
    
    // Neither JWT nor Supabase token worked
    return res.status(401).json({ error: 'Invalid token' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// New endpoint to sync/create user profile in Supabase after client-side auth
app.post('/api/auth/sync-profile', async (req, res) => {
  try {
    const { userId, email, name, role } = req.body || {};
    if (!userId || !email || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!supabaseAdmin) {
      return res.status(501).json({ error: 'Supabase not configured' });
    }

    // Validate role
    const validRoles = ['participant', 'judge', 'creator', 'organizer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    try {
      // Insert or update profile in Supabase
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: email.toLowerCase(),
            name,
            role,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Profile sync error', error);
        return res.status(500).json({ error: 'Failed to sync profile' });
      }

      return res.json({ 
        message: 'Profile synced successfully',
        profile: data
      });

    } catch (e) {
      console.error('Profile sync exception', e);
      return res.status(500).json({ error: 'Server error during profile sync' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get all judges for creator to select from
app.get('/api/judges', async (req, res) => {
  try {
    if (supabaseAdmin) {
      // Get judges from Supabase profiles table
      try {
        const { data: judges, error } = await supabaseAdmin
          .from('profiles')
          .select('id, name, email')
          .eq('role', 'judge')
          .order('name');
        
        if (error) {
          console.error('Supabase judges fetch error', error);
          return res.status(500).json({ error: 'Failed to fetch judges' });
        }
        
        return res.json({ judges: judges || [] });
      } catch (e) {
        console.error('Supabase judges exception', e);
        return res.status(500).json({ error: 'Server error' });
      }
    } else {
      // Fallback: get judges from users.json
      const users = await readUsers();
      const judges = users
        .filter(u => u.role === 'judge')
        .map(u => ({ id: u.id, name: u.name, email: u.email }))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return res.json({ judges });
    }
  } catch (err) {
    console.error('Get judges error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create event (Supabase if configured) - FIXED VERSION
app.post('/api/events', async (req, res) => {
  try {
    console.log('=== EVENT CREATION REQUEST ===');
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const data = req.body || {};
    if (!data.eventTitle || !data.name || !data.email) {
      return res.status(400).json({ error: 'Missing required fields: eventTitle, name, email' });
    }

    // Normalize fields - handle both camelCase and snake_case from frontend
    const eventPayload = {
      id: Date.now().toString(),
      eventType: data.eventType || data.event_type || 'event',
      name: data.name,
      email: data.email,
      aadhar: data.aadhar,
      organization: data.organization,
      designation: data.designation,
      eventTitle: data.eventTitle || data.event_title,
      eventDescription: data.eventDescription || data.event_description,
      startDate: data.startDate || data.start_date,
      startTime: data.startTime || data.start_time,
      endDate: data.endDate || data.end_date,
      endTime: data.endTime || data.end_time,
      numberOfMentors: typeof data.numberOfMentors === 'number' ? data.numberOfMentors : (Number(data.numberOfMentors) || Number(data.number_of_mentors) || 0),
      authorizedJudges: Array.isArray(data.authorizedJudges) ? data.authorizedJudges : (Array.isArray(data.authorized_judges) ? data.authorized_judges : (Array.isArray(data.judgeEmails) ? data.judgeEmails : [])),
      
      // Hackathon specific fields
      hackathonMode: data.hackathonMode || data.hackathon_mode,
      venue: data.venue,
      registrationDeadline: data.registrationDeadline || data.registration_deadline,
      eligibility: data.eligibility,
      minTeamSize: data.minTeamSize || data.min_team_size,
      maxTeamSize: data.maxTeamSize || data.max_team_size,
      maxParticipants: data.maxParticipants || data.max_participants,
      themes: data.themes,
      tracks: Array.isArray(data.tracks) ? data.tracks : (data.tracks ? [data.tracks] : []),
      submissionGuidelines: data.submissionGuidelines || data.submission_guidelines,
      evaluationCriteria: data.evaluationCriteria || data.evaluation_criteria,
      prizeDetails: data.prizeDetails || data.prize_details,
      participationCertificates: data.participationCertificates != null ? data.participationCertificates : (data.participation_certificates != null ? data.participation_certificates : false),
      
      // Event specific fields
      eventCategory: data.eventCategory || data.event_category,
      eventMode: data.eventMode || data.event_mode,
      registrationFee: data.registrationFee || data.registration_fee,
      
      announcements: Array.isArray(data.announcements) ? data.announcements : [],
      createdAt: new Date().toISOString()
    };

    // Generate eventCode if not provided
    let code = (data.eventCode && String(data.eventCode).trim()) ? String(data.eventCode).trim() : generateEventCode(6);

    if (supabaseAdmin) {
      // Ensure uniqueness of code
      let attempts = 0;
      const existingCodes = new Set((await supabaseAdmin.from('events').select('event_code')).data?.map(r => (r.event_code || '').toUpperCase()) || []);
      while (existingCodes.has(code.toUpperCase()) && attempts < 10) {
        code = generateEventCode(6);
        attempts++;
      }
      
      // Build snake_case payload for Postgres (omit id to let DB generate UUID)
      const insertPayload = {
        event_type: eventPayload.eventType,
        name: eventPayload.name,
        email: eventPayload.email,
        aadhar: eventPayload.aadhar,
        organization: eventPayload.organization,
        designation: eventPayload.designation,
        event_title: eventPayload.eventTitle,
        event_description: eventPayload.eventDescription,
        start_date: eventPayload.startDate,
        start_time: eventPayload.startTime,
        end_date: eventPayload.endDate,
        end_time: eventPayload.endTime,
        number_of_mentors: eventPayload.numberOfMentors,
        authorized_judges: eventPayload.authorizedJudges,
        
        // Hackathon specific fields
        hackathon_mode: eventPayload.hackathonMode,
        venue: eventPayload.venue,
        registration_deadline: eventPayload.registrationDeadline,
        eligibility: eventPayload.eligibility,
        min_team_size: eventPayload.minTeamSize,
        max_team_size: eventPayload.maxTeamSize,
        max_participants: eventPayload.maxParticipants,
        themes: eventPayload.themes,
        tracks: eventPayload.tracks,
        submission_guidelines: eventPayload.submissionGuidelines,
        evaluation_criteria: eventPayload.evaluationCriteria,
        prize_details: eventPayload.prizeDetails,
        participation_certificates: eventPayload.participationCertificates,
        
        // Event specific fields
        event_category: eventPayload.eventCategory,
        event_mode: eventPayload.eventMode,
        registration_fee: eventPayload.registrationFee,
        
        announcements: eventPayload.announcements,
        event_code: code,
        created_at: eventPayload.createdAt
      };

      console.log('=== SUPABASE INSERT PAYLOAD ===');
      console.log(JSON.stringify(insertPayload, null, 2));

      const { data: created, error } = await supabaseInsertWithColumnRetry('events', insertPayload);
      if (error) {
        console.error('=== SUPABASE INSERT ERROR ===');
        console.error('Error details:', JSON.stringify(error, null, 2));
        return res.status(500).json({ error: 'Failed to create event' });
      }
      console.log('=== SUPABASE INSERT SUCCESS ===');
      console.log('Created event data:', JSON.stringify(created, null, 2));
      return res.status(201).json({ message: 'Event created', event: mapEventRow(created) });
    } else {
      // Fallback file-backed
      const events = await readEvents();
      const existingCodes = new Set(events.map(e => (e.eventCode || '').toUpperCase()));
      let attempts = 0;
      while (existingCodes.has(code.toUpperCase()) && attempts < 10) {
        code = generateEventCode(6);
        attempts++;
      }
      const newEvent = { id: eventPayload.id, ...eventPayload, eventCode: code };
      events.push(newEvent);
      await writeEvents(events);
      return res.status(201).json({ message: 'Event created', event: newEvent });
    }
  } catch (err) {
    console.error('Failed to create event', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get events
app.get('/api/events', async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('events').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase fetch events error', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }
      // map snake_case rows to camelCase
      return res.json((data || []).map(mapEventRow));
    } else {
      const events = await readEvents();
      return res.json(events);
    }
  } catch (err) {
    console.error('Failed to read events', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update event - FIXED VERSION
app.put('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};

    if (supabaseAdmin) {
      // Merge update (we'll return updated row)
      const updatePayload = {
        ...payload,
        numberOfMentors: typeof payload.numberOfMentors === 'number' ? payload.numberOfMentors : (payload.numberOfMentors ? Number(payload.numberOfMentors) : undefined)
      };
      // Prevent accidentally removing createdAt
      delete updatePayload.createdAt;

      // Translate updatePayload to snake_case for Postgres
      const snakeUpdate = {};
      if (updatePayload.name !== undefined) snakeUpdate.name = updatePayload.name;
      if (updatePayload.email !== undefined) snakeUpdate.email = updatePayload.email;
      if (updatePayload.aadhar !== undefined) snakeUpdate.aadhar = updatePayload.aadhar;
      if (updatePayload.organization !== undefined) snakeUpdate.organization = updatePayload.organization;
      if (updatePayload.designation !== undefined) snakeUpdate.designation = updatePayload.designation;
      if (updatePayload.eventTitle !== undefined) snakeUpdate.event_title = updatePayload.eventTitle;
      if (updatePayload.eventDescription !== undefined) snakeUpdate.event_description = updatePayload.eventDescription;
      if (updatePayload.startDate !== undefined) snakeUpdate.start_date = updatePayload.startDate;
      if (updatePayload.startTime !== undefined) snakeUpdate.start_time = updatePayload.startTime;
      if (updatePayload.endDate !== undefined) snakeUpdate.end_date = updatePayload.endDate;
      if (updatePayload.endTime !== undefined) snakeUpdate.end_time = updatePayload.endTime;
      if (updatePayload.numberOfMentors !== undefined) snakeUpdate.number_of_mentors = updatePayload.numberOfMentors;
      if (updatePayload.authorizedJudges !== undefined) snakeUpdate.authorized_judges = updatePayload.authorizedJudges;
      
      // Hackathon specific fields
      if (updatePayload.hackathonMode !== undefined) snakeUpdate.hackathon_mode = updatePayload.hackathonMode;
      if (updatePayload.venue !== undefined) snakeUpdate.venue = updatePayload.venue;
      if (updatePayload.registrationDeadline !== undefined) snakeUpdate.registration_deadline = updatePayload.registrationDeadline;
      if (updatePayload.eligibility !== undefined) snakeUpdate.eligibility = updatePayload.eligibility;
      if (updatePayload.minTeamSize !== undefined) snakeUpdate.min_team_size = updatePayload.minTeamSize;
      if (updatePayload.maxTeamSize !== undefined) snakeUpdate.max_team_size = updatePayload.maxTeamSize;
      if (updatePayload.maxParticipants !== undefined) snakeUpdate.max_participants = updatePayload.maxParticipants;
      if (updatePayload.themes !== undefined) snakeUpdate.themes = updatePayload.themes;
      if (updatePayload.tracks !== undefined) snakeUpdate.tracks = updatePayload.tracks;
      if (updatePayload.submissionGuidelines !== undefined) snakeUpdate.submission_guidelines = updatePayload.submissionGuidelines;
      if (updatePayload.evaluationCriteria !== undefined) snakeUpdate.evaluation_criteria = updatePayload.evaluationCriteria;
      if (updatePayload.prizeDetails !== undefined) snakeUpdate.prize_details = updatePayload.prizeDetails;
      if (updatePayload.participationCertificates !== undefined) snakeUpdate.participation_certificates = updatePayload.participationCertificates;
      
      // Event specific fields
      if (updatePayload.eventCategory !== undefined) snakeUpdate.event_category = updatePayload.eventCategory;
      if (updatePayload.eventMode !== undefined) snakeUpdate.event_mode = updatePayload.eventMode;
      if (updatePayload.registrationFee !== undefined) snakeUpdate.registration_fee = updatePayload.registrationFee;
      
      if (updatePayload.announcements !== undefined) snakeUpdate.announcements = updatePayload.announcements;
      if (updatePayload.eventCode !== undefined) snakeUpdate.event_code = updatePayload.eventCode;
      if (updatePayload.eventType !== undefined) snakeUpdate.event_type = updatePayload.eventType;

      const { data: updated, error } = await supabaseUpdateWithColumnRetry('events', 'id', id, snakeUpdate);
      if (error) {
        console.error('Supabase update event error', error);
        return res.status(500).json({ error: 'Failed to update event' });
      }
      return res.json({ message: 'Event updated', event: mapEventRow(updated) });
    } else {
      const events = await readEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Event not found' });
      const existing = events[idx];
      const announcements = Array.isArray(payload.announcements) ? payload.announcements : existing.announcements || [];
      const updated = { ...existing, ...payload, id: existing.id, createdAt: existing.createdAt, announcements };
      updated.numberOfMentors = typeof payload.numberOfMentors === 'number' ? payload.numberOfMentors : (Number(payload.numberOfMentors) || updated.numberOfMentors || 0);
      updated.authorizedJudges = Array.isArray(payload.authorizedJudges) ? payload.authorizedJudges : (payload.judgeEmails ? payload.judgeEmails : updated.authorizedJudges || []);
      if (payload.eventCode && String(payload.eventCode).trim()) updated.eventCode = String(payload.eventCode).trim();
      events[idx] = updated;
      await writeEvents(events);
      return res.json({ message: 'Event updated', event: updated });
    }
  } catch (err) {
    console.error('Failed to update event', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (supabaseAdmin) {
      const { data: deleted, error } = await supabaseAdmin.from('events').delete().eq('id', id).select().single();
      if (error) {
        console.error('Supabase delete error', error);
        return res.status(500).json({ error: 'Failed to delete event' });
      }
      return res.json({ message: 'Event deleted', event: mapEventRow(deleted) });
    } else {
      const events = await readEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Event not found' });
      const removed = events.splice(idx, 1)[0];
      await writeEvents(events);
      return res.json({ message: 'Event deleted', event: removed });
    }
  } catch (err) {
    console.error('Failed to delete event', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Validate judge email for an event
app.post('/api/events/:id/validate-judge', async (req, res) => {
  try {
    const id = req.params.id;
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });

    let ev;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('events')
        .select('id, event_code, authorized_judges')
        .or(`id.eq.${id},event_code.eq.${String(id).toUpperCase()}`)
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') { // ignore not found style errors
        // PGRST116/404 mapping differs; handle absent separately
      }
      ev = data ? mapEventRow(data) : null;
    } else {
      const events = await readEvents();
      ev = events.find(e => e.id === id || (e.eventCode && e.eventCode.toUpperCase() === String(id).toUpperCase()));
    }

    if (!ev) return res.status(404).json({ error: 'Event not found' });
    const allowed = Array.isArray(ev.authorizedJudges) ? ev.authorizedJudges.map(a => String(a).toLowerCase()) : [];
    const ok = allowed.length === 0 ? false : allowed.includes(email.toLowerCase());
    if (!ok) return res.status(401).json({ error: 'Not authorized as judge for this event' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Judge validation error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Announcements (create/delete) - stored in events.announcements JSONB when Supabase used
app.post('/api/events/:id/announcements', async (req, res) => {
  try {
    const id = req.params.id;
    const { text, author } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });

    if (supabaseAdmin) {
      // fetch existing announcements, append, update
      const { data: ev, error: fetchErr } = await supabaseAdmin.from('events').select('announcements').eq('id', id).single();
      if (fetchErr) {
        console.error('Supabase fetch event for announcements', fetchErr);
        return res.status(404).json({ error: 'Event not found' });
      }
      const current = Array.isArray(ev.announcements) ? ev.announcements : [];
      const announcement = { id: Date.now().toString(), text, author: author || 'Creator', createdAt: new Date().toISOString() };
      const updated = [...current, announcement];
      const { data: updatedRow, error: updErr } = await supabaseUpdateWithColumnRetry('events', 'id', id, { announcements: updated });
      if (updErr) {
        console.error('Supabase update announcements error', updErr);
        return res.status(500).json({ error: 'Failed to add announcement' });
      }
      return res.status(201).json({ message: 'Announcement added', announcement });
    } else {
      const events = await readEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Event not found' });
      const ev = events[idx];
      const announcement = { id: Date.now().toString(), text, author: author || 'Creator', createdAt: new Date().toISOString() };
      ev.announcements = ev.announcements || [];
      ev.announcements.push(announcement);
      events[idx] = ev;
      await writeEvents(events);
      return res.status(201).json({ message: 'Announcement added', announcement });
    }
  } catch (err) {
    console.error('Failed to create announcement', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/events/:id/announcements/:aid', async (req, res) => {
  try {
    const id = req.params.id;
    const aid = req.params.aid;
    if (supabaseAdmin) {
      // fetch, filter, update
      const { data: ev, error: fetchErr } = await supabaseAdmin.from('events').select('announcements').eq('id', id).single();
      if (fetchErr) {
        console.error('Supabase fetch event for announcements delete', fetchErr);
        return res.status(404).json({ error: 'Event not found' });
      }
      const current = Array.isArray(ev.announcements) ? ev.announcements : [];
      const filtered = current.filter(a => a.id !== aid);
      const { data: updatedRow, error: updErr } = await supabaseUpdateWithColumnRetry('events', 'id', id, { announcements: filtered });
      if (updErr) {
        console.error('Supabase update announcements delete error', updErr);
        return res.status(500).json({ error: 'Failed to delete announcement' });
      }
      return res.json({ message: 'Announcement deleted' });
    } else {
      const events = await readEvents();
      const idx = events.findIndex((e) => e.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Event not found' });
      const ev = events[idx];
      ev.announcements = Array.isArray(ev.announcements) ? ev.announcements.filter(a => a.id !== aid) : [];
      events[idx] = ev;
      await writeEvents(events);
      return res.json({ message: 'Announcement deleted' });
    }
  } catch (err) {
    console.error('Failed to delete announcement', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});