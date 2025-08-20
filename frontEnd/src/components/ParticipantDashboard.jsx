import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Trophy, LogOut, Plus, Edit, Award, Share2, X, Clock, MapPin, Users as UsersIcon, Calendar as CalendarIcon, Info, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';
import EventRegistrationForm from './EventRegistrationForm.jsx';

const ParticipantDashboard = () => {
  const { user, logout } = useAuth();
  const avatarStorageKey = `selectedAvatar:${user?.email || user?.id || 'anon'}`; // Unique key for each user
  const [isProfileFormOpen, setProfileFormOpen] = useState(false);
  const [isTeamFormOpen, setTeamFormOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    try {
      return localStorage.getItem(avatarStorageKey) || null; // Load avatar from localStorage
    } catch {
      return null;
    }
  });
  const [participantDetails, setParticipantDetails] = useState({
    name: user.name,
    institute: '',
    github: '',
    linkedin: '',
    email: '',
    mobile: '',
    tshirtSize: '',
  });
  const [errors, setErrors] = useState({});

  // Placeholder for dynamic data
  const [stats, setStats] = useState({
    xpPoints: 0,
    hackathonsJoined: 0,
    certificatesEarned: 0,
    teamMembers: 0
  });

  // Participant leaderboard removed; visible only to organizers and judges

  const [certificates, setCertificates] = useState([
    // Sample certificates data
    { id: 1, name: 'Hackathon 2023 - Participant', date: '2023-11-15' },
    { id: 2, name: 'Web Development Bootcamp', date: '2023-09-22' }
  ]);

  const [chatMessages] = useState([
    // Sample QnA Discussion messages
    { id: 1, user: 'Alex Johnson', avatar: '/avatars/Avatar-1.jpg', message: 'Hey everyone! Any tips for the upcoming hackathon?', time: '2 min ago', isQuestion: true },
    { id: 2, user: 'Sam Wilson', avatar: '/avatars/Avatar-2.jpg', message: 'Focus on problem-solving and team collaboration!', time: '1 min ago', isQuestion: false },
    { id: 3, user: 'Jordan Lee', avatar: '/avatars/Avatar-3.png', message: 'What tech stack should we use for web development projects?', time: '5 min ago', isQuestion: true },
    { id: 4, user: 'Taylor Smith', avatar: '/avatars/Avatar-4.png', message: 'React + Node.js is a solid choice for most projects', time: '3 min ago', isQuestion: false },
    { id: 5, user: user.name, avatar: selectedAvatar || '/avatars/Avatar-5.png', message: 'Thanks for the advice! Looking forward to participating.', time: 'Just now', isQuestion: false }
  ]);

  // Persist registered events per-user in localStorage so registrations survive page reloads
  const storageKey = `registeredEvents:${user?.email || user?.id || 'anon'}`;
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  // Save registered events to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(registeredEvents));
    } catch (e) {
      // ignore storage errors
    }
  }, [registeredEvents, storageKey]);

  // Try to load registrations from backend (server-side persistence) and merge with localStorage
  useEffect(() => {
    let mounted = true;
    const fetchRegistrations = async () => {
      if (!user || !user.email) return;
      try {
        const url = `/api/registrations?email=${encodeURIComponent(user.email)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch registrations');
        const data = await res.json();
        if (!mounted || !Array.isArray(data)) return;

        const mapped = data.map(r => {
          const id = r.event_id || r.eventId || r.eventCode || r.event_code || `event-${r.id || Date.now()}`;
          const title = r.event_title || r.eventTitle || r.event_code || r.eventCode || `Event ${id}`;
          return {
            id,
            eventTitle: title,
            startDate: r.start_date || r.startDate || '',
            endDate: r.end_date || r.endDate || '',
            registrationDate: r.created_at || r.createdAt || new Date().toISOString(),
            teamInfo: r.team_name ? { teamName: r.team_name } : null,
            status: 'Upcoming'
          };
        });

        // Merge with existing local registeredEvents, dedupe by id
        const existing = Array.isArray(registeredEvents) ? registeredEvents : [];
        const mapById = new Map();
        for (const e of existing) mapById.set(String(e.id), e);
        for (const m of mapped) {
          if (!mapById.has(String(m.id))) mapById.set(String(m.id), m);
        }
        const merged = Array.from(mapById.values());
        setRegisteredEvents(merged);
      } catch (err) {
        // ignore - keep localStorage data
        console.warn('Could not load server registrations, using local data', err);
      }
    };
    fetchRegistrations();
    return () => { mounted = false; };
  }, [user]);

  const avatars = [
    '/avatars/Avatar-1.jpg',
    '/avatars/Avatar-2.jpg',
    '/avatars/Avatar-3.png',
    '/avatars/Avatar-4.png',
    '/avatars/Avatar-5.png',
    '/avatars/Avatar-6.png',
    '/avatars/Avatar-7.png',
    '/avatars/Avatar-10.png',
    '/avatars/Avatar-11.png',
    '/avatars/Avatar-12.png'
  ];

  // Events loaded from backend for participants to register
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isRegistrationFormOpen, setRegistrationFormOpen] = useState(false);
  const [isXpInfoModalOpen, setXpInfoModalOpen] = useState(false);

  // Debug: log selectedEvent whenever the registration form opens to inspect its shape
  React.useEffect(() => {
    if (isRegistrationFormOpen && selectedEvent) {
      console.log('Opening registration for selectedEvent:', selectedEvent);
    }
  }, [isRegistrationFormOpen, selectedEvent]);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    eventId: '',
    eventName: '',
    teamName: '',
    githubLink: '',
    projectName: ''
  });

  // Helper function to determine if an event is a team event
  const isTeamEvent = (event) => {
    return event.eventType === 'hackathon' || 
           (event.minTeamSize && event.minTeamSize > 1) || 
           (event.maxTeamSize && event.maxTeamSize > 1);
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Format event type for display
  const formatEventType = (type) => {
    if (!type) return 'General Event';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Render tags from comma-separated string
  const renderTags = (tags) => {
    if (!tags) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {tags.split(',').map((tag, i) => (
          <span 
            key={i}
            className="px-3 py-1 text-sm rounded-full bg-accent text-secondary"
          >
            {tag.trim()}
          </span>
        ))}
      </div>
    );
  };

  // Helper to read event fields from multiple possible shapes (camelCase, snake_case, or _raw)
  const getEventField = (ev, ...keys) => {
    if (!ev) return undefined;
    for (const key of keys) {
      if (key in ev && ev[key] !== undefined && ev[key] !== null) return ev[key];
      // try snake_case
      const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (snake in ev && ev[snake] !== undefined && ev[snake] !== null) return ev[snake];
      // try raw
      if (ev._raw) {
        if (key in ev._raw && ev._raw[key] !== undefined && ev._raw[key] !== null) return ev._raw[key];
        if (snake in ev._raw && ev._raw[snake] !== undefined && ev._raw[snake] !== null) return ev._raw[snake];
      }
    }
    return undefined;
  };

  useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      // Try proxy first, then direct backend as fallback
      const urls = ['/api/events', 'http://localhost:4000/api/events'];
      
      for (const url of urls) {
        try {
          console.log(`Attempting to fetch events from: ${url}`);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            console.log(`Successfully loaded ${data.length} events from ${url}`);
            if (mounted) setEvents(Array.isArray(data) ? data : []);
            return; // Success, exit the loop
          } catch (parseErr) {
            console.error(`Failed to parse response from ${url} as JSON. Response text:`, text);
            throw parseErr;
          }
        } catch (err) {
          console.error(`Error loading events from ${url}:`, err);
          // Continue to next URL
        }
      }
      
      // If all URLs failed
      console.error('Failed to load events from all URLs');
      if (mounted) setEvents([]);
      if (mounted) setEventsLoading(false);
    };
    
    loadEvents().finally(() => {
      if (mounted) setEventsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleEditProfileClick = () => {
    setProfileFormOpen(true);
  };

  const handleCloseProfileForm = () => {
    setProfileFormOpen(false);
  };

  const handleCreateTeamClick = () => {
    setTeamFormOpen(true);
  };

  const handleCloseTeamForm = () => {
    setTeamFormOpen(false);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    try {
      localStorage.setItem(avatarStorageKey, avatar); // Save avatar to localStorage
    } catch {
      console.warn('Failed to save avatar to localStorage');
    }
  };

  useEffect(() => {
    const savedAvatar = localStorage.getItem(avatarStorageKey);
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar); // Restore avatar on component mount
    }
  }, [avatarStorageKey]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile' && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }
    setParticipantDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  // Handle event registration
  const handleEventRegistration = (eventData, teamInfo = null) => {
    // Check if already registered
    const isAlreadyRegistered = registeredEvents.some(
      event => event.id === eventData.id || 
              event.eventTitle === (eventData.eventTitle || eventData.title)
    );

    if (isAlreadyRegistered) {
      alert('You are already registered for this event!');
      setRegistrationFormOpen(false);
      setEventModalOpen(false);
      return;
    }

    const newRegisteredEvent = {
      id: eventData.id || eventData.eventCode || `event-${Date.now()}`,
      eventTitle: eventData.eventTitle || eventData.title || 'Untitled Event',
      startDate: eventData.startDate || eventData.start_date || new Date().toISOString(),
      endDate: eventData.endDate || eventData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      registrationDate: new Date().toISOString(),
      teamInfo: teamInfo || null,
      status: new Date() < new Date(eventData.startDate || eventData.start_date || new Date()) ? 'Upcoming' : 'Active'
    };
    
  setRegisteredEvents(prev => [...prev, newRegisteredEvent]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      hackathonsJoined: prev.hackathonsJoined + 1
    }));
    
    setRegistrationFormOpen(false);
    setEventModalOpen(false);
    
    // Show success message
    alert(`Successfully registered for ${newRegisteredEvent.eventTitle}!`);

    // Persist registration to backend (if available). If it fails, we keep local copy.
    (async () => {
      try {
        const endpointId = eventData.id || eventData.eventCode || newRegisteredEvent.id;
        const res = await fetch(`/api/events/${encodeURIComponent(endpointId)}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrantEmail: user.email, registrantName: user.name, teamName: teamInfo?.teamName || null, registrants: teamInfo?.members || null })
        });
        if (!res.ok) {
          console.warn('Server registration failed', await res.text());
          return;
        }
        const body = await res.json();
        // Optionally update local registration with server ids if returned
        if (Array.isArray(body.registrations) && body.registrations.length > 0) {
          // map server rows to local registered event entries (no change needed for now)
        }
      } catch (err) {
        console.warn('Server registration error', err);
      }
    })();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (participantDetails.mobile && participantDetails.mobile.length !== 10) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits.';
    }
    if (participantDetails.linkedin && !participantDetails.linkedin.startsWith('https://www.linkedin.com')) {
      newErrors.linkedin = 'LinkedIn link must start with "https://www.linkedin.com".';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Saved Details:', participantDetails, 'Selected Avatar:', selectedAvatar);
    setProfileFormOpen(false);
  };

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open the project modal and prefill event id and title
  const handleOpenProjectModal = (eventId, eventTitle) => {
    // Check if user is registered for this event
    const isRegistered = registeredEvents.some(
      event => (event.id === eventId) || 
               (event.eventTitle === eventTitle) ||
               (event.eventId === eventId)
    );
    
    if (!isRegistered) {
      alert('You must register for this event before submitting a project. Please register first.');
      return;
    }
    
    setProjectForm(prev => ({
      ...prev,
      eventId: eventId || prev.eventId || '',
      eventName: eventTitle || prev.eventName || ''
    }));
    setProjectModalOpen(true);
  };
  
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    // Submit project to backend with event id and title
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
    const eventId = projectForm.eventId || selectedEvent?.id || '';
    if (!eventId) {
      alert('Missing event id — cannot submit project. Open the submit modal from the registered event or select an event first.');
      return;
    }

    const payload = {
      teamName: projectForm.teamName,
      submitterName: user?.name || '',
      submitterEmail: user?.email || '',
      link: projectForm.githubLink,
      files: [],
      project_name: projectForm.projectName,
      event_title: projectForm.eventName || selectedEvent?.eventTitle || selectedEvent?.title || ''
    };

    const url = `${apiBase.replace(/\/$/, '')}/api/events/${encodeURIComponent(eventId)}/submissions`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }
      const data = await res.json();
      console.log('Submission response:', data);
      alert('Project submitted successfully!');
      setProjectModalOpen(false);
      setProjectForm({ eventId: '', eventName: '', teamName: '', githubLink: '', projectName: '' });
    } catch (err) {
      console.error('Failed to submit project', err);
      alert('Failed to submit project: ' + (err.message || err));
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
  }, []);

  return (
    <>
      <style>{`
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
        .btn-primary:hover { box-shadow: 1px 1px 0px 0px var(--shadow-color); }
        .btn-secondary { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color); }
        .btn-secondary:hover { background-color: var(--bg-secondary); }
        .dashboard-card { background-color: var(--bg-secondary); border-color: var(--border-color); box-shadow: 4px 4px 0px 0px var(--shadow-color); }
        .dashboard-card-white { background-color: var(--bg-primary); border-color: var(--border-color); box-shadow: 4px 4px 0px 0px var(--shadow-color); }
        .modal-overlay { background-color: rgba(0,0,0,0.5); }
        .modal-content { background-color: var(--bg-primary); border-color: var(--border-color); }
        .input-field { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color); }
        .btn-delete { background-color: #ef4444; color: white; }
        .animate-fade-in { animation: fadeIn 0.5s ease-in; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <div className="min-h-screen bg-primary font-sans">
        {/* Header */}
        <header className="dashboard-card-white border-b-2 border-themed sticky top-0 z-40 animate-slide-down" style={{ backgroundColor: 'var(--navbar-bg)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center border-2 border-themed shadow-themed">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <h1 className="text-xl font-black text-primary">Eventure</h1>
              </div>
              <div className="flex items-center gap-4">
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

        {/* XP Information Modal */}
        <AnimatePresence>
          {isXpInfoModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <motion.div 
                className="bg-primary rounded-2xl border-2 border-themed w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center border-2 border-themed shadow-themed">
                        <Trophy className="w-6 h-6 text-secondary" />
                      </div>
                      <h2 className="text-2xl font-bold text-primary">XP Points System</h2>
                    </div>
                    <button 
                      onClick={() => setXpInfoModalOpen(false)}
                      className="p-1 rounded-full hover:bg-secondary transition-colors"
                    >
                      <X className="w-6 h-6 text-primary" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Introduction */}
                    <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                      <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                        <Info className="w-5 h-5 text-accent" />
                        How XP Points Work
                      </h3>
                      <p className="text-primary">
                        Earn XP (Experience Points) by participating in events and hackathons. Your XP determines your position on the leaderboard, which updates dynamically based on your achievements.
                      </p>
                    </div>

                    {/* XP Rewards */}
                    <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                      <h3 className="text-lg font-semibold text-primary mb-4">XP Rewards</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary rounded-lg border border-themed">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-primary">Event Participation</p>
                              <p className="text-sm text-primary opacity-70">Join any event or hackathon</p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-accent">+20 XP</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-primary rounded-lg border border-themed">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-primary">Shortlisted</p>
                              <p className="text-sm text-primary opacity-70">Get shortlisted in an event</p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-accent">+40 XP</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-primary rounded-lg border border-themed">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-primary">Winner</p>
                              <p className="text-sm text-primary opacity-70">Win an event or hackathon</p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-accent">+100 XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard Info */}
                    <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                      <h3 className="text-lg font-semibold text-primary mb-2">Leaderboard</h3>
                      <p className="text-primary mb-3">
                        The leaderboard ranks all participants based on their total XP points and updates in real-time as you earn more points.
                      </p>
                      <div className="flex items-center gap-2 text-primary">
                        <Trophy className="w-5 h-5 text-accent" />
                        <span className="text-sm">Compete with other participants and climb to the top!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Event Details Modal */}
        <AnimatePresence>
          {isEventModalOpen && selectedEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
              <motion.div 
                className="bg-primary rounded-2xl border-2 border-themed w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-primary">
                            {getEventField(selectedEvent, 'eventTitle', 'title', 'name') || 'Event Details'}
                          </h2>
                          <span className="px-3 py-1 text-sm rounded-full bg-accent text-secondary">
                            {formatEventType(getEventField(selectedEvent, 'eventType', 'event_type'))}
                          </span>
                      </div>
                      {getEventField(selectedEvent, 'organization') && (
                        <p className="text-primary/80 flex items-center gap-1">
                          <UsersIcon className="w-4 h-4" />
                          {getEventField(selectedEvent, 'organization')}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => setEventModalOpen(false)}
                      className="p-1 rounded-full hover:bg-secondary transition-colors"
                    >
                      <X className="w-6 h-6 text-primary" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Event Description */}
                    {getEventField(selectedEvent, 'eventDescription', 'event_description') && (
                      <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                        <h3 className="text-lg font-semibold text-primary mb-2">About This Event</h3>
                        <p className="text-primary whitespace-pre-line">{getEventField(selectedEvent, 'eventDescription', 'event_description')}</p>
                      </div>
                    )}

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date & Time */}
                      <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-accent" />
                          When
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-primary/70">Starts</p>
                            <p className="text-primary">
                              {formatDate(getEventField(selectedEvent, 'startDate', 'start_date', 'startTime', 'start_time'))}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary/70">Ends</p>
                            <p className="text-primary">
                              {formatDate(getEventField(selectedEvent, 'endDate', 'end_date', 'endTime', 'end_time'))}
                            </p>
                          </div>
                          {getEventField(selectedEvent, 'registrationDeadline', 'registration_deadline') && (
                            <div className="pt-2 mt-2 border-t border-themed/30">
                              <p className="text-sm font-medium text-primary/70">Registration Deadline</p>
                              <p className="text-primary">{formatDate(getEventField(selectedEvent, 'registrationDeadline', 'registration_deadline'))}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location & Mode */}
                      <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-accent" />
                          Where
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-primary/70">Mode</p>
                            <p className="text-primary capitalize">
                              {getEventField(selectedEvent, 'eventMode', 'event_mode') === 'online' ? 'Online' : 
                               getEventField(selectedEvent, 'eventMode', 'event_mode') === 'offline' ? 'In-Person' : 
                               getEventField(selectedEvent, 'hackathonMode', 'hackathon_mode') === 'online' ? 'Online' :
                               getEventField(selectedEvent, 'hackathonMode', 'hackathon_mode') === 'offline' ? 'In-Person' :
                               'To be announced'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary/70">
                              {selectedEvent.eventMode === 'online' || selectedEvent.hackathonMode === 'online' 
                                ? 'Meeting Link' 
                                : 'Venue'}
                            </p>
                            <p className="text-primary break-words">
                              {getEventField(selectedEvent, 'venue') || getEventField(selectedEvent, 'meetingLink', 'meeting_link') || 'To be announced'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Participation */}
                      <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <UsersIcon className="w-5 h-5 text-accent" />
                          Participation
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-primary/70">Team Size</p>
                              <p className="text-primary">
                              {getEventField(selectedEvent, 'minTeamSize') && getEventField(selectedEvent, 'maxTeamSize') 
                                ? `${getEventField(selectedEvent, 'minTeamSize')} - ${getEventField(selectedEvent, 'maxTeamSize')} members`
                                : getEventField(selectedEvent, 'numberOfParticipants') 
                                  ? `Up to ${getEventField(selectedEvent, 'numberOfParticipants')} participants`
                                  : 'Individual or Team'}
                            </p>
                          </div>
                          {getEventField(selectedEvent, 'maxParticipants') && (
                            <div>
                              <p className="text-sm font-medium text-primary/70">Max Participants</p>
                              <p className="text-primary">{getEventField(selectedEvent, 'maxParticipants')}</p>
                            </div>
                          )}
                          {getEventField(selectedEvent, 'eligibility') && (
                            <div>
                              <p className="text-sm font-medium text-primary/70">Eligibility</p>
                              <p className="text-primary capitalize">
                                {getEventField(selectedEvent, 'eligibility') === 'open' ? 'Open to all' : getEventField(selectedEvent, 'eligibility')}
                              </p>
                            </div>
                          )}
                          {getEventField(selectedEvent, 'registrationFee', 'registration_fee') && (
                            <div>
                              <p className="text-sm font-medium text-primary/70">Registration Fee</p>
                              <p className="text-primary">₹{getEventField(selectedEvent, 'registrationFee', 'registration_fee')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prizes & Certificates */}
                      <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                        <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-accent" />
                          Prizes & Certificates
                        </h3>
                        <div className="space-y-3">
                          {getEventField(selectedEvent, 'prizeDetails') ? (
                            <div>
                              <p className="text-sm font-medium text-primary/70">Prizes</p>
                              <p className="text-primary whitespace-pre-line">{getEventField(selectedEvent, 'prizeDetails')}</p>
                            </div>
                          ) : (
                            <p className="text-primary/70">Prize details coming soon</p>
                          )}
                          
                          <div className="flex items-center gap-2 text-primary">
              {getEventField(selectedEvent, 'participationCertificates', 'participation_certificates') ? (
                              <>
                                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                <span>Participation certificates will be provided</span>
                              </>
                            ) : (
                              <span className="text-primary/70">No participation certificates</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-6">
                      {/* Themes */}
                      {selectedEvent.themes && (
                        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                          <h3 className="font-semibold text-primary mb-3">Themes</h3>
                          {renderTags(selectedEvent.themes)}
                        </div>
                      )}

                      {/* Tracks */}
                      {selectedEvent.tracks && selectedEvent.tracks.length > 0 && (
                        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                          <h3 className="font-semibold text-primary mb-3">Tracks</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedEvent.tracks.map((track, i) => (
                              <span 
                                key={i}
                                className="px-3 py-1 text-sm rounded-full bg-accent/20 text-primary border border-accent"
                              >
                                {track}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Submission Guidelines */}
                      {selectedEvent.submissionGuidelines && (
                        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                          <h3 className="font-semibold text-primary mb-3">Submission Guidelines</h3>
                          <div className="prose prose-sm max-w-none text-primary">
                            {selectedEvent.submissionGuidelines}
                          </div>
                        </div>
                      )}

                      {/* Evaluation Criteria */}
                      {selectedEvent.evaluationCriteria && (
                        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
                          <h3 className="font-semibold text-primary mb-3">Evaluation Criteria</h3>
                          <div className="prose prose-sm max-w-none text-primary">
                            {selectedEvent.evaluationCriteria}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        onClick={() => {
                          setEventModalOpen(false);
                          setRegistrationFormOpen(true);
                        }}
                        className="btn-primary px-6 py-3 rounded-lg border-2 font-medium flex-1 flex items-center justify-center gap-2 text-lg"
                      >
                        <Plus className="w-6 h-6" />
                        Register for this Event
                      </button>
                      <button
                        onClick={() => setEventModalOpen(false)}
                        className="btn-secondary px-6 py-3 rounded-lg border-2 font-medium flex-1 text-lg"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 relative animate-fade-in">
            <div className="bg-secondary p-6 rounded-2xl border-2 border-themed shadow-themed-lg">
              <h2 className="text-2xl font-black text-primary mb-2">Welcome back, {user.name}! 👋</h2>
              <p className="text-primary opacity-70">Ready to participate in amazing hackathons and events?</p>
            </div>
            {/* Circle and Avatar */}
            <div className="absolute top-0 right-4 mt-2 w-16 h-16 bg-primary rounded-full border-2 border-themed shadow-themed flex items-center justify-center">
              {selectedAvatar ? (
                <img src={selectedAvatar} alt="Selected Avatar" className="w-14 h-14 rounded-full" />
              ) : (
                <span className="text-primary text-sm">No Avatar</span>
              )}
            </div>
            <button
              onClick={handleEditProfileClick}
              className="absolute top-20 right-4 bg-primary px-2 py-0 rounded-full border-2 border-themed shadow-themed hover:bg-secondary transition-colors text-sm font-bold text-primary"
            >
              Edit Profile
            </button>
          </div>

          {/* New Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* XP Points */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">XP Points</p>
                  <motion.p
                    className="text-3xl font-black text-primary"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  >
                    {stats.xpPoints}
                  </motion.p>
                </div>
                <Award className="w-8 h-8 text-accent" />
              </div>
            </motion.div>
            {/* Hackathons Joined */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Hackathons Joined</p>
                  <p className="text-3xl font-black text-primary">{stats.hackathonsJoined}</p>
                </div>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </motion.div>
            {/* Certificates Earned */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Certificates Earned</p>
                  <p className="text-3xl font-black text-primary">{stats.certificatesEarned}</p>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </motion.div>
            {/* Team Members */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Team Members</p>
                  <p className="text-3xl font-black text-primary">{stats.teamMembers}</p>
                </div>
                <Users className="w-8 h-8 text-accent" />
              </div>
            </motion.div>
          </div>

          {/* Registered Events */}
          <motion.div
            className="dashboard-card-white p-6 rounded-2xl border-2 border-themed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-lg font-bold text-primary mb-6">Your Registered Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {registeredEvents.length === 0 ? (
                <div className="col-span-full text-center py-6">
                  <p className="text-primary opacity-60">You haven't registered for any events yet.</p>
                  <p className="text-sm text-primary opacity-50 mt-2">Browse events below to get started!</p>
                </div>
              ) : (
                registeredEvents.map((event) => {
                  const eventDate = new Date(event.startDate);
                  const today = new Date();
                  const isUpcoming = today < eventDate;
                  const isActive = today >= new Date(event.startDate) && today <= new Date(event.endDate);
                  const status = isUpcoming ? 'Upcoming' : isActive ? 'Active' : 'Ended';
                  const statusColor = isUpcoming ? 'bg-blue-200 text-blue-800' : 
                                     isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800';
                  const title = event.eventTitle || event.title || event.name || 'Untitled Event';
                  const id = event.id || event.eventId || event.event_code || event.eventCode || '';
                  return (
                    <div key={id || title} className="p-4 bg-secondary rounded-lg border border-themed">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-primary">{title}</h4>
                          <p className="text-sm text-primary opacity-70">{formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
                          <span className={`inline-block px-2 py-1 mt-2 text-xs rounded-full ${statusColor}`}>{status}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => handleOpenProjectModal(id, title)}
                            className="btn-primary px-4 py-2 rounded-lg border-2"
                          >
                            Submit Project
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
               )}
             </div>

             <h3 className="text-lg font-bold text-primary mb-6">Current Events</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {eventsLoading ? (
                 <div className="col-span-3 text-primary opacity-70">Loading events...</div>
               ) : events.length === 0 ? (
                 <div className="col-span-3 text-primary opacity-60">No active events yet.</div>
               ) : (
                events.map((ev) => {
                  const evId = getEventField(ev, 'id', 'event_id') || ev.eventCode || ev.event_code || '';
                  const evTitle = getEventField(ev, 'eventTitle', 'title', 'name') || 'Untitled Event';
                  const isRegistered = registeredEvents.some(
                    event => (event.id === evId) || 
                             (event.eventTitle === evTitle) ||
                             (event.eventId === evId)
                  );
                  
                  return (
                    <div key={evId || evTitle} className="p-4 bg-secondary rounded-lg border border-themed">
                      <h4 className="font-bold text-primary mb-1">{evTitle}</h4>
                      <p className="text-sm text-primary opacity-70 mb-3">{formatDate(getEventField(ev, 'startDate', 'start_date'))} — {formatDate(getEventField(ev, 'endDate', 'end_date'))}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedEvent(ev); setEventModalOpen(true); }}
                          className="btn-secondary px-4 py-2 rounded-lg border-2"
                        >
                          View
                        </button>
                        {isRegistered ? (
                          <button
                            onClick={() => handleOpenProjectModal(evId, evTitle)}
                            className="btn-primary px-4 py-2 rounded-lg border-2"
                          >
                            Submit Project
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedEvent(ev); setEventModalOpen(true); }}
                            className="btn-primary px-4 py-2 rounded-lg border-2"
                          >
                            Register
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
               )}
             </div>
          </motion.div>


          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => setRegistrationFormOpen(true)} className="btn-primary px-4 py-2 rounded-lg w-full">Register for an Event</button>
                <button onClick={() => setProjectModalOpen(true)} className="btn-secondary px-4 py-2 rounded-lg w-full">Submit Project</button>
                <button onClick={() => setProfileFormOpen(true)} className="btn-secondary px-4 py-2 rounded-lg w-full">Edit Profile</button>
=======
          {/* QnA Discussion & Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* QnA Discussion Chat */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-accent" />
                  QnA Discussion 💬
                </h3>
                <span className="text-xs text-primary opacity-60">Live Chat</span>
              </div>
              
              {/* Chat Messages Container */}
              <div className="h-80 overflow-y-auto mb-4 space-y-3 pr-2">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`flex gap-3 ${message.user === user.name ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    {message.user !== user.name && (
                      <img 
                        src={message.avatar} 
                        alt={message.user} 
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                    <div className={`max-w-[75%] ${message.user === user.name ? 'order-first' : ''}`}>
                      <div className={`p-3 rounded-lg border border-themed ${
                        message.user === user.name 
                          ? 'bg-accent text-secondary' 
                          : message.isQuestion 
                            ? 'bg-yellow-100 border-yellow-300' 
                            : 'bg-primary'
                      }`}>
                        {message.user !== user.name && (
                          <p className="text-xs font-medium text-primary opacity-70 mb-1">
                            {message.user}
                            {message.isQuestion && <span className="ml-1 text-yellow-600">❓</span>}
                          </p>
                        )}
                        <p className={`text-sm ${message.user === user.name ? 'text-secondary' : 'text-primary'}`}>
                          {message.message}
                        </p>
                        <p className={`text-xs mt-1 opacity-60 ${message.user === user.name ? 'text-secondary' : 'text-primary'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                    {message.user === user.name && (
                      <img 
                        src={message.avatar} 
                        alt={message.user} 
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or share your thoughts..."
                  className="flex-1 px-3 py-2 text-sm border-2 border-themed rounded-lg bg-primary text-primary focus:outline-none focus:border-accent"
                  disabled
                />
                <button
                  className="p-2 bg-accent text-secondary rounded-lg border-2 border-themed hover:bg-accent/80 transition-colors"
                  disabled
                  title="Chat functionality coming soon"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs text-primary opacity-50 mt-2 text-center">
                💡 Static demo - Full chat functionality coming soon!
              </p>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary">Leaderboard 🏆</h3>
                <button
                  onClick={() => setXpInfoModalOpen(true)}
                  className="p-2 rounded-full hover:bg-secondary transition-colors group"
                  title="Learn about XP points"
                >
                  <Info className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                </button>
              </div>
              <div className="space-y-3">
                {leaderboardData.map((user, index) => (
                  <motion.div
                    key={user.id}
                    className={`flex items-center p-3 rounded-lg border border-themed transition-all ${
                      index < 5 ? 'bg-secondary scale-105' : 'bg-primary'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <span className="font-bold text-lg w-6 text-center text-primary">{user.rank}.</span>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ml-2" />
                    <p className="font-medium text-primary flex-grow ml-3">{user.name}</p>
                    <p className="text-sm text-primary opacity-60">{user.xp} XP</p>
                  </motion.div>
                ))}

              </div>
            </div>
          </div>

          {/* Certificates Section */}
          <motion.div
            className="dashboard-card-white p-6 rounded-2xl border-2 border-themed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3 className="text-lg font-bold text-primary mb-4">Certificates 📜</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <motion.div
                    key={cert.id}
                    className="p-4 bg-secondary rounded-lg border-2 border-themed hover:bg-accent transition-colors"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h4 className="font-bold text-primary mb-1">{cert.name}</h4>
                    <p className="text-sm text-primary opacity-70">Issued: {cert.date}</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-primary opacity-60">No certificates earned yet.</p>
              )}
            </div>
          </motion.div>
        </main>

        {/* Modals */}
        <AnimatePresence>
          {isProfileFormOpen && (
            <motion.div
              className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content p-6 rounded-2xl shadow-lg w-full max-w-2xl border-2 border-themed relative"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <h2 className="text-xl font-bold text-primary mb-4">Edit Participant Profile</h2>
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Avatar Selection */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-primary mb-1">Select Avatar</label>
                      <div className="flex gap-2">
                        {avatars.map((avatar, index) => (
                          <motion.img
                            key={index}
                            src={avatar}
                            alt={`Avatar ${index + 1}`}
                            className={`w-14 h-14 rounded-full cursor-pointer border-2 transition-all ${selectedAvatar === avatar ? 'border-accent scale-110 shadow-lg' : 'border-themed'}`}
                            onClick={() => handleAvatarSelect(avatar)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Name</label>
                      <input type="text" name="name" value={participantDetails.name} onChange={handleInputChange} className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none" />
                    </div>
                    {/* Institute */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Institute</label>
                      <input type="text" name="institute" value={participantDetails.institute} onChange={handleInputChange} className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none" />
                    </div>
                    {/* GitHub Link */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">GitHub Link</label>
                      <input type="url" name="github" value={participantDetails.github} onChange={handleInputChange} className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none" />
                    </div>
                    {/* LinkedIn Link */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">LinkedIn Link</label>
                      <input type="url" name="linkedin" value={participantDetails.linkedin} onChange={handleInputChange} className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none" placeholder="https://www.linkedin.com/your-profile" />
                      {errors.linkedin && (<p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>)}
                    </div>
                    {/* Mobile Number */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Mobile Number</label>
                      <input type="tel" name="mobile" value={participantDetails.mobile} onChange={handleInputChange} className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none" placeholder="Enter 10-digit mobile number" />
                      {errors.mobile && (<p className="text-red-500 text-sm mt-1">{errors.mobile}</p>)}
                    </div>
                    {/* T-shirt Size */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-primary mb-1">T-shirt Size</label>
                      <select name="tshirtSize" value={participantDetails.tshirtSize} onChange={handleInputChange} className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none">
                        <option value="">Select Size</option>
                        <option value="S">Small</option>
                        <option value="M">Medium</option>
                        <option value="L">Large</option>
                        <option value="XL">Extra Large</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  </div>
                  {/* Buttons */}
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={handleCloseProfileForm} className="btn-secondary px-4 py-2 rounded-lg border-2">Cancel</button>
                    <button type="submit" className="btn-primary px-4 py-2 rounded-lg border-2">Save</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          {isTeamFormOpen && (
            <motion.div
              className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content p-6 rounded-2xl shadow-lg w-full max-w-md border-2 border-themed relative"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <h2 className="text-xl font-bold text-primary mb-4">Form a Team</h2>
                <p className="text-primary opacity-70 mb-4">Share this link or invite members via email to form your team.</p>
                
                <div className="space-y-4">
                  {/* Shareable Link */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Shareable Link</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://synaphack.com/team/invite/xyz123"
                        className="input-field flex-grow p-2 border-2 rounded-lg bg-secondary font-mono text-sm"
                      />
                      <button className="btn-primary p-2 rounded-lg border-2">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {/* Email Invite */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Invite via Email</label>
                    <div className="flex items-center gap-2">
                      <input type="email" placeholder="Enter member's email" className="input-field flex-grow p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none" />
                      <button className="btn-primary px-4 py-2 rounded-lg border-2">Send</button>
                    </div>
                  </div>
                </div>
                {/* Close Button */}
                <div className="flex justify-end mt-6">
                  <button type="button" onClick={handleCloseTeamForm} className="btn-secondary px-4 py-2 rounded-lg border-2">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
          {isRegistrationFormOpen && selectedEvent && (
            <EventRegistrationForm 
              event={selectedEvent}
              onClose={() => setRegistrationFormOpen(false)}
              onSubmit={(formData) => {
                // Build registrants array: include the submitter plus any invited emails
                const registrants = [];
                // include the person filling the form
                if (formData.name || formData.email) {
                  registrants.push({ name: formData.name || null, email: (formData.email || '').toLowerCase(), metadata: { phone: formData.phone || null, college: formData.college || null } });
                }
                // include invited emails (no names entered)
                if (Array.isArray(formData.inviteEmails)) {
                  formData.inviteEmails.forEach(e => {
                    if (e && String(e).trim()) registrants.push({ name: null, email: String(e).toLowerCase(), metadata: null });
                  });
                }

                const teamInfo = formData.teamName ? { teamName: formData.teamName, members: registrants } : null;

                // Handle form submission and add to registered events (local UI)
                handleEventRegistration(selectedEvent, teamInfo);
                console.log('Registration form submitted:', formData, ' -> registrants:', registrants);
                // Notify user and close modal
                alert(`Successfully registered for: ${selectedEvent.eventTitle}`);
                setRegistrationFormOpen(false);
              }}
            />
          )}
          {isProjectModalOpen && (
            <motion.div
              className="modal-overlay fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="modal-content p-6 rounded-2xl shadow-lg w-full max-w-2xl border-2 border-themed relative"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <h2 className="text-xl font-bold text-primary mb-4">Submit Your Project</h2>
                <form onSubmit={handleProjectSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Event Name</label>
                      <input
                        type="text"
                        name="eventName"
                        value={projectForm.eventName}
                        onChange={handleProjectInputChange}
                        className="input-field w-full p-2 border-2 rounded-lg bg-secondary font-medium"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Team Name</label>
                      <input
                        type="text"
                        name="teamName"
                        value={projectForm.teamName}
                        onChange={handleProjectInputChange}
                        className="input-field w-full p-2 border-2 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">GitHub Repository Link</label>
                      <input
                        type="url"
                        name="githubLink"
                        value={projectForm.githubLink}
                        onChange={handleProjectInputChange}
                        className="input-field w-full p-2 border-2 rounded-lg"
                        placeholder="https://github.com/username/repository"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Project Name</label>
                      <input
                        type="text"
                        name="projectName"
                        value={projectForm.projectName}
                        onChange={handleProjectInputChange}
                        className="input-field w-full p-2 border-2 rounded-lg h-10"
                        placeholder="Write your project name"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button 
                      type="button" 
                      onClick={() => setProjectModalOpen(false)}
                      className="btn-secondary px-4 py-2 rounded-lg border-2"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary px-4 py-2 rounded-lg border-2"
                    >
                      Submit Project
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ParticipantDashboard;