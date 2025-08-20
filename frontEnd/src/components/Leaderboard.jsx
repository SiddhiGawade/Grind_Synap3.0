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
      // try server-side leaderboard endpoint first
      const res = await fetch(`${API_BASE}/api/events/${event.id}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        // normalize to expected shape
        const lb = (data.leaderboard || []).map((t, i) => ({
          id: t.id || t.submissionId || i + 1,
          teamName: t.teamName || t.team_name || t.name || `Team ${i + 1}`,
          members: t.members || t.teamMembers || t.team_members || [],
          totalScore: typeof t.totalScore === 'number' ? t.totalScore : (t.avgScore || t.total_score || 0),
          judgeScores: t.judgeScores || t.reviews || t.scores || [],
          rank: t.rank || i + 1,
          submissionTitle: t.submissionTitle || t.project_title || t.projectTitle || ''
        }));
        setLeaderboardData(lb);
        return;
      }

      // Fallback: build from submissions + reviews endpoints
      // fetch submissions for event and reviews, then compute averages per submission
      const evId = event.id || event.eventCode || event.event_code;
      const [subsRes, revsRes] = await Promise.all([
        fetch(`${API_BASE}/api/submissions?eventId=${encodeURIComponent(evId)}`),
        fetch(`${API_BASE}/api/reviews`)
      ]);
      const subs = subsRes.ok ? await subsRes.json() : [];
      const revs = revsRes.ok ? await revsRes.json() : [];

      // group reviews by submission id
      const bySubmission = {};
      (revs || []).forEach(r => {
        const sid = String(r.submission_id || r.submissionId || r.submission);
        if (!bySubmission[sid]) bySubmission[sid] = [];
        bySubmission[sid].push(r);
      });

      const computed = (subs || []).map((s, i) => {
        const sid = String(s.id || s.submissionId || `sub-${i}`);
        const reviewsFor = bySubmission[sid] || [];
        const judgeScores = reviewsFor.map(r => ({ judgeName: r.reviewer_name || r.reviewerName || r.reviewer_email || r.reviewerEmail, score: (typeof r.score === 'number' ? r.score : (r.score ? Number(r.score) : 0)), criteria: r.criteria || r.category || '' }));
        const totalScore = judgeScores.length ? (judgeScores.reduce((a,b) => a + (b.score || 0), 0) / judgeScores.length) : 0;
        return {
          id: sid,
          teamName: s.teamName || s.team_name || s.submitter_name || s.project_name || `Team ${i+1}`,
          members: s.teamMembers || s.members || s.registrants || [],
          totalScore,
          judgeScores,
          rank: 0,
          submissionTitle: s.project_title || s.projectTitle || s.title || ''
        };
      }).sort((a,b) => b.totalScore - a.totalScore);

      // assign ranks
      computed.forEach((t, idx) => { t.rank = idx + 1; });
      setLeaderboardData(computed);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
      setLeaderboardData([]);
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

  // extract gmail addresses from a members array (strings or objects)
  const getMemberGmails = (members) => {
    if (!Array.isArray(members)) return [];
    const emails = members.map(m => {
      if (!m) return '';
      if (typeof m === 'string') return m.includes('@') ? m.trim() : '';
      if (typeof m === 'object') {
        // look for any string-valued property that looks like an email
        for (const val of Object.values(m)) {
          if (typeof val === 'string' && val.includes('@')) return val.trim();
        }
        return (m.email || m.emailAddress || m.email_address || '').trim();
      }
      return '';
    }).filter(Boolean);
    return emails.filter(e => e.toLowerCase().endsWith('@gmail.com'));
  };

  // Format a member entry into a readable string (email preferred, then name)
  const formatMemberDisplay = (m) => {
    if (!m) return '';
    if (typeof m === 'string') return m;
    if (typeof m === 'object') {
      // prefer email-like values
      for (const val of Object.values(m)) {
        if (typeof val === 'string' && val.includes('@')) return val.trim();
      }
      // prefer name-like keys
      return (m.name || m.fullName || m.full_name || m.displayName || m.username || m.handle || '').toString();
    }
    return String(m);
  };

  // Event-level performance metrics derived from leaderboardData
  const totalTeams = leaderboardData.length;
  const evaluatedTeams = leaderboardData.filter(t => Array.isArray(t.judgeScores) && t.judgeScores.length > 0).length;
  const totalReviews = leaderboardData.reduce((sum, t) => sum + (Array.isArray(t.judgeScores) ? t.judgeScores.length : 0), 0);
  const avgScore = totalTeams ? (leaderboardData.reduce((s, t) => s + (typeof t.totalScore === 'number' ? t.totalScore : 0), 0) / totalTeams) : 0;
  const highestScore = leaderboardData[0]?.totalScore || 0;
  const evaluatedPercent = totalTeams ? Math.round((evaluatedTeams / totalTeams) * 100) : 0;

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
                {/* Top 3 Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  { [0,1,2].map(i => {
                      const team = leaderboardData[i];
                      if (!team) return (
                        <div key={i} className="bg-secondary p-4 rounded-xl border-2 border-themed shadow-themed">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">{i+1}</div>
                            <div>
                              <p className="text-2xl font-black text-primary">-</p>
                              <p className="text-sm text-primary opacity-70">{['Gold','Silver','Bronze'][i] || 'Top'}</p>
                            </div>
                          </div>
                        </div>
                      );
                      const isGold = i === 0;
                      const cardClass = isGold ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : i === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white' : 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
                      const gmails = getMemberGmails(team.members);
                      const formattedMembers = Array.isArray(team.members) ? team.members.map(formatMemberDisplay).filter(Boolean) : [];
                      const memberLine = gmails.length ? gmails.join(', ') : (formattedMembers.length ? formattedMembers.join(', ') : '');
                      return (
                        <div key={team.id} className={`p-6 rounded-xl border-2 border-themed shadow-themed ${cardClass}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full bg-white/20 text-sm font-bold">#{team.rank}</div>
                                <h3 className="text-xl font-bold">{team.teamName}</h3>
                              </div>
                              <p className="text-sm opacity-80 mt-2">{team.submissionTitle}</p>
                              {memberLine && (
                                <p className="text-xs opacity-90 mt-1">{memberLine}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-black">{team.totalScore.toFixed(1)}</div>
                              <div className="text-sm opacity-80">Total Score</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Leaderboard List */}
                <div className="space-y-4">
                  {leaderboardData.map((team, index) => (
                    <div 
                      key={team.id} 
                      className={`leaderboard-card p-6 rounded-xl border-2 border-themed shadow-themed ${team.rank <= 3 ? `rank-${team.rank}` : ''}`}
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
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(team.members) && team.members.map((member, idx) => {
                            const label = formatMemberDisplay(member);
                            return (
                              <span 
                                key={idx}
                                className="bg-white/50 px-3 py-1 rounded-full text-xs text-primary border border-themed"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Judge Scores */}
                      <div>
                        <p className="text-sm font-medium text-primary mb-2">Judge Evaluations:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Array.isArray(team.judgeScores) && team.judgeScores.map((judgeScore, idx) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
