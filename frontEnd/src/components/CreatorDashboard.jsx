import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Trophy, LogOut, Plus, Edit } from 'lucide-react';
import CreateEventWizard from './CreateEventWizard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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
        .announcement-item { background-color: var(--bg-primary); opacity: 0.9; }
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
                <div className="space-y-3">
                  {loadingEvents && <p className="text-sm text-primary opacity-70">Loading events...</p>}
                  {eventsError && <p className="text-sm text-red-600">{eventsError}</p>}
                  {!loadingEvents && events.length === 0 && <p className="text-sm text-primary opacity-70">No events yet. Create one to get started.</p>}
                  {!loadingEvents && events.slice().reverse().slice(0,5).map((ev) => {
                    const start = ev.startDate ? new Date(ev.startDate) : null;
                    const end = ev.endDate ? new Date(ev.endDate) : null;
                    const now = new Date();
                    let status = 'Upcoming';
                    if (start && end) {
                      if (now < start) status = 'Upcoming';
                      else if (now >= start && now <= end) status = 'Active';
                      else status = 'Completed';
                    }
                    const participants = Array.isArray(ev.participants) ? ev.participants.length : 0;
                    const submissions = Array.isArray(ev.submissions) ? ev.submissions.length : 0;
                    return (
                      <div key={ev.id} className="bg-primary p-4 rounded-lg border-2 border-themed">
                        <h4 className="font-bold text-primary">{ev.eventTitle || '(Untitled Event)'}</h4>
                        <p className="text-sm text-primary opacity-70">{participants} participants • {submissions} submissions</p>
                        <div className="mt-3">
                          {(ev.announcements || []).slice(-3).reverse().map(a => (
                            <div key={a.id} className="announcement-item text-sm text-primary p-2 rounded mb-2">
                              <div className="font-medium">{a.text}</div>
                              <div className="text-xs text-primary opacity-60">{a.author} • {new Date(a.createdAt).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          status === 'Active'
                            ? 'bg-green-200 text-green-800'
                            : status === 'Upcoming'
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>{status}</span>
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

        {/* Manage events modal */}
        {manageOpen && (
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="modal-content w-full max-w-3xl rounded-xl border-2 border-themed shadow-themed-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Manage Events</h3>
                <button onClick={() => setManageOpen(false)} className="btn-secondary px-3 py-1 border rounded">Close</button>
              </div>
              <div className="space-y-3">
                {events.length === 0 && <p className="text-sm text-primary opacity-70">No events to manage</p>}
                {events.map((ev) => (
                  <div key={ev.id} className="p-3 rounded border border-themed bg-secondary">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-primary">{ev.eventTitle || '(Untitled)'}</div>
                        <div className="text-sm text-primary opacity-70">{ev.name} • {ev.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingEvent(ev); setShowWizard(true); setManageOpen(false); }} className="btn-primary px-3 py-1 rounded">Edit</button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this event?')) return;
                            try {
                              const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                              const res = await fetch(`${API_BASE}/api/events/${ev.id}`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('Delete failed');
                              await fetchEvents();
                            } catch (err) {
                              alert(err.message || 'Delete failed');
                            }
                          }}
                          className="btn-delete px-3 py-1 rounded"
                        >Delete</button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2 text-primary">Announcements</div>
                      <div className="space-y-2">
                        {(ev.announcements || []).map(a => (
                          <div key={a.id} className="announcement-item flex items-start justify-between p-2 rounded">
                            <div>
                              <div className="text-sm text-primary">{a.text}</div>
                              <div className="text-xs text-primary opacity-60">{a.author} • {new Date(a.createdAt).toLocaleString()}</div>
                            </div>
                            <div>
                              <button
                                onClick={async () => {
                                  if (!confirm('Delete this announcement?')) return;
                                  try {
                                    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                                    const res = await fetch(`${API_BASE}/api/events/${ev.id}/announcements/${a.id}`, { method: 'DELETE' });
                                    if (!res.ok) throw new Error('Delete failed');
                                    await fetchEvents();
                                  } catch (err) {
                                    alert(err.message || 'Delete failed');
                                  }
                                }}
                                className="text-xs text-red-600"
                              >Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <input placeholder="Write an announcement" id={`ann-${ev.id}`} className="input-field w-full border-2 p-2 rounded" />
                        <div className="mt-2 text-right">
                          <button
                            onClick={async () => {
                              const el = document.getElementById(`ann-${ev.id}`);
                              if (!el) return;
                              const text = el.value.trim();
                              if (!text) return alert('Enter text');
                              try {
                                const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                                const res = await fetch(`${API_BASE}/api/events/${ev.id}/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, author: user.name }) });
                                if (!res.ok) throw new Error('Add failed');
                                el.value = '';
                                await fetchEvents();
                              } catch (err) {
                                alert(err.message || 'Add failed');
                              }
                            }}
                            className="btn-primary px-3 py-1 rounded mt-2"
                          >Post</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreatorDashboard;
