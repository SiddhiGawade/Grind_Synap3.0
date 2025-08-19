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
      // expecting array; backend currently stores file-backed events
      setEvents(Array.isArray(data) ? data : data.events || []);
    } catch (err) {
      setEventsError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFF4]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#151616] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D6F32F] rounded-lg flex items-center justify-center border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616]">
                <Calendar className="w-6 h-6 text-[#151616]" />
              </div>
              <h1 className="text-xl font-black text-[#151616]">SynapHack 3.0</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[#151616]">{user.name}</p>
                <p className="text-xs text-[#151616]/60 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg border-2 border-[#151616] hover:bg-[#D6F32F]/10 transition-colors"
              >
                <LogOut className="w-5 h-5 text-[#151616]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h2 className="text-2xl font-black text-[#151616] mb-2">Event Creator Dashboard 📋</h2>
            <p className="text-[#151616]/70">Manage your events and track participant engagement</p>
          </div>
        </div>

        {/* Stats Cards (dynamic) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Active Events</p>
                <p className="text-3xl font-black text-[#151616]">{events.filter(e => {
                  try {
                    const now = new Date();
                    const s = e.startDate ? new Date(e.startDate) : null;
                    const en = e.endDate ? new Date(e.endDate) : null;
                    if (s && en) return s <= now && now <= en;
                    return false;
                  } catch { return false; }
                }).length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Total Participants</p>
                <p className="text-3xl font-black text-[#151616]">{events.reduce((sum, ev) => sum + (Array.isArray(ev.participants) ? ev.participants.length : 0), 0)}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Total Submissions</p>
                <p className="text-3xl font-black text-[#151616]">{events.reduce((sum, ev) => sum + (Array.isArray(ev.submissions) ? ev.submissions.length : 0), 0)}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Events Created</p>
                <p className="text-3xl font-black text-[#151616]">{events.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Layout: left sidebar for management, right for recent events + performance */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] h-full sticky top-24">
              <h3 className="text-lg font-bold text-[#151616] mb-4">Event Management</h3>
              <div className="space-y-3">
                <button onClick={() => setShowWizard(true)} className="w-full bg-[#D6F32F] p-3 rounded-lg border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:shadow-[1px_1px_0px_0px_#151616] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-medium text-[#151616] flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Event
                </button>
                <button onClick={() => setManageOpen(true)} className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Manage Events
                </button>
                {/* Analytics removed per request */}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
              <h3 className="text-lg font-bold text-[#151616] mb-4">Recent Events</h3>
              <div className="space-y-3">
                {loadingEvents && <p className="text-sm text-[#151616]/70">Loading events...</p>}
                {eventsError && <p className="text-sm text-red-600">{eventsError}</p>}
                {!loadingEvents && events.length === 0 && <p className="text-sm text-[#151616]/70">No events yet. Create one to get started.</p>}
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
                    <div key={ev.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-[#151616]">
                      <h4 className="font-bold text-[#151616]">{ev.eventTitle || '(Untitled Event)'}</h4>
                      <p className="text-sm text-[#151616]/70">{participants} participants • {submissions} submissions</p>
                      <div className="mt-3">
                        {(ev.announcements || []).slice(-3).reverse().map(a => (
                          <div key={a.id} className="text-sm text-[#151616]/80 bg-white/50 p-2 rounded mb-2">
                            <div className="font-medium">{a.text}</div>
                            <div className="text-xs text-[#151616]/60">{a.author} • {new Date(a.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-green-200 text-green-800' : status === 'Upcoming' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{status}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Event Performance */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
              <h3 className="text-lg font-bold text-[#151616] mb-6">Event Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-[#151616]/20">
                  <h4 className="font-bold text-[#151616] mb-2">Most Popular Event</h4>
                  <p className="text-sm text-[#151616]/70 mb-1">{events[0]?.eventTitle || '—'}</p>
                  <p className="text-xl font-black text-green-600">{events.reduce((sum, ev) => sum + (Array.isArray(ev.participants) ? ev.participants.length : 0), 0)} participants</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-[#151616]/20">
                  <h4 className="font-bold text-[#151616] mb-2">Highest Engagement</h4>
                  <p className="text-sm text-[#151616]/70 mb-1">{events[0]?.eventTitle || '—'}</p>
                  <p className="text-xl font-black text-orange-600">{events.length ? Math.round((events.reduce((s, ev) => s + ((Array.isArray(ev.submissions) ? ev.submissions.length : 0)), 0) / (events.length || 1)) * 100) : 0}% completion</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-[#151616]/20">
                  <h4 className="font-bold text-[#151616] mb-2">Best Rated Event</h4>
                  <p className="text-sm text-[#151616]/70 mb-1">{events[0]?.eventTitle || '—'}</p>
                  
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Manage Events</h3>
              <button onClick={() => setManageOpen(false)} className="px-3 py-1 border rounded">Close</button>
            </div>
            <div className="space-y-3">
              {events.length === 0 && <p className="text-sm text-[#151616]/70">No events to manage</p>}
              {events.map((ev) => (
                <div key={ev.id} className="p-3 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{ev.eventTitle || '(Untitled)'}</div>
                      <div className="text-sm text-[#151616]/70">{ev.name} • {ev.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingEvent(ev); setShowWizard(true); setManageOpen(false); }} className="px-3 py-1 bg-[#D6F32F] rounded">Edit</button>
                      <button onClick={async () => {
                        if (!confirm('Delete this event?')) return;
                        try {
                          const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                          const res = await fetch(`${API_BASE}/api/events/${ev.id}`, { method: 'DELETE' });
                          if (!res.ok) throw new Error('Delete failed');
                          await fetchEvents();
                        } catch (err) {
                          alert(err.message || 'Delete failed');
                        }
                      }} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Announcements</div>
                    <div className="space-y-2">
                      {(ev.announcements || []).map(a => (
                        <div key={a.id} className="flex items-start justify-between bg-[#fafafa] p-2 rounded">
                          <div>
                            <div className="text-sm">{a.text}</div>
                            <div className="text-xs text-[#151616]/60">{a.author} • {new Date(a.createdAt).toLocaleString()}</div>
                          </div>
                          <div>
                            <button onClick={async () => {
                              if (!confirm('Delete this announcement?')) return;
                              try {
                                const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                                const res = await fetch(`${API_BASE}/api/events/${ev.id}/announcements/${a.id}`, { method: 'DELETE' });
                                if (!res.ok) throw new Error('Delete failed');
                                await fetchEvents();
                              } catch (err) {
                                alert(err.message || 'Delete failed');
                              }
                            }} className="text-xs text-red-600">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <input placeholder="Write an announcement" id={`ann-${ev.id}`} className="w-full border p-2 rounded" />
                      <div className="mt-2 text-right">
                        <button onClick={async () => {
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
                        }} className="px-3 py-1 bg-[#D6F32F] rounded mt-2">Post</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

  {/* Analytics UI removed */}
    </div>
  );
};

export default CreatorDashboard;