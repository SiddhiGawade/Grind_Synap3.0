import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Trophy, BarChart3, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EvaluateCandidates from './EvaluateCandidates.jsx';

const JudgeDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [eventAccessKey, setEventAccessKey] = useState('');
  const [showEvaluatePage, setShowEvaluatePage] = useState(false);
  const [currentEventKey, setCurrentEventKey] = useState('');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [assignedSubmissions, setAssignedSubmissions] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  // Apply theme to root element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Handle event access key submission
  const handleEventAccessSubmit = async (e) => {
    e.preventDefault();
    const key = (eventAccessKey || '').trim();
    if (!key) return alert('Please enter an event access key');

    try {
      // Validate event exists and judge authorization using backend endpoint
      const validateRes = await fetch(`/api/events/${encodeURIComponent(key)}/validate-judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email || '' })
      });

      if (validateRes.status === 404) return alert('Event not found for the provided access key');
      if (validateRes.status === 401) return alert('You are not authorized as a judge for this event');
      if (!validateRes.ok) {
        const txt = await validateRes.text().catch(() => 'Unknown error');
        return alert('Failed to validate access key: ' + txt);
      }

      // Validation passed — fetch event details from events list and submissions for that event
      const eventsRes = await fetch('/api/events');
      if (!eventsRes.ok) throw new Error('Failed to load events');
      const events = await eventsRes.json();
      // find by id or eventCode (case-insensitive)
      const found = (events || []).find(ev => {
        if (!ev) return false;
        const id = ev.id || ev.eventId || ev.event_code || ev.eventCode;
        const code = ev.eventCode || ev.event_code || ev.eventCode;
        return String(id) === key || String(id || '').toLowerCase() === key.toLowerCase() || String(code || '').toLowerCase() === key.toLowerCase();
      });

      if (!found) return alert('Event found during validation but failed to load full event details');

      // fetch submissions for this event
      const eventId = found.id || found.eventId || found.event_code || found.eventCode || key;
      const subsRes = await fetch(`/api/submissions?eventId=${encodeURIComponent(eventId)}`);
      if (!subsRes.ok) throw new Error('Failed to load submissions');
      const subs = await subsRes.json();

      setCurrentEvent(found);
      setSubmissions(Array.isArray(subs) ? subs : []);
      setCurrentEventKey(key);
      setShowEvaluatePage(true);
      setEventAccessKey('');
    } catch (err) {
      console.error('Judge access error', err);
      alert('Could not validate access key: ' + (err.message || err));
    }
  };

  // Handle back navigation from Evaluate Candidates page
  const handleBackToDashboard = () => {
    setShowEvaluatePage(false);
    setCurrentEventKey('');
  };

  // Load events & submissions for this judge
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user?.email) return;
      setLoadingAssigned(true);
      try {
        const [evRes, subRes] = await Promise.all([fetch('/api/events'), fetch('/api/submissions')]);
        if (!evRes.ok || !subRes.ok) {
          setAssignedEvents([]);
          setAssignedSubmissions([]);
          setLoadingAssigned(false);
          return;
        }
        const events = await evRes.json();
        const subs = await subRes.json();
        const email = (user.email || '').toLowerCase();
        const assigned = (events || []).filter(ev => Array.isArray(ev.authorizedJudges) && ev.authorizedJudges.map(a => String(a).toLowerCase()).includes(email));
        const assignedIds = new Set(assigned.map(e => e.id || e.eventCode || e.event_code));
        const assignedSubs = (subs || []).filter(s => assignedIds.has(s.event_id) || assignedIds.has(s.eventId) || assignedIds.has(s.event_code) || assignedIds.has(s.eventCode) || assignedIds.has(s.event));
        if (!mounted) return;
        setAssignedEvents(assigned);
        setAssignedSubmissions(Array.isArray(assignedSubs) ? assignedSubs : []);
      } catch (err) {
        console.error('Failed to load judge assignments', err);
        if (mounted) {
          setAssignedEvents([]);
          setAssignedSubmissions([]);
        }
      } finally {
        if (mounted) setLoadingAssigned(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  const handleOpenEvaluateForEvent = (ev) => {
    // open EvaluateCandidates for this event
    const eventId = ev.id || ev.eventCode || ev.event_code;
    const subs = assignedSubmissions.filter(s => (s.event_id === eventId) || (s.eventId === eventId) || (s.event_code === eventId) || (s.eventCode === eventId) || (s.event === eventId));
    setCurrentEvent(ev);
    setSubmissions(subs || []);
    setShowEvaluatePage(true);
  };

  // Conditional rendering based on current page
  if (showEvaluatePage) {
    return (
      <EvaluateCandidates 
        onBack={handleBackToDashboard}
  eventAccessKey={currentEventKey}
  event={currentEvent}
  submissions={submissions}
      />
    );
  }

  return (
    <>
      {/* CSS Variables */}
      <style jsx global>{`
        :root {
          /* Light Theme Colors */
          --light-bg-primary: #F2EDD1;     /* Light cream */
          --light-bg-secondary: #F9CB99;   /* Peach */
          --light-bg-accent: #689B8A;      /* Sage green */
          --light-text-primary: #280A3E;   /* Deep purple */
          --light-text-secondary: #F2EDD1; /* Light cream for contrast */
          --light-border: #280A3E;         /* Deep purple */
          --light-shadow: #280A3E;         /* Deep purple */
          --light-navbar-bg: rgba(242, 237, 209, 0.94); /* Light cream with transparency */
          
          /* Dark Theme Colors */
          --dark-bg-primary: #222831;      /* Dark gray - main background */
          --dark-bg-secondary: #31363F;    /* Medium gray - secondary backgrounds */
          --dark-bg-accent: #76ABAE;       /* Teal blue - accent elements */
          --dark-text-primary: #EEEEEE;    /* Light gray - main text */
          --dark-text-secondary: #222831;  /* Dark gray for contrast text on light backgrounds */
          --dark-border: #76ABAE;          /* Teal blue for borders */
          --dark-shadow: #31363F;          /* Medium gray for shadows */
          --dark-navbar-bg: rgba(49, 54, 63, 0.94); /* Medium gray with transparency */
        }

        .light-theme {
          --bg-primary: var(--light-bg-primary);
          --bg-secondary: var(--light-bg-secondary);
          --bg-accent: var(--light-bg-accent);
          --text-primary: var(--light-text-primary);
          --text-secondary: var(--light-text-secondary);
          --border-color: var(--light-border);
          --shadow-color: var(--light-shadow);
          --navbar-bg: var(--light-navbar-bg);
        }

        .dark-theme {
          --bg-primary: var(--dark-bg-primary);
          --bg-secondary: var(--dark-bg-secondary);
          --bg-accent: var(--dark-bg-accent);
          --text-primary: var(--dark-text-primary);
          --text-secondary: var(--dark-text-secondary);
          --border-color: var(--dark-border);
          --shadow-color: var(--dark-shadow);
          --navbar-bg: var(--dark-navbar-bg);
        }

        /* Utility Classes */
        .bg-primary { background-color: var(--bg-primary); }
        .bg-secondary { background-color: var(--bg-secondary); }
        .bg-accent { background-color: var(--bg-accent); }
        .text-primary { color: var(--text-primary); }
        .text-secondary { color: var(--text-secondary); }
        .text-accent { color: var(--bg-accent); }
        .border-themed { border-color: var(--border-color); }
        .shadow-themed { box-shadow: 2px 2px 0px 0px var(--shadow-color); }
        .shadow-themed-lg { box-shadow: 4px 4px 0px 0px var(--shadow-color); }
        .shadow-themed-xl { box-shadow: 6px 6px 0px 0px var(--shadow-color); }

        /* Component-specific styles */
        .navbar {
          background-color: var(--navbar-bg);
          border-bottom-color: var(--border-color);
        }

        .dashboard-card {
          background-color: var(--bg-secondary);
          border-color: var(--border-color);
          box-shadow: 4px 4px 0px 0px var(--shadow-color);
        }

        .dashboard-card-white {
          background-color: var(--bg-primary);
          border-color: var(--border-color);
          box-shadow: 4px 4px 0px 0px var(--shadow-color);
        }

        .btn-primary {
          background-color: var(--bg-accent);
          color: var(--text-secondary);
          border-color: var(--border-color);
          box-shadow: 2px 2px 0px 0px var(--shadow-color);
        }

        .btn-primary:hover {
          box-shadow: 1px 1px 0px 0px var(--shadow-color);
        }

        .btn-secondary {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .btn-secondary:hover {
          background-color: var(--bg-secondary);
        }

        .welcome-banner {
          background-color: var(--bg-accent);
        }

        .pending-item-urgent {
          background-color: #FEE2E2;
        }

        .pending-item-soon {
          background-color: #DBEAFE;
        }

        .pending-item-new {
          background-color: #D1FAE5;
        }

        .stats-card-blue {
          background-color: var(--bg-secondary);
        }

        .stats-card-green {
          background-color: var(--bg-accent);
        }

        .stats-card-purple {
          background-color: var(--bg-secondary);
        }

        .recent-eval-item {
          background-color: var(--bg-primary);
          border-color: var(--border-color);
        }

        .theme-toggle {
          background-color: var(--bg-secondary);
        }
      `}</style>

      <div className="min-h-screen transition-colors duration-500 bg-primary">
        {/* Header */}
        <header className="navbar sticky top-0 z-40 border-b-2 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center border-2 border-themed shadow-themed">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <h1 className="text-xl font-black text-primary">SynapHack 3.0</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="theme-toggle p-2 rounded-lg border-2 border-themed transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-accent" />
                  ) : (
                    <Moon className="w-5 h-5 text-primary" />
                  )}
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{user.name}</p>
                  <p className="text-xs opacity-60 capitalize text-primary">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg border-2 border-themed hover:bg-secondary transition-colors"
                >
                  <LogOut className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="welcome-banner p-6 rounded-2xl border-2 border-themed shadow-themed-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-secondary mb-2">Judge Dashboard ⚖️</h2>
                  <p className="text-secondary opacity-80">Review submissions and provide valuable feedback to participants</p>
                </div>
                
                <div className="lg:w-80">
                  <form onSubmit={handleEventAccessSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={eventAccessKey}
                      onChange={(e) => setEventAccessKey(e.target.value)}
                      placeholder="Enter Event Access Key"
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-themed bg-primary text-primary placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    />
                    <button
                      type="submit"
                      className="btn-primary px-4 py-2 rounded-lg border-2 transition-all font-medium whitespace-nowrap cursor-pointer"
                    >
                      Enter
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards (dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Assigned Events</p>
                  <p className="text-3xl font-black text-primary">{assignedEvents.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </div>

            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Pending Reviews</p>
                  <p className="text-3xl font-black text-primary">{assignedSubmissions.length}</p>
                </div>
                <FileText className="w-8 h-8 text-accent" />
              </div>
            </div>

            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Completed Reviews</p>
                  <p className="text-3xl font-black text-primary">{/* derivable from submissions with scores; placeholder */}0</p>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </div>

            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Average Score</p>
                  <p className="text-3xl font-black text-primary">-</p>
                </div>
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
            </div>
          </div>

          {/* Judging Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <h3 className="text-lg font-bold text-primary mb-4">Judging Tasks</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-primary opacity-70 mb-2">Assigned Events</p>
                  {loadingAssigned ? (
                    <p className="text-sm text-primary">Loading...</p>
                  ) : assignedEvents.length === 0 ? (
                    <p className="text-sm text-primary opacity-60">No events assigned to you</p>
                  ) : (
                    <div className="space-y-2">
                      {assignedEvents.map(ev => (
                        <div key={ev.id || ev.eventCode} className="p-3 bg-secondary rounded-lg border-2 border-themed flex items-center justify-between">
                          <div>
                            <div className="font-bold text-primary">{ev.eventTitle || ev.name || ev.eventCode}</div>
                            <div className="text-xs text-primary opacity-60">Code: {ev.eventCode}</div>
                          </div>
                          <div>
                            <button onClick={() => handleOpenEvaluateForEvent(ev)} className="btn-primary px-3 py-1 rounded-lg border-2">Evaluate</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Removed static stats and recent evaluations; dashboard now shows only dynamic data for assigned events/submissions. */}
        </main>
      </div>
    </>
  );
};

export default JudgeDashboard;
