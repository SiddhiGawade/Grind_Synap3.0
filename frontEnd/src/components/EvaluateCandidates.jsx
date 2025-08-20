import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EvaluateCandidates = ({ onBack, eventAccessKey, event, submissions = [] }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});
  const [points, setPoints] = useState({});
  const [allReviews, setAllReviews] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [evaluatedCount, setEvaluatedCount] = useState(0);
  const [overallAvg, setOverallAvg] = useState(null);
  const [reviewsBySubmission, setReviewsBySubmission] = useState({});

  const handleFeedbackChange = (teamId, feedback) => {
    setFeedbacks(prev => ({ ...prev, [teamId]: feedback }));
  };

  const { user: authUser } = useAuth();

  const handlePointsChange = (teamId, pointValue) => {
    setPoints(prev => ({ ...prev, [teamId]: pointValue }));
  };

  const handleSubmitEvaluation = (teamId) => {
    const feedback = feedbacks[teamId] || '';
    const teamPoints = points[teamId] || 0;
    // POST review to backend
    (async () => {
      try {
        // Ensure we have an authenticated reviewer email
        const reviewerEmail = (authUser && authUser.email) || (window.__auth && window.__auth.email) || null;
        const reviewerName = (authUser && authUser.name) || (window.__auth && window.__auth.name) || null;
        if (!reviewerEmail) {
          alert('You must be signed in as a judge to submit evaluations');
          return;
        }

        const body = {
          submissionId: teamId,
          score: Number(teamPoints),
          feedback,
          reviewerEmail: String(reviewerEmail).toLowerCase(),
          reviewerName: reviewerName || undefined
        };
        const apiBase = import.meta.env.VITE_API_BASE || '';
        const reviewsUrl = apiBase ? `${apiBase.replace(/\/$/, '')}/api/reviews` : '/api/reviews';
        
        const res = await fetch(reviewsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => 'Failed to save review');
          throw new Error(txt || 'Failed to save review');
        }
  const data = await res.json();
  // refresh reviews / leaderboard
  await fetchReviews();
  console.log('Review saved', data);
  alert('Evaluation submitted successfully');
      } catch (err) {
        console.error('Failed to submit evaluation', err);
        alert('Failed to submit evaluation: ' + (err.message || err));
      }
    })();
  };

  // Fetch all reviews and compute leaderboard (average score per submission)
  const fetchReviews = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const reviewsUrl = apiBase ? `${apiBase.replace(/\/$/, '')}/api/reviews` : '/api/reviews';
      
      const res = await fetch(reviewsUrl);
      if (!res.ok) return;
      const reviews = await res.json();
      setAllReviews(reviews || []);
      // compute per-submission aggregates for current submissions
      const submissionIds = (submissions || []).map(s => String(s.id));
  const byId = {};
      (reviews || []).forEach(r => {
        const sid = String(r.submission_id || r.submissionId || r.submission);
        if (!submissionIds.includes(sid)) return;
        if (!byId[sid]) byId[sid] = { total: 0, count: 0, reviews: [] };
        const score = typeof r.score === 'number' ? r.score : (r.score ? Number(r.score) : 0);
        byId[sid].total += score;
        byId[sid].count += 1;
        byId[sid].reviews.push(r);
      });

      const board = (submissions || []).map(s => {
        const sid = String(s.id || s.team_name + '-' + (s.index || ''));
        const agg = byId[sid] || { total: 0, count: 0, reviews: [] };
        const avg = agg.count > 0 ? (agg.total / agg.count) : null;
        return {
          submissionId: sid,
          teamName: s.team_name || s.teamName || s.submitter_name || `Team ${s.teamName || s.id || ''}`,
          avgScore: avg,
          reviewCount: agg.count,
          reviews: agg.reviews
        };
      }).sort((a,b) => {
        // sort: highest average first; nulls go last; tie-breaker by count
        if (a.avgScore === null && b.avgScore === null) return b.reviewCount - a.reviewCount;
        if (a.avgScore === null) return 1;
        if (b.avgScore === null) return -1;
        if (b.avgScore === a.avgScore) return b.reviewCount - a.reviewCount;
        return b.avgScore - a.avgScore;
      });

  setLeaderboard(board);
  setReviewsBySubmission(byId);

      // compute overall average across all reviews included in byId
      let total = 0;
      let count = 0;
      Object.keys(byId).forEach(k => {
        const a = byId[k];
        total += a.total;
        count += a.count;
      });
      setOverallAvg(count > 0 ? (total / count) : null);
      // number of submissions that have at least one review
      const evaluated = Object.keys(byId).filter(k => byId[k].count > 0).length;
      setEvaluatedCount(evaluated);
    } catch (e) {
      console.error('Failed to fetch reviews for leaderboard', e);
    }
  };

  useEffect(() => {
    // initial load of reviews when component mounts
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

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
                  <p className="text-sm text-primary opacity-60">Event: {event?.eventTitle || eventAccessKey}</p>
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
              <p className="text-sm text-primary opacity-60">Total Submissions</p>
              <p className="text-2xl font-black text-primary">{submissions.length}</p>
            </div>
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Evaluated</p>
              <p className="text-2xl font-black text-primary">{evaluatedCount}</p>
            </div>
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Pending</p>
              <p className="text-2xl font-black text-primary">{Math.max(0, submissions.length - evaluatedCount)}</p>
            </div>
            <div className="bg-primary p-4 rounded-lg border-2 border-themed shadow-themed">
              <p className="text-sm text-primary opacity-60">Average Score</p>
              <p className="text-2xl font-black text-primary">{overallAvg !== null ? overallAvg.toFixed(1) : '-'}</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mb-6">
            <div className="bg-secondary p-4 rounded-2xl border-2 border-themed">
              <h3 className="text-lg font-bold text-primary mb-2">Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <div className="text-primary opacity-60">No scores yet. Judges' evaluations will appear here.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {leaderboard.slice(0,6).map((row, idx) => (
                    <div key={row.submissionId} className="p-3 bg-primary rounded-lg border border-themed">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-primary">{idx+1}. {row.teamName}</div>
                        <div className="text-accent font-black text-xl">{row.avgScore !== null ? row.avgScore.toFixed(1) : '—'}</div>
                      </div>
                      <div className="text-xs text-primary opacity-70">Reviews: {row.reviewCount}</div>
                    </div>
                  ))}
                </div>
              )}
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
                  {submissions.map((sub, index) => {
                    const id = sub.id || sub.team_name + '-' + index;
                    const teamName = sub.team_name || sub.teamName || sub.submitter_name || `Team ${index + 1}`;
                    const projectTitle = sub.project_title || sub.projectTitle || sub.link || 'Submission';
                    const repoLink = (sub.files && Array.isArray(sub.files) && sub.files[0] && sub.files[0].url) || sub.link || null;
                    return (
                      <tr key={id} className={`table-row transition-colors ${index !== submissions.length - 1 ? 'border-b border-themed' : ''}`}>
                        <td className="px-6 py-4"><div className="font-bold text-primary">{teamName}</div></td>
                        <td className="px-6 py-4"><div className="text-primary">{sub.submitter_name || sub.submitterName || sub.submitter_email || '-'}</div></td>
                        <td className="px-6 py-4"><div className="text-primary font-medium">{projectTitle}</div></td>
                        <td className="px-6 py-4"><div className="text-primary">{reviewsBySubmission[id] && reviewsBySubmission[id].count > 0 ? (reviewsBySubmission[id].total / reviewsBySubmission[id].count).toFixed(1) : '-'}</div></td>
                        <td className="px-6 py-4">
                          {repoLink ? (
                            <a href={repoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline">
                              <ExternalLink className="w-4 h-4" />
                              View Submission
                            </a>
                          ) : (
                            <span className="text-primary opacity-60">No link</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={feedbacks[id] || ''}
                            onChange={(e) => handleFeedbackChange(id, e.target.value)}
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
                              value={points[id] || ''}
                              onChange={(e) => handlePointsChange(id, parseInt(e.target.value) || 0)}
                              placeholder="0-10"
                              className="w-20 px-3 py-2 text-sm border-2 border-themed rounded-lg bg-secondary text-primary placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <Star className="w-4 h-4 text-accent" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleSubmitEvaluation(id)}
                            className="btn-primary px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm"
                          >
                            Submit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* No teams message (if needed) */}
          {submissions.length === 0 && (
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