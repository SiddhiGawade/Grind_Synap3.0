import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Users, Star, X, Crown, Target } from 'lucide-react';

const Leaderboard = ({ event, onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  useEffect(() => {
    if (event) {
      fetchLeaderboard();
    }
  }, [event]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event.id}/leaderboard`);
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      const data = await res.json();
      setLeaderboardData(data.leaderboard || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
      // Mock data for demonstration
      setLeaderboardData([
        {
          id: 1,
          teamName: "Code Warriors",
          members: ["Alice Johnson", "Bob Smith", "Carol Davis"],
          totalScore: 95.5,
          judgeScores: [
            { judgeName: "Dr. Smith", score: 96, criteria: "Innovation" },
            { judgeName: "Prof. Johnson", score: 95, criteria: "Technical Implementation" }
          ],
          rank: 1,
          submissionTitle: "AI-Powered Healthcare Assistant"
        },
        {
          id: 2,
          teamName: "Tech Innovators",
          members: ["David Wilson", "Emma Brown", "Frank Miller"],
          totalScore: 92.3,
          judgeScores: [
            { judgeName: "Dr. Smith", score: 93, criteria: "Innovation" },
            { judgeName: "Prof. Johnson", score: 91.5, criteria: "Technical Implementation" }
          ],
          rank: 2,
          submissionTitle: "Smart City Traffic Management"
        },
        {
          id: 3,
          teamName: "Digital Pioneers",
          members: ["Grace Lee", "Henry Taylor", "Ivy Chen"],
          totalScore: 89.7,
          judgeScores: [
            { judgeName: "Dr. Smith", score: 90, criteria: "Innovation" },
            { judgeName: "Prof. Johnson", score: 89.4, criteria: "Technical Implementation" }
          ],
          rank: 3,
          submissionTitle: "Blockchain-based Voting System"
        },
        {
          id: 4,
          teamName: "Future Builders",
          members: ["Jack Anderson", "Kate Wilson"],
          totalScore: 87.2,
          judgeScores: [
            { judgeName: "Dr. Smith", score: 88, criteria: "Innovation" },
            { judgeName: "Prof. Johnson", score: 86.4, criteria: "Technical Implementation" }
          ],
          rank: 4,
          submissionTitle: "Green Energy Monitoring App"
        },
        {
          id: 5,
          teamName: "Code Crafters",
          members: ["Liam Garcia", "Maya Patel", "Noah Kim"],
          totalScore: 84.8,
          judgeScores: [
            { judgeName: "Dr. Smith", score: 85, criteria: "Innovation" },
            { judgeName: "Prof. Johnson", score: 84.6, criteria: "Technical Implementation" }
          ],
          rank: 5,
          submissionTitle: "Educational VR Platform"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Target className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankBadge = (rank) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1";
    switch (rank) {
      case 1:
        return `${baseClasses} bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg`;
      case 2:
        return `${baseClasses} bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg`;
      case 3:
        return `${baseClasses} bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg`;
      default:
        return `${baseClasses} bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg`;
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --bg-primary: #F2EDD1;
          --bg-secondary: #F9CB99;
          --bg-accent: #689B8A;
          --text-primary: #280A3E;
          --text-secondary: #F2EDD1;
          --border-color: #280A3E;
          --shadow-color: #280A3E;
        }
        .leaderboard-card {
          background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(242, 237, 209, 0.9) 100%);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .leaderboard-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(40, 10, 62, 0.15);
        }
        .rank-1 {
          background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%);
          border-color: #f59e0b;
        }
        .rank-2 {
          background: linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%);
          border-color: #9ca3af;
        }
        .rank-3 {
          background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%);
          border-color: #d97706;
        }
        .score-bar {
          background: linear-gradient(90deg, var(--bg-accent) 0%, #4ade80 100%);
          height: 6px;
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="bg-primary w-full max-w-6xl max-h-[90vh] rounded-2xl border-2 border-themed shadow-themed-xl flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 p-6 border-b-2 border-themed bg-secondary rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center border-2 border-themed shadow-themed">
                  <Trophy className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-primary">Event Leaderboard</h2>
                  <p className="text-primary opacity-70">{event?.eventTitle || 'Event Results'}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg border-2 border-themed hover:bg-primary transition-colors"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-primary opacity-70">Loading leaderboard...</p>
              </div>
            )}

            {error && !leaderboardData.length && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-primary opacity-30 mx-auto mb-4" />
                <p className="text-primary opacity-70 mb-4">{error}</p>
                <button 
                  onClick={fetchLeaderboard}
                  className="bg-accent text-secondary px-4 py-2 rounded-lg border-2 border-themed font-medium hover:shadow-themed transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {leaderboardData.length > 0 && (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-secondary p-4 rounded-xl border-2 border-themed shadow-themed">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-accent" />
                      <div>
                        <p className="text-2xl font-black text-primary">{leaderboardData.length}</p>
                        <p className="text-sm text-primary opacity-70">Total Teams</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl border-2 border-themed shadow-themed">
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-2xl font-black text-primary">{leaderboardData[0]?.totalScore?.toFixed(1) || 'N/A'}</p>
                        <p className="text-sm text-primary opacity-70">Highest Score</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl border-2 border-themed shadow-themed">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-accent" />
                      <div>
                        <p className="text-2xl font-black text-primary">{(leaderboardData.reduce((sum, team) => sum + team.totalScore, 0) / leaderboardData.length).toFixed(1)}</p>
                        <p className="text-sm text-primary opacity-70">Average Score</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="space-y-4">
                  {leaderboardData.map((team, index) => (
                    <div 
                      key={team.id} 
                      className={`leaderboard-card p-6 rounded-xl border-2 border-themed shadow-themed ${
                        team.rank <= 3 ? `rank-${team.rank}` : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={getRankBadge(team.rank)}>
                            {getRankIcon(team.rank)}
                            #{team.rank}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-primary">{team.teamName}</h3>
                            <p className="text-sm text-primary opacity-70">{team.submissionTitle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-primary">{team.totalScore.toFixed(1)}</div>
                          <div className="text-sm text-primary opacity-70">Total Score</div>
                        </div>
                      </div>

                      {/* Score Progress Bar */}
                      <div className="mb-4">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="score-bar"
                            style={{ width: `${(team.totalScore / 100) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-primary mb-2">Team Members:</p>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member, idx) => (
                            <span 
                              key={idx}
                              className="bg-white/50 px-3 py-1 rounded-full text-xs text-primary border border-themed"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Judge Scores */}
                      <div>
                        <p className="text-sm font-medium text-primary mb-2">Judge Evaluations:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {team.judgeScores.map((judgeScore, idx) => (
                            <div 
                              key={idx}
                              className="bg-white/30 p-3 rounded-lg border border-themed"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-primary text-sm">{judgeScore.judgeName}</p>
                                  <p className="text-xs text-primary opacity-60">{judgeScore.criteria}</p>
                                </div>
                                <div className="text-lg font-bold text-accent">{judgeScore.score}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {leaderboardData.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-primary opacity-30 mx-auto mb-4" />
                    <p className="text-primary opacity-70">No teams have been evaluated yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
