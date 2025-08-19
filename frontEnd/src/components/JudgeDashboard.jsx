import React from 'react';
import { Calendar, FileText, Trophy, BarChart3, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const JudgeDashboard = () => {
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
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h2 className="text-2xl font-black text-[#151616] mb-2">Judge Dashboard ⚖️</h2>
            <p className="text-[#151616]/70">Review submissions and provide valuable feedback to participants</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Assigned Events</p>
                <p className="text-3xl font-black text-[#151616]">4</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Pending Reviews</p>
                <p className="text-3xl font-black text-[#151616]">12</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Completed Reviews</p>
                <p className="text-3xl font-black text-[#151616]">28</p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#151616]/60 text-sm">Average Score</p>
                <p className="text-3xl font-black text-[#151616]">8.2</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Judging Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h3 className="text-lg font-bold text-[#151616] mb-4">Judging Tasks</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#D6F32F] p-3 rounded-lg border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616] hover:shadow-[1px_1px_0px_0px_#151616] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-medium text-[#151616] flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Review Submissions
              </button>
              <button className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Scores
              </button>
              <button className="w-full bg-white p-3 rounded-lg border-2 border-[#151616] hover:bg-[#151616]/5 transition-colors font-medium text-[#151616] flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Judging Criteria
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
            <h3 className="text-lg font-bold text-[#151616] mb-4">Pending Reviews</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-[#151616]">
                <h4 className="font-bold text-[#151616]">AI Chat Assistant</h4>
                <p className="text-sm text-[#151616]/70">Team Alpha • AI Innovation Challenge</p>
                <span className="inline-block mt-2 px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">Urgent</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-[#151616]">
                <h4 className="font-bold text-[#151616]">DeFi Trading Platform</h4>
                <p className="text-sm text-[#151616]/70">Team Beta • Web3 Hackathon</p>
                <span className="inline-block mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">Due Soon</span>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-[#151616]">
                <h4 className="font-bold text-[#151616]">Smart Contract Analyzer</h4>
                <p className="text-sm text-[#151616]/70">Team Gamma • Blockchain Summit</p>
                <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">New</span>
              </div>
            </div>
          </div>
        </div>

        {/* Judging Statistics */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] mb-8">
          <h3 className="text-lg font-bold text-[#151616] mb-6">Judging Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-[#151616]/20">
              <h4 className="font-bold text-[#151616] mb-2">Most Active Category</h4>
              <p className="text-sm text-[#151616]/70 mb-1">AI & Machine Learning</p>
              <p className="text-xl font-black text-blue-600">15 submissions</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-[#151616]/20">
              <h4 className="font-bold text-[#151616] mb-2">Highest Rated Project</h4>
              <p className="text-sm text-[#151616]/70 mb-1">Smart Health Monitor</p>
              <p className="text-xl font-black text-green-600">9.5/10</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-[#151616]/20">
              <h4 className="font-bold text-[#151616] mb-2">Review Completion</h4>
              <p className="text-sm text-[#151616]/70 mb-1">This Month</p>
              <p className="text-xl font-black text-purple-600">78%</p>
            </div>
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616]">
          <h3 className="text-lg font-bold text-[#151616] mb-6">Recent Evaluations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#FFFFF4] rounded-lg border border-[#151616]/20">
              <div>
                <h4 className="font-bold text-[#151616]">ML Prediction Model</h4>
                <p className="text-sm text-[#151616]/70">Team Delta • AI Innovation Challenge</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#151616]">8.7</div>
                <div className="text-xs text-[#151616]/60">Scored 2 days ago</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#FFFFF4] rounded-lg border border-[#151616]/20">
              <div>
                <h4 className="font-bold text-[#151616]">Decentralized Voting App</h4>
                <p className="text-sm text-[#151616]/70">Team Echo • Web3 Hackathon</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#151616]">9.1</div>
                <div className="text-xs text-[#151616]/60">Scored 3 days ago</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#FFFFF4] rounded-lg border border-[#151616]/20">
              <div>
                <h4 className="font-bold text-[#151616]">IoT Home Automation</h4>
                <p className="text-sm text-[#151616]/70">Team Foxtrot • IoT Challenge</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#151616]">7.9</div>
                <div className="text-xs text-[#151616]/60">Scored 1 week ago</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JudgeDashboard;