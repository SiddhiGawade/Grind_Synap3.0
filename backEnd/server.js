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
app.post('/api/upload', async (req, res) => {
  try {
    if (multer) return res.status(400).json({ error: 'Multer upload should handle this request' });
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
  const { email, password, role, eventId } = req.body || {};
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

          // If judge role and eventId provided, validate authorized judges for that event
          if (role === 'judge' && eventId) {
            const events = await readEvents();
            // Look up event by ID or eventCode
            const ev = events.find(e => e.id === String(eventId) || e.eventCode === String(eventId).toUpperCase());
            if (!ev) return res.status(401).json({ error: 'Invalid email or password' });
            const allowed = Array.isArray(ev.authorizedJudges) ? ev.authorizedJudges.map(e => e.toLowerCase()) : [];
            if (!allowed.includes(email.toLowerCase())) return res.status(401).json({ error: 'Invalid email or password' });
          }

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
        // If judge role and eventId provided, validate authorizedJudges
        if (role === 'judge' && eventId) {
          const events = await readEvents();
          // Look up event by ID or eventCode
          const ev = events.find(e => e.id === String(eventId) || e.eventCode === String(eventId).toUpperCase());
          if (!ev) return res.status(401).json({ error: 'Invalid email or password' });
          const allowed = Array.isArray(ev.authorizedJudges) ? ev.authorizedJudges.map(e => e.toLowerCase()) : [];
          if (!allowed.includes(email.toLowerCase())) return res.status(401).json({ error: 'Invalid email or password' });
        }

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

    // If judge role and eventId provided, validate authorized judges for that event
    if (role === 'judge' && eventId) {
      const events = await readEvents();
      // Look up event by ID or eventCode
      const ev = events.find(e => e.id === String(eventId) || e.eventCode === String(eventId).toUpperCase());
      if (!ev) return res.status(401).json({ error: 'Invalid email or password' });
      const allowed = Array.isArray(ev.authorizedJudges) ? ev.authorizedJudges.map(e => e.toLowerCase()) : [];
      if (!allowed.includes(email.toLowerCase())) return res.status(401).json({ error: 'Invalid email or password' });
    }

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
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Return user info from token (no sensitive data)
    return res.json({ user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role } });
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

// Simple events creation endpoint (file-backed fallback). If Supabase is configured,
// you can extend this to insert into a Supabase table instead.
app.post('/api/events', async (req, res) => {
  try {
    const data = req.body || {};
    // Basic validation
    if (!data.eventTitle || !data.name || !data.email) {
      return res.status(400).json({ error: 'Missing required fields: eventTitle, name, email' });
    }

    const events = await readEvents();
    // generate a unique eventCode (try a few times to avoid collision)
    let code = generateEventCode(6);
    const existingCodes = new Set(events.map(e => (e.eventCode || '').toUpperCase()));
    let attempts = 0;
    while (existingCodes.has(code) && attempts < 10) {
      code = generateEventCode(6);
      attempts++;
    }

    const newEvent = {
      id: Date.now().toString(),
      ...data,
      announcements: Array.isArray(data.announcements) ? data.announcements : [],
      // Persist mentor/judge info
      numberOfMentors: typeof data.numberOfMentors === 'number' ? data.numberOfMentors : (Number(data.numberOfMentors) || 0),
      authorizedJudges: Array.isArray(data.authorizedJudges) ? data.authorizedJudges : (Array.isArray(data.judgeEmails) ? data.judgeEmails : []),
      eventCode: (data.eventCode && String(data.eventCode).trim()) ? String(data.eventCode).trim() : code,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    await writeEvents(events);

    return res.status(201).json({ message: 'Event created', event: newEvent });
  } catch (err) {
    console.error('Failed to create event', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await readEvents();
    return res.json(events);
  } catch (err) {
    console.error('Failed to read events', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update an event
app.put('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    const events = await readEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    // Merge fields but keep id and createdAt
    const existing = events[idx];
  // Preserve announcements unless payload explicitly sends announcements
  const announcements = Array.isArray(payload.announcements) ? payload.announcements : existing.announcements || [];
  const updated = { ...existing, ...payload, id: existing.id, createdAt: existing.createdAt, announcements };
  // Normalize mentor/judge fields
  updated.numberOfMentors = typeof payload.numberOfMentors === 'number' ? payload.numberOfMentors : (Number(payload.numberOfMentors) || updated.numberOfMentors || 0);
  updated.authorizedJudges = Array.isArray(payload.authorizedJudges) ? payload.authorizedJudges : (payload.judgeEmails ? payload.judgeEmails : updated.authorizedJudges || []);
  // Preserve existing eventCode unless payload explicitly provides one
  if (payload.eventCode && String(payload.eventCode).trim()) {
    updated.eventCode = String(payload.eventCode).trim();
  } else {
    updated.eventCode = existing.eventCode || existing.eventCode === 0 ? existing.eventCode : existing.eventCode;
  }
    events[idx] = updated;
    await writeEvents(events);
    return res.json({ message: 'Event updated', event: updated });
  } catch (err) {
    console.error('Failed to update event', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Validate judge email for an event - returns 200 if allowed
app.post('/api/events/:id/validate-judge', async (req, res) => {
  try {
    const id = req.params.id;
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const events = await readEvents();
    // Look up event by ID or eventCode
    const ev = events.find(e => e.id === id || e.eventCode === String(id).toUpperCase());
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    const allowed = Array.isArray(ev.authorizedJudges) ? ev.authorizedJudges.map(e => e.toLowerCase()) : [];
    const ok = allowed.length === 0 ? false : allowed.includes(email.toLowerCase());
    if (!ok) return res.status(401).json({ error: 'Not authorized as judge for this event' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Judge validation error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete an event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const events = await readEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    const removed = events.splice(idx, 1)[0];
    await writeEvents(events);
    return res.json({ message: 'Event deleted', event: removed });
  } catch (err) {
    console.error('Failed to delete event', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Announcements: list / create / delete for an event
app.get('/api/events/:id/announcements', async (req, res) => {
  try {
    const id = req.params.id;
    const events = await readEvents();
    const ev = events.find((e) => e.id === id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    return res.json(Array.isArray(ev.announcements) ? ev.announcements : []);
  } catch (err) {
    console.error('Failed to list announcements', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/events/:id/announcements', async (req, res) => {
  try {
    const id = req.params.id;
    const { text, author } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
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
  } catch (err) {
    console.error('Failed to create announcement', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/events/:id/announcements/:aid', async (req, res) => {
  try {
    const id = req.params.id;
    const aid = req.params.aid;
    const events = await readEvents();
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    const ev = events[idx];
    ev.announcements = Array.isArray(ev.announcements) ? ev.announcements.filter(a => a.id !== aid) : [];
    events[idx] = ev;
    await writeEvents(events);
    return res.json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error('Failed to delete announcement', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server listening on http://localhost:${PORT}`);
});
