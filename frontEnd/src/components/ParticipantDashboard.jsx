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
    xpPoints: 1250,
    certificatesEarned: 3,
    hackathonsJoined: 5,
    teamMembers: 3,
  });

  const [leaderboardData, setLeaderboardData] = useState([
    { id: 1, name: 'Ava', xp: 5800, rank: 1, avatar: '/avatars/Avatar-1.jpg' },
    { id: 2, name: 'Liam', xp: 5200, rank: 2, avatar: '/avatars/Avatar-2.jpg' },
    { id: 3, name: 'Mia', xp: 4950, rank: 3, avatar: '/avatars/Avatar-3.png' },
    { id: 4, name: 'Elijah', xp: 4100, rank: 4, avatar: '/avatars/Avatar-2.jpg' },
    { id: 5, name: 'Sophia', xp: 3850, rank: 5, avatar: '/avatars/Avatar-1.jpg' },
  ]);

  const [certificates, setCertificates] = useState([
    { id: 1, name: 'Certificate of Completion: SynapHack 2.0', date: 'Oct 2024' },
    { id: 2, name: 'Top 10 Finisher: Web3 Hackathon', date: 'Sep 2024' },
  ]);

  const avatars = [
    '/avatars/Avatar-1.jpg',
    '/avatars/Avatar-2.jpg',
    '/avatars/Avatar-3.png',
    '/avatars/Avatar-2.jpg',
  ];

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

  return (
    <div className="min-h-screen bg-[#FFFFF4] font-['Inter']">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#151616] sticky top-0 z-40 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D6F32F] rounded-lg flex items-center justify-center border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616]">
                <Trophy className="w-6 h-6 text-[#151616]" />
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
        <div className="mb-8 relative animate-fade-in">
          <div className="bg-gradient-to-r from-[#D6F32F] to-[#D6F32F]/80 p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h2 className="text-2xl font-black text-[#151616] mb-2">Welcome back, {user.name}! 👋</h2>
            <p className="text-[#151616]/70">Ready to participate in amazing hackathons and events?</p>
          </div>
          {/* Circle and Avatar */}
          <div className="absolute top-0 right-4 mt-2 w-16 h-16 bg-white rounded-full border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] flex items-center justify-center">
            {selectedAvatar ? (
              <img src={selectedAvatar} alt="Selected Avatar" className="w-14 h-14 rounded-full" />
            ) : (
              <span className="text-[#151616] text-sm">No Avatar</span>
            )}
          </div>
          <button
            onClick={handleEditProfileClick}
            className="absolute top-20 right-4 bg-white px-2 py-0 rounded-full border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:bg-gray-100 transition-colors text-sm font-bold text-black"
          >
            Edit Profile
          </button>
        </div>

        {/* New Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* XP Points */}
          <motion.div
            className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">XP Points</p>
                <motion.p
                  className="text-3xl font-black text-[#151616]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  {stats.xpPoints}
                </motion.p>
              </div>
              <Award className="w-8 h-8 text-[#D6F32F]" />
            </div>
          </motion.div>
          {/* Hackathons Joined */}
          <motion.div
            className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Hackathons Joined</p>
                <p className="text-3xl font-black text-[#151616]">{stats.hackathonsJoined}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#151616]/60" />
            </div>
          </motion.div>
          {/* Certificates Earned */}
          <motion.div
            className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Certificates Earned</p>
                <p className="text-3xl font-black text-[#151616]">{stats.certificatesEarned}</p>
              </div>
              <Trophy className="w-8 h-8 text-[#151616]/60" />
            </div>
          </motion.div>
          {/* Team Members */}
          <motion.div
            className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Team Members</p>
                <p className="text-3xl font-black text-[#151616]">{stats.teamMembers}</p>
              </div>
              <Users className="w-8 h-8 text-[#151616]/60" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <motion.div
            className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-lg font-bold text-[#151616] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#D6F32F] p-3 rounded-lg border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:shadow-[1px_1px_0px_0px_#151616] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-medium text-[#151616] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Join New Event
              </button>
              <button
                onClick={handleCreateTeamClick}
                className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                Form a Team
              </button>
              <button className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Submit Project
              </button>
            </div>
          </motion.div>
          {/* Leaderboard */}
          <motion.div
            className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-lg font-bold text-[#151616] mb-4">Leaderboard 🏆</h3>
            <div className="space-y-3">
              {leaderboardData.map((user, index) => (
                <motion.div
                  key={user.id}
                  className={`flex items-center p-3 rounded-lg border border-[#151616]/20 transition-all ${
                    index < 3 ? 'bg-yellow-50 scale-105' : 'bg-[#FFFFF4]'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <span className="font-bold text-lg w-6 text-center">{user.rank}.</span>
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ml-2" />
                  <p className="font-medium text-[#151616] flex-grow ml-3">{user.name}</p>
                  <p className="text-sm text-[#151616]/60">{user.xp} XP</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Certificates Section */}
        <motion.div
          className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-[#151616] mb-4">Certificates 📜</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-bold text-[#151616] mb-1">{cert.name}</h4>
                  <p className="text-sm text-[#151616]/70">Issued: {cert.date}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-[#151616]/60">No certificates earned yet.</p>
            )}
          </div>
        </motion.div>

        {/* Current Events */}
        <motion.div
          className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-lg font-bold text-[#151616] mb-6">Current Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-[#151616]">
              <h4 className="font-bold text-[#151616]">AI Innovation Challenge</h4>
              <p className="text-sm text-[#151616]/70 mb-2">Build innovative AI solutions</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Active</span>
                <span className="text-xs text-[#151616]/60">5 days left</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-[#151616]">
              <h4 className="font-bold text-[#151616]">Web3 Hackathon</h4>
              <p className="text-sm text-[#151616]/70 mb-2">Decentralized app development</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Judging</span>
                <span className="text-xs text-[#151616]/60">Results pending</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-[#151616]">
              <h4 className="font-bold text-[#151616]">Mobile App Challenge</h4>
              <p className="text-sm text-[#151616]/70 mb-2">Cross-platform mobile solutions</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Upcoming</span>
                <span className="text-xs text-[#151616]/60">Starts in 3 days</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isProfileFormOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl border-2 border-[#151616] relative"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <h2 className="text-xl font-bold text-[#151616] mb-4">Edit Participant Profile</h2>
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Avatar Selection */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#151616] mb-1">Select Avatar</label>
                    <div className="flex gap-2">
                      {avatars.map((avatar, index) => (
                        <motion.img
                          key={index}
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className={`w-14 h-14 rounded-full cursor-pointer border-2 transition-all ${selectedAvatar === avatar ? 'border-[#D6F32F] scale-110 shadow-lg' : 'border-gray-300'}`}
                          onClick={() => handleAvatarSelect(avatar)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#151616] mb-1">Name</label>
                    <input type="text" name="name" value={participantDetails.name} onChange={handleInputChange} className="w-full p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none" />
                  </div>
                  {/* Institute */}
                  <div>
                    <label className="block text-sm font-medium text-[#151616] mb-1">Institute</label>
                    <input type="text" name="institute" value={participantDetails.institute} onChange={handleInputChange} className="w-full p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none" />
                  </div>
                  {/* GitHub Link */}
                  <div>
                    <label className="block text-sm font-medium text-[#151616] mb-1">GitHub Link</label>
                    <input type="url" name="github" value={participantDetails.github} onChange={handleInputChange} className="w-full p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none" />
                  </div>
                  {/* LinkedIn Link */}
                  <div>
                    <label className="block text-sm font-medium text-[#151616] mb-1">LinkedIn Link</label>
                    <input type="url" name="linkedin" value={participantDetails.linkedin} onChange={handleInputChange} className="w-full p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none" placeholder="https://www.linkedin.com/your-profile" />
                    {errors.linkedin && (<p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>)}
                  </div>
                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-medium text-[#151616] mb-1">Mobile Number</label>
                    <input type="tel" name="mobile" value={participantDetails.mobile} onChange={handleInputChange} className="w-full p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none" placeholder="Enter 10-digit mobile number" />
                    {errors.mobile && (<p className="text-red-500 text-sm mt-1">{errors.mobile}</p>)}
                  </div>
                  {/* T-shirt Size */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#151616] mb-1">T-shirt Size</label>
                    <select name="tshirtSize" value={participantDetails.tshirtSize} onChange={handleInputChange} className="w-full p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none">
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
                  <button type="button" onClick={handleCloseProfileForm} className="px-4 py-2 bg-gray-200 rounded-lg border-2 border-[#151616] hover:bg-gray-300">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-[#D6F32F] rounded-lg border-2 border-[#151616] hover:bg-[#D6F32F]/80">Save</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {isTeamFormOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md border-2 border-[#151616] relative"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <h2 className="text-xl font-bold text-[#151616] mb-4">Form a Team</h2>
              <p className="text-[#151616]/70 mb-4">Share this link or invite members via email to form your team.</p>
              
              <div className="space-y-4">
                {/* Shareable Link */}
                <div>
                  <label className="block text-sm font-medium text-[#151616] mb-1">Shareable Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="https://synaphack.com/team/invite/xyz123"
                      className="flex-grow p-2 border-2 border-[#151616] rounded-lg bg-gray-100 font-mono text-sm"
                    />
                    <button className="p-2 bg-[#D6F32F] rounded-lg border-2 border-[#151616] hover:bg-[#D6F32F]/80 transition-colors">
                      <Share2 className="w-5 h-5 text-[#151616]" />
                    </button>
                  </div>
                </div>
                {/* Email Invite */}
                <div>
                  <label className="block text-sm font-medium text-[#151616] mb-1">Invite via Email</label>
                  <div className="flex items-center gap-2">
                    <input type="email" placeholder="Enter member's email" className="flex-grow p-2 border-2 border-[#151616] rounded-lg focus:ring-2 focus:ring-[#D6F32F] focus:outline-none" />
                    <button className="px-4 py-2 bg-[#D6F32F] rounded-lg border-2 border-[#151616] hover:bg-[#D6F32F]/80 transition-colors">Send</button>
                  </div>
                </div>
              </div>
              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button type="button" onClick={handleCloseTeamForm} className="px-4 py-2 bg-gray-200 rounded-lg border-2 border-[#151616] hover:bg-gray-300">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipantDashboard;