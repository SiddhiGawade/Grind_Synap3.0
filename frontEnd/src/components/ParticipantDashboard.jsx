import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Trophy, LogOut, Plus, Edit, Award, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { AnimatePresence, motion } from 'framer-motion';

const ParticipantDashboard = () => {
  const { user, logout } = useAuth();
  const [isProfileFormOpen, setProfileFormOpen] = useState(false);
  const [isTeamFormOpen, setTeamFormOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
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
    
  });

  const [leaderboardData, setLeaderboardData] = useState([
    
  ]);

  const [certificates, setCertificates] = useState([
    
  ]);

  const avatars = [
    '/avatars/Avatar-1.jpg',
    '/avatars/Avatar-2.jpg',
    '/avatars/Avatar-3.png',
    '/avatars/Avatar-2.jpg',
  ];

  // Events loaded from backend for participants to register
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile' && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }
    setParticipantDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
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
                <h1 className="text-xl font-black text-primary">SynapHack 3.0</h1>
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

          {/* Current Events */}
          <motion.div
            className="dashboard-card-white p-6 rounded-2xl border-2 border-themed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-lg font-bold text-primary mb-6">Current Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventsLoading ? (
                <div className="col-span-3 text-primary opacity-70">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="col-span-3 text-primary opacity-60">No active events yet.</div>
              ) : (
                events.map((ev) => {
                  // Calculate event status based on dates
                  const today = new Date();
                  const startDate = new Date(ev.startDate);
                  const endDate = new Date(ev.endDate);
                  
                  let eventStatus = 'Active';
                  let statusColor = 'bg-green-200 text-green-800';
                  let timeInfo = '';
                  
                  if (today < startDate) {
                    eventStatus = 'Upcoming';
                    statusColor = 'bg-blue-200 text-blue-800';
                    const daysUntil = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
                    timeInfo = `Starts in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                  } else if (today > endDate) {
                    eventStatus = 'Ended';
                    statusColor = 'bg-gray-200 text-gray-800';
                    timeInfo = 'Event ended';
                  } else {
                    eventStatus = 'Active';
                    statusColor = 'bg-green-200 text-green-800';
                    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                    timeInfo = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
                  }
                  
                  return (
                    <div
                      key={ev.id || ev.eventCode || ev.event_code}
                      className={`p-4 rounded-lg border-2 border-themed ${eventStatus === 'Ended' ? 'bg-gray-100 opacity-75' : 'bg-secondary'}`}
                    >
                      <h4 className="font-bold text-primary">
                        {ev.eventTitle || ev.title || ev.name || 'Untitled Event'}
                      </h4>
                      {ev.eventDescription && (
                        <p className="text-primary opacity-70 text-sm mb-2">{ev.eventDescription}</p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                          {eventStatus}
                        </span>
                        <span className="text-xs text-primary opacity-60">{timeInfo}</span>
                      </div>
                      <div className="text-xs text-primary opacity-50 mb-3">
                        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-primary opacity-60">
                          Code: {ev.eventCode || ev.event_code}
                        </span>
                        <button
                          className="btn-primary px-3 py-1 rounded-lg border-2 text-xs font-medium"
                          disabled={eventStatus === 'Ended'}
                          onClick={() => {
                            // For now, just log the event details
                            console.log('Register for event:', ev);
                            alert(`Registering for: ${ev.eventTitle}\nEvent Code: ${ev.eventCode}`);
                          }}
                        >
                          {eventStatus === 'Ended' ? 'Ended' : 'Register'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>

          {/* Quick Actions & Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Quick Actions */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="btn-primary w-full p-3 rounded-lg border-2 font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Join New Event
                </button>
                <button
                  onClick={handleCreateTeamClick}
                  className="btn-secondary w-full p-3 rounded-lg border-2 font-medium flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Form a Team
                </button>
                <button className="btn-secondary w-full p-3 rounded-lg border-2 font-medium flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Submit Project
                </button>
              </div>
            </motion.div>
            {/* Leaderboard */}
            <motion.div
              className="dashboard-card-white p-6 rounded-2xl border-2 border-themed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-primary mb-4">Leaderboard 🏆</h3>
              <div className="space-y-3">
                {leaderboardData.map((user, index) => (
                  <motion.div
                    key={user.id}
                    className={`flex items-center p-3 rounded-lg border border-themed transition-all ${
                      index < 3 ? 'bg-secondary scale-105' : 'bg-primary'
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
            </motion.div>
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
        </AnimatePresence>
      </div>
    </>
  );
};

export default ParticipantDashboard;
