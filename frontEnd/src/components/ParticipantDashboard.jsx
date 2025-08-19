import React from 'react';
import { Calendar, Users, FileText, Trophy, LogOut, Plus, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ParticipantDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFFFF4]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#151616] sticky top-0 z-40">
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
        <div className="mb-8 relative">
          <div className="bg-gradient-to-r from-[#D6F32F] to-[#D6F32F]/80 p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h2 className="text-2xl font-black text-[#151616] mb-2">Welcome back, {user.name}! 👋</h2>
            <p className="text-[#151616]/70">Ready to participate in amazing hackathons and events?</p>
          </div>

          {/* Circle and Edit Button */}
          <div className="absolute top-0 right-4 mt-2 w-16 h-16 bg-white rounded-full border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616]"></div>

          <button className="absolute top-19 right-4 bg-white/500 px-4 py-1 rounded-full border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:bg-white/60 transition-colors text-sm font-bold text-black">
          Edit Profile
          </button>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Events Joined</p>
                <p className="text-3xl font-black text-[#151616]">5</p>
              </div>
              <Calendar className="w-8 h-8 text-[#151616]/60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Team Members</p>
                <p className="text-3xl font-black text-[#151616]">3</p>
              </div>
              <Users className="w-8 h-8 text-[#151616]/60" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Submissions</p>
                <p className="text-3xl font-black text-[#151616]">2</p>
              </div>
              <FileText className="w-8 h-8 text-[#151616]/60" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h3 className="text-lg font-bold text-[#151616] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#D6F32F] p-3 rounded-lg border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:shadow-[1px_1px_0px_0px_#151616] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-medium text-[#151616] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Join New Event
              </button>
              <button className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Submit Project
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h3 className="text-lg font-bold text-[#151616] mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#FFFFF4] rounded-lg border border-[#151616]/20">
                <p className="text-sm font-medium text-[#151616]">Joined "AI Innovation Challenge"</p>
                <p className="text-xs text-[#151616]/60">2 hours ago</p>
              </div>
              <div className="p-3 bg-[#FFFFF4] rounded-lg border border-[#151616]/20">
                <p className="text-sm font-medium text-[#151616]">Submitted project for "Web3 Hackathon"</p>
                <p className="text-xs text-[#151616]/60">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Events */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
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
        </div>
      </main>
    </div>
  );
};

export default ParticipantDashboard;