import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Trophy, BarChart3, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const JudgeDashboard = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

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
          background: linear-gradient(135deg, var(--bg-accent), var(--bg-secondary));
        }

        .pending-item-urgent {
          background: linear-gradient(135deg, #FED7D7, #FBB6CE);
        }

        .pending-item-soon {
          background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
        }

        .pending-item-new {
          background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
        }

        .stats-card-blue {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
        }

        .stats-card-green {
          background: linear-gradient(135deg, var(--bg-accent), var(--bg-secondary));
        }

        .stats-card-purple {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-accent));
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
              <h2 className="text-2xl font-black text-secondary mb-2">Judge Dashboard ⚖️</h2>
              <p className="text-secondary opacity-80">Review submissions and provide valuable feedback to participants</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Assigned Events</p>
                  <p className="text-3xl font-black text-primary">4</p>
                </div>
                <Calendar className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Pending Reviews</p>
                  <p className="text-3xl font-black text-primary">12</p>
                </div>
                <FileText className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Completed Reviews</p>
                  <p className="text-3xl font-black text-primary">28</p>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </div>
            
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary opacity-60 text-sm">Average Score</p>
                  <p className="text-3xl font-black text-primary">8.2</p>
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
                <button className="btn-primary w-full p-3 rounded-lg border-2 transition-all font-medium flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Review Submissions
                </button>
                <button className="btn-secondary w-full p-3 rounded-lg border-2 hover:bg-secondary transition-colors font-medium flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  View Scores
                </button>
                <button className="btn-secondary w-full p-3 rounded-lg border-2 hover:bg-secondary transition-colors font-medium flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Judging Criteria
                </button>
              </div>
            </div>
            
            <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
              <h3 className="text-lg font-bold text-primary mb-4">Pending Reviews</h3>
              <div className="space-y-3">
                <div className="p-4 pending-item-urgent rounded-lg border-2 border-themed">
                  <h4 className="font-bold text-primary">AI Chat Assistant</h4>
                  <p className="text-sm text-primary opacity-70">Team Alpha • AI Innovation Challenge</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">Urgent</span>
                </div>
                <div className="p-4 pending-item-soon rounded-lg border-2 border-themed">
                  <h4 className="font-bold text-primary">DeFi Trading Platform</h4>
                  <p className="text-sm text-primary opacity-70">Team Beta • Web3 Hackathon</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">Due Soon</span>
                </div>
                <div className="p-4 pending-item-new rounded-lg border-2 border-themed">
                  <h4 className="font-bold text-primary">Smart Contract Analyzer</h4>
                  <p className="text-sm text-primary opacity-70">Team Gamma • Blockchain Summit</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">New</span>
                </div>
              </div>
            </div>
          </div>

          {/* Judging Statistics */}
          <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed mb-8">
            <h3 className="text-lg font-bold text-primary mb-6">Judging Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stats-card-blue p-4 rounded-lg border border-themed">
                <h4 className="font-bold text-primary mb-2">Most Active Category</h4>
                <p className="text-sm text-primary opacity-70 mb-1">AI & Machine Learning</p>
                <p className="text-xl font-black text-accent">15 submissions</p>
              </div>
              
              <div className="stats-card-green p-4 rounded-lg border border-themed">
                <h4 className="font-bold text-secondary mb-2">Highest Rated Project</h4>
                <p className="text-sm text-secondary opacity-70 mb-1">Smart Health Monitor</p>
                <p className="text-xl font-black text-secondary">9.5/10</p>
              </div>
              
              <div className="stats-card-purple p-4 rounded-lg border border-themed">
                <h4 className="font-bold text-primary mb-2">Review Completion</h4>
                <p className="text-sm text-primary opacity-70 mb-1">This Month</p>
                <p className="text-xl font-black text-accent">78%</p>
              </div>
            </div>
          </div>

          {/* Recent Evaluations */}
          <div className="dashboard-card-white p-6 rounded-2xl border-2 border-themed">
            <h3 className="text-lg font-bold text-primary mb-6">Recent Evaluations</h3>
            <div className="space-y-4">
              <div className="recent-eval-item flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-bold text-primary">ML Prediction Model</h4>
                  <p className="text-sm text-primary opacity-70">Team Delta • AI Innovation Challenge</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">8.7</div>
                  <div className="text-xs text-primary opacity-60">Scored 2 days ago</div>
                </div>
              </div>
              
              <div className="recent-eval-item flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-bold text-primary">Decentralized Voting App</h4>
                  <p className="text-sm text-primary opacity-70">Team Echo • Web3 Hackathon</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">9.1</div>
                  <div className="text-xs text-primary opacity-60">Scored 3 days ago</div>
                </div>
              </div>
              
              <div className="recent-eval-item flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <h4 className="font-bold text-primary">IoT Home Automation</h4>
                  <p className="text-sm text-primary opacity-70">Team Foxtrot • IoT Challenge</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">7.9</div>
                  <div className="text-xs text-primary opacity-60">Scored 1 week ago</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default JudgeDashboard;
