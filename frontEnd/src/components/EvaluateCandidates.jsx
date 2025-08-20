import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, MessageSquare, Star } from 'lucide-react';

const EvaluateCandidates = ({ onBack, eventAccessKey }) => {
  const [darkMode, setDarkMode] = useState(false);
 
  const [teams] = useState([
    {
      id: 1,
      teamName: "Team Alpha",
      teamLead: "John Smith",
      githubLink: "https://github.com/team-alpha/ai-assistant",
      projectTitle: "AI Chat Assistant",
      feedback: "",
      points: 0,
      status: "pending"
    },
    {
      id: 2,
      teamName: "Team Beta",
      teamLead: "Sarah Johnson",
      githubLink: "https://github.com/team-beta/defi-platform",
      projectTitle: "DeFi Trading Platform",
      feedback: "",
      points: 0,
      status: "pending"
    },
    {
      id: 3,
      teamName: "Team Gamma",
      teamLead: "Mike Chen",
      githubLink: "https://github.com/team-gamma/smart-analyzer",
      projectTitle: "Smart Contract Analyzer",
      feedback: "",
      points: 0,
      status: "pending"
    },
    {
      id: 4,
      teamName: "Team Delta",
      teamLead: "Emily Davis",
      githubLink: "https://github.com/team-delta/ml-predictor",
      projectTitle: "ML Prediction Model",
      feedback: "",
      points: 0,
      status: "pending"
    }
  ]);

  const [feedbacks, setFeedbacks] = useState({});
  const [points, setPoints] = useState({});

  const handleFeedbackChange = (teamId, feedback) => {
    setFeedbacks(prev => ({ ...prev, [teamId]: feedback }));
  };

  const handlePointsChange = (teamId, pointValue) => {
    setPoints(prev => ({ ...prev, [teamId]: pointValue }));
  };

  const handleSubmitEvaluation = (teamId) => {
    const feedback = feedbacks[teamId] || '';
    const teamPoints = points[teamId] || 0;
    
    console.log(`Evaluation submitted for Team ${teamId}:`, {
      feedback,
      points: teamPoints
    });
    
    alert(`Evaluation submitted successfully!\nPoints: ${teamPoints}\nFeedback: ${feedback}`);
  };

  return (
    <>
      {/* CSS Variables - Same as JudgeDashboard */}
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

        .table-header {
          background-color: var(--bg-secondary);
          border-color: var(--border-color);
        }

        .table-row {
          background-color: var(--bg-primary);
          border-color: var(--border-color);
        }

        .table-row:hover {
          background-color: var(--bg-secondary);
        }
      `}</style>

      <div className="min-h-screen transition-colors duration-500 bg-primary light-theme">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-secondary border-b-2 border-themed shadow-themed">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg border-2 border-themed hover:bg-primary transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-primary" />
                </button>
                <div>
                  <h1 className="text-xl font-black text-primary">Evaluate Candidates</h1>
                  <p className="text-sm text-primary opacity-60">Event: {eventAccessKey}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">Judge Panel</p>
                  <p className="text-xs opacity-60 text-primary">SynapHack 3.0</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Total Teams</p>
              <p className="text-2xl font-black text-primary">{teams.length}</p>
            </div>
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Evaluated</p>
              <p className="text-2xl font-black text-primary">0</p>
            </div>
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Pending</p>
              <p className="text-2xl font-black text-primary">{teams.length}</p>
            </div>
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Average Score</p>
              <p className="text-2xl font-black text-primary">-</p>
            </div>
          </div>

          {/* Teams Table */}
          <div className="bg-primary rounded-2xl border-2 border-themed shadow-themed-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b-2 border-themed">
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Team Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Team Lead</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Project</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">GitHub Link</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Feedback</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Points</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr key={team.id} className={`table-row transition-colors ${index !== teams.length - 1 ? 'border-b border-themed' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-primary">{team.teamName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary">{team.teamLead}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary font-medium">{team.projectTitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={team.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Repository
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          value={feedbacks[team.id] || ''}
                          onChange={(e) => handleFeedbackChange(team.id, e.target.value)}
                          placeholder="Enter feedback..."
                          className="w-full px-3 py-2 text-sm border-2 border-themed rounded-lg bg-secondary text-primary placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                          rows="2"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={points[team.id] || ''}
                            onChange={(e) => handlePointsChange(team.id, parseInt(e.target.value) || 0)}
                            placeholder="0-10"
                            className="w-20 px-3 py-2 text-sm border-2 border-themed rounded-lg bg-secondary text-primary placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <Star className="w-4 h-4 text-accent" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleSubmitEvaluation(team.id)}
                          className="btn-primary px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm"
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* No teams message (if needed) */}
          {teams.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-primary opacity-30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-2">No Teams Found</h3>
              <p className="text-primary opacity-60">No team submissions available for this event.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default EvaluateCandidates;