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
function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper: get token
const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

// Auth Provider Component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading=true to prevent flash
  const [initialized, setInitialized] = useState(false);

  // Try to load user from token or supabase session on mount
  useEffect(() => {
    if (initialized) return; // Prevent multiple initialization
    
    (async () => {
      console.log('=== AUTH INITIALIZATION STARTED ===');
      console.log('Current user state:', user);
      console.log('Current loading state:', loading);
      setInitialized(true);
      setLoading(true);
      
      // Always check for token first - this works for both Supabase and backend auth
      const token = getToken();
      console.log('Found token in localStorage:', !!token);
      console.log('Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');
      
      if (token) {
        try {
          console.log('Validating token with backend...');
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Backend response status:', res.status);
          
          if (res.ok) {
            const data = await res.json();
            console.log('Token validation successful, setting user:', data.user);
            setUser(data.user);
            setLoading(false);
            console.log('=== AUTH INITIALIZATION COMPLETED (TOKEN SUCCESS) ===');
            return; // Successfully restored from token, no need to check Supabase
          } else if (res.status === 401) {
            // Token is invalid/expired, remove it
            console.log('Token validation failed (401), removing token');
            localStorage.removeItem('token');
          } else {
            // Other error, might be temporary - keep token but continue to Supabase check
            console.log('Token validation failed with status:', res.status, 'keeping token for now');
          }
        } catch (err) {
          console.error('Failed to fetch user with token (network error):', err);
          // Network error - keep token but continue to Supabase check
          console.log('Network error during token validation, keeping token for now');
        }
      }

      // If no valid token, try Supabase session as fallback
      if (supabaseClient) {
        try {
          console.log('Checking Supabase session...');
          const session = await supabaseClient.auth.getSession();
          const u = session?.data?.session?.user;
          console.log('Supabase session user:', !!u);
          
          if (u) {
            console.log('Found Supabase session, setting user');
            // Map Supabase user to app user shape (use user_metadata if present)
            const meta = u.user_metadata || {};
            const userData = { id: u.id, email: u.email, name: meta.name || '', role: meta.role || 'participant' };
            console.log('Setting user from Supabase:', userData);
            setUser(userData);
            // Store the access token for future API calls
            const token = session?.data?.session?.access_token;
            if (token) {
              console.log('Storing Supabase token in localStorage');
              localStorage.setItem('token', token);
            }
            setLoading(false);
            console.log('=== AUTH INITIALIZATION COMPLETED (SUPABASE SUCCESS) ===');
            return;
          }
        } catch (e) {
          console.warn('Failed to get supabase session', e);
        }
      }

      // No valid session found
      console.log('No valid session found, user remains null');
      setUser(null);
      setLoading(false);
      console.log('=== AUTH INITIALIZATION COMPLETED (NO SESSION) ===');
    })();
  }, [initialized]);

  // Keep supabase session in sync with localStorage so page reloads don't log the user out
  useEffect(() => {
    if (!supabaseClient || !initialized) return;
    
    // subscribe to auth changes and persist access token
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      try {
        console.log('Supabase auth state change:', event, !!session);
        
        // Only handle specific auth events that we want to react to
        if (event === 'SIGNED_IN' && session?.user && !user) {
          // Only set user if we don't already have one (to prevent overriding token-based auth)
          console.log('Auth state: Setting user from SIGNED_IN');
          const u = session.user;
          const meta = u.user_metadata || {};
          setUser({ id: u.id, email: u.email, name: meta.name || '', role: meta.role || 'participant' });
          const token = session?.access_token;
          if (token) localStorage.setItem('token', token);
        } else if (event === 'TOKEN_REFRESHED' && session?.user && user) {
          // Update token on refresh
          console.log('Auth state: Updating token from TOKEN_REFRESHED');
          const token = session?.access_token;
          if (token) localStorage.setItem('token', token);
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth state: Clearing user from SIGNED_OUT');
          localStorage.removeItem('token');
          setUser(null);
        }
        // Ignore INITIAL_SESSION event to prevent overriding token-based auth
      } catch (e) {
        console.warn('Auth state handler failed', e);
      }
    });

    // cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, [initialized, user]); // Include user in dependencies to check current state

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

  const signin = async ({ email, password, role } = {}) => {
    console.log('Sign-in started with role:', role);
    setLoading(true);
    try {
      if (supabaseClient) {
        console.log('Using Supabase authentication');
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

        console.log('Supabase authentication successful');

        // Persist supabase session token so reloads keep user logged in
        try {
          const maybeSession = data?.session || (await supabaseClient.auth.getSession())?.data?.session;
          const token = maybeSession?.access_token || maybeSession?.accessToken || null;
          if (token) {
            console.log('Storing Supabase token in localStorage');
            localStorage.setItem('token', token);
          }
        } catch (e) {
          // ignore
        }

        // Step 2: Validate role with backend if role is specified
        // Use Supabase user data directly - role is read from user_metadata
        const meta = supabaseUser.user_metadata || {};
        console.log('Setting user from Supabase data:', { id: supabaseUser.id, email: supabaseUser.email, name: meta.name, role: meta.role });
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: meta.name || '',
          role: meta.role || 'participant'
        });

        setLoading(false);
        console.log('Sign-in completed successfully');
        return { ok: true };
      }

      // Fallback to backend API (when Supabase not configured)
  const res = await fetch(`${API_BASE}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, role }),
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
    console.log('Logout initiated');
    setLoading(true);
    
    // Supabase sign out if client present
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
        console.log('Supabase sign out successful');
      } catch (e) {
        console.warn('Supabase signOut failed', e);
      }
    }
    
    // Clear local storage and state
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
    console.log('Logout completed');
  };

  // Function to refresh token if needed
  const refreshAuthState = async () => {
    const token = getToken();
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      } else {
        // Token is invalid
        localStorage.removeItem('token');
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Failed to refresh auth state', err);
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signup, 
      signin, 
      logout, 
      loading, 
      setLoading, 
      refreshAuthState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };
