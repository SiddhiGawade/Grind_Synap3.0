import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Backend base URL (can be overridden with VITE_API_BASE)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Supabase client (optional)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
let supabaseClient = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { 
      auth: { persistSession: true } 
    });
    console.log('Supabase client initialized');
  } catch (e) {
    console.warn('Failed to initialize Supabase client in front-end', e);
    supabaseClient = null;
  }
}

// Auth Context
const AuthContext = React.createContext();

// Custom Hook for Auth
const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Helper: get token
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Try to load user from token or supabase session on mount
  useEffect(() => {
    (async () => {
      if (supabaseClient) {
        try {
          const session = await supabaseClient.auth.getSession();
          const u = session?.data?.session?.user;
          if (u) {
            // Map Supabase user to app user shape (use user_metadata if present)
            const meta = u.user_metadata || {};
            setUser({ id: u.id, email: u.email, name: meta.name || '', role: meta.role || '' });
            return;
          }
        } catch (e) {
          console.warn('Failed to get supabase session', e);
        }
      }

      // Fallback to token-based session
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // invalid token
          localStorage.removeItem('token');
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Failed to fetch user', err);
        setUser(null);
      }
    })();
  }, []);

  const signup = async ({ name, email, password, role }) => {
    setLoading(true);
    try {
      // Try backend signup first (which will create confirmed user in Supabase)
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      const data = await res.json();
      setLoading(false);
      
      if (res.ok) {
        return { ok: true, message: data.message };
      }
      
      // If backend fails, try Supabase client as fallback
      if (supabaseClient) {
        setLoading(true);
        const { data: supabaseData, error } = await supabaseClient.auth.signUp({
          email: email.toLowerCase(),
          password,
          options: { 
            data: { name, role },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          },
        });
        
        setLoading(false);
        if (error) {
          throw new Error(error.message || 'Signup failed');
        }

        const supabaseUser = supabaseData?.user;
        if (supabaseUser && !supabaseUser.email_confirmed_at) {
          return { 
            ok: true, 
            data: supabaseData,
            message: 'Please check your email and click the confirmation link to complete registration.'
          };
        }

        return { ok: true, data: supabaseData };
      }
      
      throw new Error(data.error || 'Signup failed');
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message };
    }
  };

  const signin = async ({ email, password, role, eventId } = {}) => {
    setLoading(true);
    try {
      if (supabaseClient) {
        // Step 1: Authenticate with Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({ 
          email: email.toLowerCase(), 
          password 
        });
        
        if (error) {
          setLoading(false);
          console.error('Supabase auth error:', error);
          
          // Handle specific error cases
          if (error.message?.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the confirmation link before signing in.');
          } else if (error.message?.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password');
          } else {
            throw new Error('Invalid email or password');
          }
        }

        const supabaseUser = data?.user;
        if (!supabaseUser) {
          setLoading(false);
          throw new Error('Invalid email or password');
        }

        // Step 2: Validate role with backend if role is specified
        if (role) {
            try {
            const roleRes = await fetch(`${API_BASE}/api/auth/signin`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password: 'dummy', role, eventId }),
            });

            const roleData = await roleRes.json();
            if (!roleRes.ok || !roleData.success) {
              // Role validation failed - sign out from Supabase
              await supabaseClient.auth.signOut();
              setLoading(false);
              throw new Error('Invalid email or password');
            }

            // Use validated profile data from backend
            setUser({
              id: roleData.user.id,
              email: roleData.user.email,
              name: roleData.user.name,
              role: roleData.user.role
            });
          } catch (roleError) {
            await supabaseClient.auth.signOut();
            setLoading(false);
            throw new Error('Invalid email or password');
          }
        } else {
          // No role validation needed - use Supabase user data
          const meta = supabaseUser.user_metadata || {};
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: meta.name || '',
            role: meta.role || 'participant'
          });
        }

        setLoading(false);
        return { ok: true };
      }

      // Fallback to backend API (when Supabase not configured)
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, role, eventId }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        if (res.status === 401) throw new Error('Invalid email or password');
        throw new Error(data.error || 'Signin failed');
      }
      const { token, user: u } = data;
      if (token) localStorage.setItem('token', token);
      setUser(u);
      return { ok: true };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message };
    }
  };

  const logout = async () => {
    // Supabase sign out if client present
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut failed', e);
      }
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, signin, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
