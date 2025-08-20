import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Trophy, LogOut, Plus, Edit, Trash2, Send, Eye, X } from 'lucide-react';
import CreateEventWizard from './CreateEventWizard.jsx';
import Leaderboard from './Leaderboard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [announcementInputs, setAnnouncementInputs] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedEventForLeaderboard, setSelectedEventForLeaderboard] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  // Normalize announcement item (supports string entries or objects and multiple timestamp keys)
  const normalizeAnnouncement = (a) => {
  if (!a) return { text: '', author: '', createdAt: null, id: null };
  
  // If it's a string that looks like JSON, try to parse it
  if (typeof a === 'string') {
    if (a.startsWith('{') && a.endsWith('}')) {
      try {
        const parsed = JSON.parse(a);
        return {
          text: parsed.text || parsed.message || '',
          author: parsed.author || parsed.by || '',
          createdAt: parsed.createdAt || parsed.created_at || parsed.created || null,
          id: parsed.id || null
        };
      } catch (e) {
        // If parsing fails, treat as plain text
        return { text: a, author: '', createdAt: null, id: null };
      }
    } else {
      // Plain string
      return { text: a, author: '', createdAt: null, id: null };
    }
  }
  
  // If it's already an object
  return {
    text: a.text || a.message || String(a),
    author: a.author || a.by || '',
    createdAt: a.createdAt || a.created_at || a.created || null,
    id: a.id || null
  };
};

  // Safely format announcement date with relative time
  const formatDateSafe = (v) => {
  if (!v) return '';
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return '';
    // Use toLocaleString for a readable date and time
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      
    });
  } catch (e) {
    return '';
  }
};

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to load events');
      }
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      setEventsError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
    fetchEvents();
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          /* Light Theme Colors Only */
          --bg-primary: #F2EDD1;
          --bg-secondary: #F9CB99;
          --bg-accent: #689B8A;
          --text-primary: #280A3E;
          --text-secondary: #F2EDD1;
          --border-color: #280A3E;
          --shadow-color: #280A3E;
          --navbar-bg: rgba(242, 237, 209, 0.94);
        }
        .bg-primary { background-color: var(--bg-primary); }
        .bg-secondary { background-color: var(--bg-secondary); }
        .bg-accent { background-color: var(--bg-accent); }
        .text-primary { color: var(--text-primary); }
        .text-secondary { color: var(--text-secondary); }
        .border-themed { border-color: var(--border-color); }
        .shadow-themed { box-shadow: 2px 2px 0px 0px var(--shadow-color); }
        .shadow-themed-lg { box-shadow: 4px 4px 0px 0px var(--shadow-color); }
        .shadow-themed-xl { box-shadow: 6px 6px 0px 0px var(--shadow-color); }
        .btn-primary { background-color: var(--bg-accent); color: var(--text-secondary); border-color: var(--border-color); box-shadow: 2px 2px 0px 0px var(--shadow-color); }
        .btn-primary:hover { box-shadow: 1px 1px 0px 0px var(--shadow-color);}
        .btn-secondary { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color);}
        .btn-secondary:hover { background-color: var(--bg-secondary); }
        .dashboard-card { background-color: var(--bg-secondary); border-color: var(--border-color); box-shadow: 4px 4px 0px 0px var(--shadow-color);}
        .dashboard-card-white { background-color: var(--bg-primary); border-color: var(--border-color); box-shadow: 4px 4px 0px 0px var(--shadow-color);}
        .modal-overlay { background-color: rgba(0,0,0,0.5); }
        .modal-content { background-color: var(--bg-primary); border-color: var(--border-color); }
        .input-field { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color); }
        .btn-delete { background-color: #ef4444; color: white; }
        
        /* Enhanced announcement styles */
        .announcement-card {
          background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(242, 237, 209, 0.8) 100%);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }
        
        .announcement-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(40, 10, 62, 0.1);
        }
        
        .announcement-input:focus {
          background-color: rgba(242, 237, 209, 0.9);
        }
        
        .announcement-meta {
          background: rgba(40, 10, 62, 0.05);
          border-radius: 6px;
          padding: 4px 8px;
        }
      `}</style>

      <div className="min-h-screen transition-colors duration-500 bg-primary">
        {/* Header */}
        <header className="navbar sticky top-0 z-40 border-b-2 backdrop-blur-sm" style={{ backgroundColor: 'var(--navbar-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center border-2 border-themed shadow-themed">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <h1 className="text-xl font-black text-primary">SynapHack 3.0</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">{user.name}</p>
                  <p className="text-xs opacity-60 capitalize text-primary">{user.role}</p>
                </div>
                <button onClick={logout} className="p-2 rounded-lg border-2 border-themed hover:bg-secondary transition-colors">
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
            <div className="bg-secondary p-6 rounded-2xl border-2 border-themed shadow-themed flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-primary mb-2">Event Creator Dashboard 📋</h2>
                <p className="text-primary opacity-80">Manage your events and track participant engagement</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowWizard(true)} className="btn-primary hidden md:inline-flex p-3 rounded-lg border-2 font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Event
                </button>
                <button onClick={() => setManageOpen(true)} className="btn-secondary hidden md:inline-flex p-3 rounded-lg border-2 font-medium flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Manage Events
                </button>
                {/* mobile fallback: small icons */}
                <button onClick={() => setShowWizard(true)} className="btn-primary md:hidden p-2 rounded-lg border-2"><Plus className="w-4 h-4" /></button>
                <button onClick={() => setManageOpen(true)} className="btn-secondary md:hidden p-2 rounded-lg border-2"><Edit className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Active Events</p>
                  <p className="text-3xl font-black text-primary">{events.filter(e => {
                    try {
                      const now = new Date();
                      const s = e.startDate ? new Date(e.startDate) : null;
                      const en = e.endDate ? new Date(e.endDate) : null;
                      if (s && en) return s <= now && now <= en;
                      return false;
                    } catch { return false; }
                  }).length}</p>
                </div>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Total Participants</p>
                  <p className="text-3xl font-black text-primary">{events.reduce((sum, ev) => sum + (Array.isArray(ev.participants) ? ev.participants.length : 0), 0)}</p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Total Submissions</p>
                  <p className="text-3xl font-black text-primary">{events.reduce((sum, ev) => sum + (Array.isArray(ev.submissions) ? ev.submissions.length : 0), 0)}</p>
                </div>
                <FileText className="w-8 h-8 text-accent" />
              </div>
            </div>
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Events Created</p>
                  <p className="text-3xl font-black text-primary">{events.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </div>
          </div>

          {/* Recent Events & Performance */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="space-y-6">
              {/* Recent Events */}
              <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
                <h3 className="text-lg font-bold text-primary mb-4">Recent Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loadingEvents && <p className="text-sm text-primary opacity-70">Loading events...</p>}
                  {eventsError && <p className="text-sm text-red-600">{eventsError}</p>}
                  {!loadingEvents && events.length === 0 && <p className="text-sm text-primary opacity-70">No events yet. Create one to get started.</p>}
                  {!loadingEvents && events.slice().reverse().slice(0,5).map((ev) => {
                    const start = ev.startDate ? new Date(ev.startDate) : (ev.start_date ? new Date(ev.start_date) : null);
                    const end = ev.endDate ? new Date(ev.endDate) : (ev.end_date ? new Date(ev.end_date) : null);
                    const now = new Date();
                    const status = start && end ? (now < start ? 'Upcoming' : now > end ? 'Ended' : 'Active') : 'Active';
                    const participants = Array.isArray(ev.participants) ? ev.participants.length : 0;
                    const submissions = Array.isArray(ev.submissions) ? ev.submissions.length : 0;
                    return (
                      <div key={ev.id || ev.eventCode || ev.event_code} className={`rounded-lg border-2 border-themed overflow-hidden ${status === 'Ended' ? 'bg-gray-100 opacity-75' : 'bg-secondary'}`}>
                        <div className="w-full h-40 bg-gray-100 overflow-hidden">
                          <img src={ev.image_url || ev.imageUrl || ''} alt={ev.eventTitle || ev.title || 'Event image'} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>

                        <div className="p-4 relative">
                          <div className="absolute top-2 right-2">
                            <button onClick={async () => { if (!confirm('Delete this event?')) return; try { const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'; const res = await fetch(`${API_BASE}/api/events/${ev.id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Delete failed'); await fetchEvents(); } catch (err) { alert(err.message || 'Delete failed'); } }} className="p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete Event">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <h4 className="font-bold text-primary pr-8">{ev.eventTitle || ev.title || ev.name || 'Untitled Event'}</h4>
                          {ev.eventDescription && <p className="text-primary opacity-70 text-sm mb-2">{ev.eventDescription}</p>}
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${status === 'Ended' ? 'bg-gray-200 text-gray-800' : status === 'Upcoming' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{status}</span>
                            <span className="text-xs text-primary opacity-60">{start ? start.toLocaleDateString() : 'TBA'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-primary opacity-60">Code: {ev.eventCode || ev.event_code}</span>
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingEvent(ev); setShowWizard(true); }} className="btn-primary px-3 py-1.5 rounded-lg border-2 text-xs font-medium cursor-pointer">Edit</button>
                              <button onClick={() => { setSelectedEventForLeaderboard(ev); setShowLeaderboard(true); }} className="btn-primary text-white px-3 py-1.5 rounded-lg border-2 text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1 cursor-pointer">
                                <Eye className="w-3 h-3" />
                                Review Result
                              </button>
                            </div>
                          </div>

                          {/* Announcements preview */}
                          <div className="mt-3">
                            {(ev.announcements || []).slice(-3).reverse().map((raw, idx) => {
                              const a = normalizeAnnouncement(raw);
                              return (
                                <div key={a.id || idx} className="announcement-item text-sm text-primary p-2 rounded mb-2">
                                  <div className="font-medium">{a.text}</div>
                                  <div className="text-xs text-primary opacity-60">{formatDateSafe(a.createdAt) || ''}</div>
                                </div>
                              );
                            })}
                            {(!ev.announcements || ev.announcements.length === 0) && (
                              <div className="text-xs text-primary opacity-50 italic text-center py-2">No announcements yet</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
                
              {/* Event Performance */}
              <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
                <h3 className="text-lg font-bold text-primary mb-6">Event Performance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-accent p-4 rounded-lg border border-themed">
                    <h4 className="font-bold text-secondary mb-2">Most Popular Event</h4>
                    <p className="text-sm text-secondary opacity-70 mb-1">{events[0]?.eventTitle || '—'}</p>
                    <p className="text-xl font-black text-secondary">
                      {events.reduce((sum, ev) =>
                        sum + (Array.isArray(ev.participants) ? ev.participants.length : 0),
                        0
                      )} participants
                    </p>
                  </div>
                  <div className="bg-secondary p-4 rounded-lg border border-themed">
                    <h4 className="font-bold text-primary mb-2">Highest Engagement</h4>
                    <p className="text-sm text-primary opacity-70 mb-1">{events[0]?.eventTitle || '—'}</p>
                    <p className="text-xl font-black text-accent">
                      {events.length ? Math.round(
                        (events.reduce((s, ev) => s + ((Array.isArray(ev.submissions) ? ev.submissions.length : 0)), 0) / (events.length || 1)) * 100
                      ) : 0}% completion
                    </p>
                  </div>
                  <div className="bg-primary p-4 rounded-lg border border-themed">
                    <h4 className="font-bold text-primary mb-2">Best Rated Event</h4>
                    <p className="text-sm text-primary opacity-70 mb-1">{events[0]?.eventTitle || '—'}</p>
                    <p className="text-xl font-black text-accent">—</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Event creation wizard modal */}
        {showWizard && (
          <CreateEventWizard
            onClose={() => setShowWizard(false)}
            prefill={{ name: user?.name || '', email: user?.email || '' }}
            event={editingEvent}
            onCreated={() => { fetchEvents(); setEditingEvent(null); }}
          />
        )}

        {/* Leaderboard modal */}
        {showLeaderboard && selectedEventForLeaderboard && (
          <Leaderboard
            event={selectedEventForLeaderboard}
            onClose={() => {
              setShowLeaderboard(false);
              setSelectedEventForLeaderboard(null);
            }}
          />
        )}

        {/* Manage events modal */}
        {manageOpen && (
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="modal-content w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border-2 border-themed shadow-themed-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Manage Events</h3>
                <button onClick={() => setManageOpen(false)} className="btn-secondary px-3 py-1 border rounded">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.length === 0 && (
                  <p className="text-sm text-primary opacity-70">No events to manage</p>
                )}

                {events.map((ev) => {
                  const start = ev.startDate ? new Date(ev.startDate) : (ev.start_date ? new Date(ev.start_date) : null);
                  const end = ev.endDate ? new Date(ev.endDate) : (ev.end_date ? new Date(ev.end_date) : null);
                  const now = new Date();
                  const status = start && end ? (now < start ? 'Upcoming' : now > end ? 'Ended' : 'Active') : 'Active';

                  return (
                    <div
                      key={ev.id || ev.eventCode || ev.event_code}
                      className={`rounded-lg border-2 border-themed overflow-hidden ${status === 'Ended' ? 'bg-gray-100 opacity-75' : 'bg-secondary'}`}
                    >
                      <div className="w-full h-40 bg-gray-100 overflow-hidden">
                        <img
                          src={ev.image_url || ev.imageUrl || ''}
                          alt={ev.eventTitle || ev.title || 'Event image'}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>

                      <div className="p-4 relative">
                        <div className="absolute top-2 right-2">
                          <button onClick={async () => { if (!confirm('Delete this event?')) return; try { const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'; const res = await fetch(`${API_BASE}/api/events/${ev.id}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Delete failed'); await fetchEvents(); } catch (err) { alert(err.message || 'Delete failed'); } }} className="p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete Event">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mb-2 pr-8">
                          <div>
                            <div className="font-semibold text-primary">{ev.eventTitle || '(Untitled)'}</div>
                            <div className="text-sm text-primary opacity-70">{ev.name} • {ev.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingEvent(ev); setShowWizard(true); setManageOpen(false); }}
                              className="btn-primary px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                            <button onClick={() => { setSelectedEventForLeaderboard(ev); setShowLeaderboard(true); }} className="bg-blue-500 text-white px-3 py-1 rounded border-2 text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Review Result
                            </button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="text-sm font-medium mb-3 text-primary">Announcements</div>

                          <div className="space-y-3">
                            {(ev.announcements || []).map((raw, index) => {
                              const a = normalizeAnnouncement(raw);
                              return (
                                <div key={a.id || index} className="announcement-item border-l-4 border-accent bg-white/30 backdrop-blur-sm rounded-r-lg p-3 shadow-sm">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="bg-white/50 rounded-lg p-2 mb-2">
                                        <p className="text-primary font-medium leading-relaxed">{a.text}</p>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1 text-primary/70">
                                          <Calendar className="w-3 h-3" />
                                          {formatDateSafe(a.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {(!ev.announcements || ev.announcements.length === 0) && (
                              <div className="text-center py-8">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <FileText className="w-6 h-6 text-primary/40" />
                                </div>
                                <p className="text-sm text-primary/50">No announcements yet</p>
                                <p className="text-xs text-primary/40">Create your first announcement below</p>
                              </div>
                            )}
                          </div>

                          {/* Announcement input unchanged */}
                          <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                            <div className="text-sm font-medium mb-3 text-primary flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add New Announcement
                            </div>

                            <div className="space-y-3">
                              <textarea
                                placeholder="Share updates, important information, or reminders with participants..."
                                value={announcementInputs[ev.id] || ''}
                                onChange={(e) => setAnnouncementInputs(prev => ({ ...prev, [ev.id]: e.target.value }))}
                                className="input-field w-full border-2 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent announcement-input"
                                rows="3"
                              />

                              <div className="flex items-center justify-between">
                                <div className="text-xs text-primary/60">{(announcementInputs[ev.id] || '').length}/500 characters</div>
                                <button
                                  onClick={async () => {
                                    const text = (announcementInputs[ev.id] || '').trim();
                                    if (!text) return alert('Please enter announcement text');
                                    if (text.length > 500) return alert('Announcement too long (max 500 characters)');
                                    try {
                                      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                                      const res = await fetch(`${API_BASE}/api/events/${ev.id}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, author: user.name }) });
                                      if (!res.ok) { const errText = await res.text().catch(() => 'Failed to post announcement'); throw new Error(errText || 'Failed to post announcement'); }
                                      setAnnouncementInputs(prev => ({ ...prev, [ev.id]: '' }));
                                      await fetchEvents();
                                    } catch (err) {
                                      alert(err.message || 'Failed to post announcement');
                                    }
                                  }}
                                  disabled={!(announcementInputs[ev.id] || '').trim()}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${ (announcementInputs[ev.id] || '').trim() ? 'btn-primary shadow-themed hover:shadow-themed-lg' : 'bg-primary/20 text-primary/40 cursor-not-allowed' }`}
                                >
                                  <Send className="w-4 h-4" />
                                  Post Announcement
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreatorDashboard;
