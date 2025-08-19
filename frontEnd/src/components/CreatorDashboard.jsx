import React from 'react';
import { Calendar, Users, FileText, Trophy, LogOut, Plus, Edit, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const CreatorDashboard = () => {
  const { user, logout } = useAuth();

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Active Events</p>
                <p className="text-3xl font-black text-[#151616]">3</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Total Participants</p>
                <p className="text-3xl font-black text-[#151616]">147</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Total Submissions</p>
                <p className="text-3xl font-black text-[#151616]">89</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Events Created</p>
                <p className="text-3xl font-black text-[#151616]">12</p>
              </div>
              <Trophy className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h3 className="text-lg font-bold text-[#151616] mb-4">Event Management</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#D6F32F] p-3 rounded-lg border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:shadow-[1px_1px_0px_0px_#151616] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-medium text-[#151616] flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Event
              </button>
              <button className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Manage Events
              </button>
              <button className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h3 className="text-lg font-bold text-[#151616] mb-4">Recent Events</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-[#151616]">
                <h4 className="font-bold text-[#151616]">AI Innovation Challenge</h4>
                <p className="text-sm text-[#151616]/70">45 participants • 23 submissions</p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">Active</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-[#151616]">
                <h4 className="font-bold text-[#151616]">Web3 Hackathon</h4>
                <p className="text-sm text-[#151616]/70">62 participants • 41 submissions</p>
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">Judging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Performance */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
          <h3 className="text-lg font-bold text-[#151616] mb-6">Event Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-[#151616]/20">
              <h4 className="font-bold text-[#151616] mb-2">Most Popular Event</h4>
              <p className="text-sm text-[#151616]/70 mb-1">AI Innovation Challenge</p>
              <p className="text-xl font-black text-green-600">145 participants</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-[#151616]/20">
              <h4 className="font-bold text-[#151616] mb-2">Highest Engagement</h4>
              <p className="text-sm text-[#151616]/70 mb-1">Web3 Hackathon</p>
              <p className="text-xl font-black text-orange-600">94% completion</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-[#151616]/20">
              <h4 className="font-bold text-[#151616] mb-2">Best Rated Event</h4>
              <p className="text-sm text-[#151616]/70 mb-1">Mobile App Challenge</p>
              <p className="text-xl font-black text-purple-600">4.9/5 stars</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatorDashboard;