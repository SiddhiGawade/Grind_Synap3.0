import React, { useState, useEffect } from 'react';
import Confetti from "react-confetti";
import { motion, AnimatePresence } from 'framer-motion';

// 4-step wizard: Host -> Event -> Mentors -> Confirmation
const steps = ['Host details', 'Event details', 'Mentors', 'Confirmation'];

const initialForm = (prefill = {}) => ({
  name: prefill.name || '',
  email: prefill.email || '',
  aadhar: '',
  organization: '',
  designation: '',
  eventType: 'event',
  eventTitle: '',
  eventDescription: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  numberOfMentors: 0,
  selectedJudges: [],
  // Hackathon specific fields
  hackathonMode: 'offline',
  venue: '',
  registrationDeadline: '',
  eligibility: 'open',
  minTeamSize: '',
  maxTeamSize: '',
  maxParticipants: '',
  themes: '',
  tracks: [],
  submissionGuidelines: '',
  evaluationCriteria: '',
  prizeDetails: '',
  participationCertificates: true,
  // Event specific fields
  eventCategory: '',
  eventMode: 'offline',
  registrationFee: '',
});

const CreateEventWizard = ({ onClose, prefill = {}, onCreated, event }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm(prefill));
  const [availableJudges, setAvailableJudges] = useState([]);
  const [judgesLoading, setJudgesLoading] = useState(false);
  const isEdit = Boolean(event && event.id);

  useEffect(() => {
    if (isEdit) {
      // populate form from event
      setForm((s) => ({
        ...s,
        name: event.name || s.name,
        email: event.email || s.email,
        aadhar: event.aadhar || s.aadhar,
        organization: event.organization || s.organization,
        designation: event.designation || s.designation,
        eventTitle: event.eventTitle || s.eventTitle,
        eventDescription: event.eventDescription || s.eventDescription,
        startDate: event.startDate || s.startDate,
        endDate: event.endDate || s.endDate,
        numberOfMentors: event.numberOfMentors || s.numberOfMentors,
        selectedJudges: Array.isArray(event.authorizedJudges) ? event.authorizedJudges : []
      }));
    }
  }, [isEdit, event]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch available judges when component mounts
    const fetchJudges = async () => {
      setJudgesLoading(true);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-production-api.com';
        const res = await fetch(`${API_BASE}/api/judges`);
        const data = await res.json();
        if (res.ok) {
          setAvailableJudges(data.judges || []);
        } else {
          console.error('Failed to fetch judges:', data.error);
        }
      } catch (err) {
        console.error('Error fetching judges:', err);
      } finally {
        setJudgesLoading(false);
      }
    };

    fetchJudges();
    return () => {};
  }, []);

  const update = (patch) => setForm((s) => ({ ...s, ...patch }));

  const validateStep = () => {
    setError(null);
    if (step === 0) {
      if (!form.name.trim()) return 'Name is required';
      if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return 'Valid email is required';
      
      // Aadhar validation
      const aadharNumber = form.aadhar.trim();
      if (!aadharNumber) return 'Aadhar number is required';
      if (!/^\d{12}$/.test(aadharNumber)) return 'Aadhar number must be exactly 12 digits';
      if (/[^0-9]/.test(aadharNumber)) return 'Aadhar number must contain only numbers';
      if (['0', '1'].includes(aadharNumber[0])) return 'Aadhar number must start with a digit between 2-9';

      // Organization validation
      const organizationName = form.organization.trim();
      if (organizationName && !/^[A-Za-z\s]+$/.test(organizationName)) {
        return 'Organization name must contain only letters and spaces';
      }
      return null;
    }
    if (step === 1) {
      if (!form.eventTitle.trim()) return 'Event title is required';
      return null;
    }
    if (step === 2) {
      const n = Number(form.numberOfMentors || 0);
      if (Number.isNaN(n) || n < 0) return 'Number of mentors must be 0 or greater';
      return null;
    }
    return null;
  };

  const goNext = () => {
    const v = validateStep();
    if (v) return setError(v);
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    const v = validateStep();
    if (v) return setError(v);
    setLoading(true);
    setError(null);
    try {
      // Build payload and use selectedJudges directly
      const payload = { ...form };
      if (Array.isArray(form.selectedJudges)) {
        payload.authorizedJudges = form.selectedJudges;
      } else {
        payload.authorizedJudges = [];
      }
      // Remove selectedJudges from payload as backend expects authorizedJudges
      delete payload.selectedJudges;
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-production-api.com';
      const url = isEdit ? `${API_BASE}/api/events/${event.id}` : `${API_BASE}/api/events`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Failed to create event');
      setSuccess(data.message || 'Event created successfully');
      // keep created event in local state so we can show the generated eventCode
      setCreatedEvent(data.event || null);
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000); // Hide confetti after 5 seconds
      // notify parent immediately so lists can refresh, but do not close the modal
      if (onCreated) {
        try { onCreated(data.event || null); } catch (e) {}
      }
      // move user to confirmation step so they can copy/share the event code
      setStep(steps.length - 1);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Network error');
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          /* Light Theme Colors Only */
          --bg-primary: #F2EDD1;
          --bg-secondary: #F9CB99;
          --bg-accent: #689B8A;
          --text-primary: #280A3E;
          --text-secondary: #F2EDD1;
          --border-color: #280A3E;
          --shadow-color: #280A3E;
        }
        .bg-primary { background-color: var(--bg-primary); }
        .bg-secondary { background-color: var(--bg-secondary); }
        .bg-accent { background-color: var(--bg-accent); }
        .text-primary { color: var(--text-primary); }
        .text-secondary { color: var(--text-secondary); }
        .border-themed { border-color: var(--border-color); }
        .shadow-themed { box-shadow: 2px 2px 0px 0px var(--shadow-color); }
        .shadow-themed-lg { box-shadow: 4px 4px 0px 0px var(--shadow-color); }
        .shadow-themed-xl { box-shadow: 8px 8px 0px 0px var(--shadow-color); }
        .btn-primary { background-color: var(--bg-accent); color: var(--text-secondary); border-color: var(--border-color); }
        .btn-secondary { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color); }
        .btn-secondary:hover { background-color: var(--bg-secondary); }
        .input-field { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color); }
        .modal-content { background-color: var(--bg-secondary); border-color: var(--border-color); }
        .step-indicator-active { background-color: var(--bg-accent); color: var(--text-secondary); }
        .step-indicator-inactive { background-color: var(--bg-primary); color: var(--text-primary); opacity: 0.7; }
        .success-bg { background-color: rgba(104, 155, 138, 0.1); border-color: var(--bg-accent); }
        .track-item { background-color: var(--bg-primary); border-color: var(--border-color); }
        .track-item:hover { background-color: var(--bg-secondary); }
        .remove-btn { color: #ef4444; }
        .remove-btn:hover { background-color: rgba(239, 68, 68, 0.1); }
        .add-btn { border-color: var(--bg-accent); color: var(--text-primary); }
        .add-btn:hover { background-color: rgba(104, 155, 138, 0.1); }
      `}</style>

      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-auto">
        {showCelebration && (
          <>
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              colors={['#689B8A', '#F9CB99', '#F2EDD1', '#280A3E']}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div className="text-4xl font-bold text-white text-center p-8">
                🎉 Hurray! Event Created! 🎉
              </div>
            </motion.div>
          </>
        )}
        <div className="modal-content w-full max-w-4xl rounded-2xl border-2 shadow-themed-xl">
          <div className="p-6 border-b-2 border-themed">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">
                {isEdit ? 'Edit Event' : 'Create Event'}
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose} 
                  className="btn-secondary px-3 py-2 border-2 rounded transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-6">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-themed ${
                      i === step ? 'step-indicator-active' : 'step-indicator-inactive'
                    }`}>
                      {i + 1}
                    </div>
                    <div className={`text-sm ${i === step ? 'font-semibold text-primary' : 'text-primary opacity-70'}`}>
                      {s}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Host details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-primary">Name</label>
                    <input 
                      value={form.name} 
                      onChange={(e) => update({ name: e.target.value })} 
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">Email</label>
                    <input 
                      value={form.email} 
                      onChange={(e) => update({ email: e.target.value })} 
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">Aadhar number</label>
                    <input 
                      value={form.aadhar} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                        update({ aadhar: value });
                      }}
                      maxLength={12}
                      pattern="\d*"
                      inputMode="numeric"
                      placeholder="Enter 12-digit Aadhar number"
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">Organization</label>
                    <input 
                      value={form.organization} 
                      onChange={(e) => {
                        // Only allow letters and spaces
                        const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                        update({ organization: value });
                      }}
                      placeholder="Enter organization name"
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">Designation</label>
                    <input 
                      value={form.designation} 
                      onChange={(e) => update({ designation: e.target.value })} 
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Event details</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-primary">Event Type</label>
                    <select 
                      value={form.eventType} 
                      onChange={(e) => update({ eventType: e.target.value })}
                      className="input-field mt-1 w-full border-2 p-3 rounded"
                    >
                      <option value="event">Event</option>
                      <option value="hackathon">Hackathon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">Title (required)</label>
                    <input 
                      value={form.eventTitle} 
                      onChange={(e) => update({ eventTitle: e.target.value })} 
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                      maxLength={100} 
                    />
                    <div className="text-xs text-primary opacity-60 mt-1">{(form.eventTitle || '').length}/100</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">Description</label>
                    <textarea 
                      value={form.eventDescription} 
                      onChange={(e) => update({ eventDescription: e.target.value })} 
                      className="input-field mt-1 w-full border-2 p-3 rounded" 
                      rows={4} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-primary">Start date</label>
                      <input 
                        type="date" 
                        value={form.startDate} 
                        onChange={(e) => update({ startDate: e.target.value })} 
                        className="input-field mt-1 w-full border-2 p-3 rounded" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary">End date</label>
                      <input 
                        type="date" 
                        value={form.endDate} 
                        onChange={(e) => update({ endDate: e.target.value })} 
                        className="input-field mt-1 w-full border-2 p-3 rounded" 
                      />
                    </div>
                  </div>

                  {form.eventType === 'hackathon' ? (
                    <div className="space-y-6 border-t-2 border-themed pt-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-md font-semibold text-primary">🚀 Hackathon Details</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary">Mode</label>
                          <select
                            value={form.hackathonMode}
                            onChange={(e) => update({ hackathonMode: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          >
                            <option value="offline">Offline</option>
                            <option value="online">Online</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Eligibility</label>
                          <select
                            value={form.eligibility}
                            onChange={(e) => update({ eligibility: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          >
                            <option value="open">Open for All</option>
                            <option value="students">Students Only</option>
                            <option value="professionals">Professionals Only</option>
                            <option value="college">College Students</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">
                            {form.hackathonMode !== 'online' ? 'Venue / Location' : 'Platform Link'}
                          </label>
                          <input
                            type="text"
                            value={form.venue}
                            onChange={(e) => update({ venue: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder={form.hackathonMode !== 'online' ? 'Enter venue address' : 'Enter platform/meeting link'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Start Time</label>
                          <input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => update({ startTime: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">End Time</label>
                          <input
                            type="time"
                            value={form.endTime}
                            onChange={(e) => update({ endTime: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Registration Deadline</label>
                          <input
                            type="date"
                            value={form.registrationDeadline}
                            onChange={(e) => update({ registrationDeadline: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Expected Participants</label>
                          <input
                            type="number"
                            value={form.maxParticipants}
                            onChange={(e) => update({ maxParticipants: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder="Maximum number of participants"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Minimum Team Size</label>
                          <input
                            type="number"
                            value={form.minTeamSize}
                            onChange={(e) => update({ minTeamSize: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder="Minimum members per team"
                            min="1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Maximum Team Size</label>
                          <input
                            type="number"
                            value={form.maxTeamSize}
                            onChange={(e) => update({ maxTeamSize: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder="Maximum members per team"
                            min="1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">Themes / Problem Statements</label>
                          <textarea
                            value={form.themes}
                            onChange={(e) => update({ themes: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            rows={3}
                            placeholder="Enter the themes or problem statements for the hackathon"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">Tracks / Categories</label>
                          <div className="mt-1 space-y-2">
                            {(form.tracks || []).map((track, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={track}
                                  onChange={(e) => {
                                    const newTracks = [...(form.tracks || [])];
                                    newTracks[index] = e.target.value;
                                    update({ tracks: newTracks });
                                  }}
                                  className="track-item flex-1 border-2 p-3 rounded"
                                  placeholder="Enter track name"
                                />
                                <button
                                  onClick={() => {
                                    const newTracks = form.tracks.filter((_, i) => i !== index);
                                    update({ tracks: newTracks });
                                  }}
                                  className="remove-btn p-2 hover:bg-red-50 rounded"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => update({ tracks: [...(form.tracks || []), ''] })}
                              className="add-btn px-4 py-2 text-sm border-2 rounded transition-colors"
                            >
                              + Add Track
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">Submission Guidelines</label>
                          <textarea
                            value={form.submissionGuidelines}
                            onChange={(e) => update({ submissionGuidelines: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            rows={3}
                            placeholder="Specify format, deadline, and submission platform details"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">Evaluation Criteria</label>
                          <textarea
                            value={form.evaluationCriteria}
                            onChange={(e) => update({ evaluationCriteria: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            rows={3}
                            placeholder="Describe how projects will be evaluated"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">Prize Details</label>
                          <textarea
                            value={form.prizeDetails}
                            onChange={(e) => update({ prizeDetails: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            rows={3}
                            placeholder="Specify prizes, cash rewards, goodies, internship opportunities, etc."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={form.participationCertificates}
                              onChange={(e) => update({ participationCertificates: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-primary">Provide Participation Certificates</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 border-t-2 border-themed pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-md font-semibold text-primary">🎉 Event Details</h4>
                        <span className="text-xs text-primary opacity-60">Conference, Workshop, Meetup, etc.</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary">Event Category</label>
                          <select
                            value={form.eventCategory}
                            onChange={(e) => update({ eventCategory: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          >
                            <option value="">Select category</option>
                            <option value="conference">Conference</option>
                            <option value="workshop">Workshop</option>
                            <option value="seminar">Seminar</option>
                            <option value="meetup">Meetup</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Mode</label>
                          <select
                            value={form.eventMode}
                            onChange={(e) => update({ eventMode: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          >
                            <option value="offline">Offline</option>
                            <option value="online">Online</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-primary">
                            {form.eventMode !== 'online' ? 'Venue / Location' : 'Platform Link'}
                          </label>
                          <input
                            type="text"
                            value={form.venue}
                            onChange={(e) => update({ venue: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder={form.eventMode !== 'online' ? 'Enter venue address' : 'Enter platform/meeting link'}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Start Time</label>
                          <input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => update({ startTime: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">End Time</label>
                          <input
                            type="time"
                            value={form.endTime}
                            onChange={(e) => update({ endTime: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Registration Deadline</label>
                          <input
                            type="date"
                            value={form.registrationDeadline}
                            onChange={(e) => update({ registrationDeadline: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Registration Fee (₹)</label>
                          <input
                            type="number"
                            value={form.registrationFee}
                            onChange={(e) => update({ registrationFee: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder="Leave empty if free"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-primary">Expected Participants</label>
                          <input
                            type="number"
                            value={form.maxParticipants}
                            onChange={(e) => update({ maxParticipants: e.target.value })}
                            className="input-field mt-1 w-full border-2 p-3 rounded"
                            placeholder="Maximum number of participants"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Mentors & Judges</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary">Number of mentors</label>
                    <input 
                      type="number" 
                      value={form.numberOfMentors || 0} 
                      onChange={(e) => update({ numberOfMentors: Number(e.target.value) })} 
                      min={0} 
                      className="input-field mt-1 w-40 border-2 p-3 rounded" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">Select Authorized Judges</label>
                    {judgesLoading ? (
                      <div className="text-sm text-primary opacity-60">Loading judges...</div>
                    ) : availableJudges.length === 0 ? (
                      <div className="text-sm text-primary opacity-60">No judges available. Judges need to be created first.</div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-themed rounded p-3 bg-primary">
                        {availableJudges.map((judge) => (
                          <label key={judge.email} className="flex items-center gap-3 p-2 hover:bg-secondary rounded">
                            <input
                              type="checkbox"
                              checked={form.selectedJudges.includes(judge.email)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const currentJudges = form.selectedJudges || [];
                                if (isChecked) {
                                  update({ selectedJudges: [...currentJudges, judge.email] });
                                } else {
                                  update({ selectedJudges: currentJudges.filter(email => email !== judge.email) });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-primary">{judge.name}</div>
                              <div className="text-xs text-primary opacity-60">{judge.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-primary opacity-60 mt-2">
                      Selected: {form.selectedJudges?.length || 0} judges. Only selected judges will be allowed to sign in for this event.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">Confirmation</h3>
                <div className="space-y-2 text-primary">
                  <p><strong>Host:</strong> {form.name} • {form.email}</p>
                  <p><strong>Organization:</strong> {form.organization} • {form.designation}</p>
                  <hr className="border-themed" />
                  <p><strong>Type:</strong> {form.eventType === 'hackathon' ? 'Hackathon' : 'Event'}</p>
                  <p><strong>Title:</strong> {form.eventTitle}</p>
                  <p><strong>Description:</strong> {form.eventDescription}</p>
                  <p><strong>Dates:</strong> {form.startDate || '—'} to {form.endDate || '—'}</p>
                  <p><strong>Mentors:</strong> {form.numberOfMentors || 0}</p>
                  
                  {form.eventType === 'hackathon' ? (
                    <>
                      <p><strong>Mode:</strong> {form.hackathonMode ? form.hackathonMode.charAt(0).toUpperCase() + form.hackathonMode.slice(1) : '—'}</p>
                      <p><strong>Eligibility:</strong> {form.eligibility ? form.eligibility.charAt(0).toUpperCase() + form.eligibility.slice(1) : '—'}</p>
                      <p><strong>Location/Venue:</strong> {form.venue || '—'}</p>
                      <p><strong>Timing:</strong> {form.startTime || '—'} to {form.endTime || '—'}</p>
                      <p><strong>Registration Deadline:</strong> {form.registrationDeadline || '—'}</p>
                      <p><strong>Team Size:</strong> {form.minTeamSize || '—'} to {form.maxTeamSize || '—'} members</p>
                      <p><strong>Expected Participants:</strong> {form.maxParticipants || '—'}</p>
                      <p><strong>Themes/Problem Statements:</strong> {form.themes || '—'}</p>
                      {form.tracks && form.tracks.length > 0 && (
                        <div>
                          <p><strong>Tracks/Categories:</strong></p>
                          <ul className="ml-5 list-disc">
                            {form.tracks.map((track, index) => (
                              <li key={index}>{track}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p><strong>Submission Guidelines:</strong> {form.submissionGuidelines || '—'}</p>
                      <p><strong>Evaluation Criteria:</strong> {form.evaluationCriteria || '—'}</p>
                      <p><strong>Prize Details:</strong> {form.prizeDetails || '—'}</p>
                      <p><strong>Participation Certificates:</strong> {form.participationCertificates ? 'Yes' : 'No'}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Event Category:</strong> {form.eventCategory ? form.eventCategory.charAt(0).toUpperCase() + form.eventCategory.slice(1) : '—'}</p>
                      <p><strong>Mode:</strong> {form.eventMode ? form.eventMode.charAt(0).toUpperCase() + form.eventMode.slice(1) : '—'}</p>
                      <p><strong>Location/Venue:</strong> {form.venue || '—'}</p>
                      <p><strong>Timing:</strong> {form.startTime || '—'} to {form.endTime || '—'}</p>
                      <p><strong>Registration Deadline:</strong> {form.registrationDeadline || '—'}</p>
                      <p><strong>Registration Fee:</strong> {form.registrationFee ? `₹${form.registrationFee}` : 'Free'}</p>
                      <p><strong>Expected Participants:</strong> {form.maxParticipants || '—'}</p>
                    </>
                  )}
                  {form.selectedJudges?.length > 0 && (
                    <div>
                      <p><strong>Authorized judges:</strong></p>
                      <div className="ml-4 text-sm">
                        {form.selectedJudges.map(email => {
                          const judge = availableJudges.find(j => j.email === email);
                          return (
                            <div key={email} className="flex justify-between">
                              <span>{judge?.name || 'Unknown'}</span>
                              <span className="text-primary opacity-60">{email}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {createdEvent?.eventCode ? (
                    <div className="success-bg mt-3 p-3 border-2 rounded">
                      <div className="text-sm text-primary opacity-70">Event Code</div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-primary">{createdEvent.eventCode}</div>
                        <button 
                          onClick={() => { navigator.clipboard?.writeText(createdEvent.eventCode); }} 
                          className="btn-secondary px-2 py-1 border-2 rounded text-sm"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="text-xs text-primary opacity-60">Share this code with judges so they can sign in to this event.</div>
                    </div>
                  ) : (
                    <div className="mt-3 text-sm text-primary opacity-60">The event code will be generated after creation.</div>
                  )}
                </div>
              </div>
            )}

            {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
            {success && <div className="text-sm text-green-600 mt-4">{success}</div>}

            <div className="mt-6 flex items-center justify-between">
              <div>
                <button 
                  onClick={onClose} 
                  className="btn-secondary px-4 py-2 border-2 rounded mr-2"
                >
                  Cancel
                </button>
                {step > 0 && (
                  <button 
                    onClick={goBack} 
                    className="btn-secondary px-4 py-2 border-2 rounded"
                  >
                    Back
                  </button>
                )}
              </div>
              <div>
                {step < steps.length - 1 && (
                  <button 
                    onClick={goNext} 
                    className="btn-primary px-4 py-2 border-2 rounded"
                  >
                    Next
                  </button>
                )}
                {step === steps.length - 1 && (
                  <motion.button
                    onClick={submit}
                    disabled={loading || createdEvent}
                    className={`px-4 py-2 rounded border-2 border-themed transition-all ${
                      createdEvent 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'btn-primary hover:opacity-90 active:transform active:scale-95'
                    }`}
                    whileHover={{ scale: createdEvent ? 1 : 1.02 }}
                    whileTap={{ scale: createdEvent ? 1 : 0.98 }}
                  >
                    {loading ? 'Creating...' : createdEvent ? 'Event Created!' : (isEdit ? 'Update Event' : 'Create Event')}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEventWizard;
