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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-auto">
      {showCelebration && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            colors={['#D6F32F', '#151616', '#4CAF50', '#FFC107']}
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
      <div className="w-full max-w-4xl bg-white rounded-2xl border-2 border-[#151616] shadow-[8px_8px_0px_0px_#151616]">
        <div className="p-6 border-b-2 border-[#efefef]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Create Event</h2>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="px-3 py-2 border rounded">Close</button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-6">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === step ? 'bg-[#D6F32F] text-[#151616]' : 'bg-[#151616]/10 text-[#151616]'}`}>{i + 1}</div>
                  <div className={`text-sm ${i === step ? 'font-semibold text-[#151616]' : 'text-[#151616]/70'}`}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Host details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input value={form.name} onChange={(e) => update({ name: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input value={form.email} onChange={(e) => update({ email: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Aadhar number</label>
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
                    className="mt-1 w-full border p-3 rounded bg-[#fafafa]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Organization</label>
                  <input 
                    value={form.organization} 
                    onChange={(e) => {
                      // Only allow letters and spaces
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      update({ organization: value });
                    }}
                    placeholder="Enter organization name"
                    className="mt-1 w-full border p-3 rounded bg-[#fafafa]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Designation</label>
                  <input value={form.designation} onChange={(e) => update({ designation: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Event details</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium">Event Type</label>
                  <select 
                    value={form.eventType} 
                    onChange={(e) => update({ eventType: e.target.value })}
                    className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                  >
                    <option value="event">Event</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Title (required)</label>
                  <input value={form.eventTitle} onChange={(e) => update({ eventTitle: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" maxLength={100} />
                  <div className="text-xs text-[#151616]/60 mt-1">{(form.eventTitle || '').length}/100</div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea value={form.eventDescription} onChange={(e) => update({ eventDescription: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" rows={4} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Start date</label>
                    <input type="date" value={form.startDate} onChange={(e) => update({ startDate: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">End date</label>
                    <input type="date" value={form.endDate} onChange={(e) => update({ endDate: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
                  </div>
                </div>

                {form.eventType === 'hackathon' ? (
                  <div className="space-y-6 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-md font-semibold">🚀 Hackathon Details</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Mode</label>
                        <select
                          value={form.hackathonMode}
                          onChange={(e) => update({ hackathonMode: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        >
                          <option value="offline">Offline</option>
                          <option value="online">Online</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Eligibility</label>
                        <select
                          value={form.eligibility}
                          onChange={(e) => update({ eligibility: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        >
                          <option value="open">Open for All</option>
                          <option value="students">Students Only</option>
                          <option value="professionals">Professionals Only</option>
                          <option value="college">College Students</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">
                          {form.hackathonMode !== 'online' ? 'Venue / Location' : 'Platform Link'}
                        </label>
                        <input
                          type="text"
                          value={form.venue}
                          onChange={(e) => update({ venue: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          placeholder={form.hackathonMode !== 'online' ? 'Enter venue address' : 'Enter platform/meeting link'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Start Time</label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) => update({ startTime: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">End Time</label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => update({ endTime: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Registration Deadline</label>
                        <input
                          type="date"
                          value={form.registrationDeadline}
                          onChange={(e) => update({ registrationDeadline: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Expected Participants</label>
                        <input
                          type="number"
                          value={form.maxParticipants}
                          onChange={(e) => update({ maxParticipants: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          placeholder="Maximum number of participants"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Minimum Team Size</label>
                        <input
                          type="number"
                          value={form.minTeamSize}
                          onChange={(e) => update({ minTeamSize: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          placeholder="Minimum members per team"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Maximum Team Size</label>
                        <input
                          type="number"
                          value={form.maxTeamSize}
                          onChange={(e) => update({ maxTeamSize: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          placeholder="Maximum members per team"
                          min="1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Themes / Problem Statements</label>
                        <textarea
                          value={form.themes}
                          onChange={(e) => update({ themes: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          rows={3}
                          placeholder="Enter the themes or problem statements for the hackathon"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Tracks / Categories</label>
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
                                className="flex-1 border p-3 rounded bg-[#fafafa]"
                                placeholder="Enter track name"
                              />
                              <button
                                onClick={() => {
                                  const newTracks = form.tracks.filter((_, i) => i !== index);
                                  update({ tracks: newTracks });
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => update({ tracks: [...(form.tracks || []), ''] })}
                            className="px-4 py-2 text-sm border border-[#D6F32F] rounded hover:bg-[#D6F32F]/10"
                          >
                            + Add Track
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Submission Guidelines</label>
                        <textarea
                          value={form.submissionGuidelines}
                          onChange={(e) => update({ submissionGuidelines: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          rows={3}
                          placeholder="Specify format, deadline, and submission platform details"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Evaluation Criteria</label>
                        <textarea
                          value={form.evaluationCriteria}
                          onChange={(e) => update({ evaluationCriteria: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          rows={3}
                          placeholder="Describe how projects will be evaluated"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Prize Details</label>
                        <textarea
                          value={form.prizeDetails}
                          onChange={(e) => update({ prizeDetails: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
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
                          <span className="text-sm font-medium">Provide Participation Certificates</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-md font-semibold">🎉 Event Details</h4>
                      <span className="text-xs text-[#151616]/60">Conference, Workshop, Meetup, etc.</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Event Category</label>
                        <select
                          value={form.eventCategory}
                          onChange={(e) => update({ eventCategory: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
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
                        <label className="block text-sm font-medium">Mode</label>
                        <select
                          value={form.eventMode}
                          onChange={(e) => update({ eventMode: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        >
                          <option value="offline">Offline</option>
                          <option value="online">Online</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">
                          {form.eventMode !== 'online' ? 'Venue / Location' : 'Platform Link'}
                        </label>
                        <input
                          type="text"
                          value={form.venue}
                          onChange={(e) => update({ venue: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          placeholder={form.eventMode !== 'online' ? 'Enter venue address' : 'Enter platform/meeting link'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Start Time</label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) => update({ startTime: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">End Time</label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => update({ endTime: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Registration Deadline</label>
                        <input
                          type="date"
                          value={form.registrationDeadline}
                          onChange={(e) => update({ registrationDeadline: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Registration Fee (₹)</label>
                        <input
                          type="number"
                          value={form.registrationFee}
                          onChange={(e) => update({ registrationFee: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
                          placeholder="Leave empty if free"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium">Expected Participants</label>
                        <input
                          type="number"
                          value={form.maxParticipants}
                          onChange={(e) => update({ maxParticipants: e.target.value })}
                          className="mt-1 w-full border p-3 rounded bg-[#fafafa]"
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
              <h3 className="text-lg font-bold">Mentors & Judges</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium">Number of mentors</label>
                  <input 
                    type="number" 
                    value={form.numberOfMentors || 0} 
                    onChange={(e) => update({ numberOfMentors: Number(e.target.value) })} 
                    min={0} 
                    className="mt-1 w-40 border p-3 rounded bg-[#fafafa]" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Select Authorized Judges</label>
                  {judgesLoading ? (
                    <div className="text-sm text-gray-500">Loading judges...</div>
                  ) : availableJudges.length === 0 ? (
                    <div className="text-sm text-gray-500">No judges available. Judges need to be created first.</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3 bg-[#fafafa]">
                      {availableJudges.map((judge) => (
                        <label key={judge.email} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
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
                            <div className="font-medium">{judge.name}</div>
                            <div className="text-xs text-gray-600">{judge.email}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-[#151616]/60 mt-2">
                    Selected: {form.selectedJudges?.length || 0} judges. Only selected judges will be allowed to sign in for this event.
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Confirmation</h3>
              <div className="space-y-2">
                <p><strong>Host:</strong> {form.name} • {form.email}</p>
                <p><strong>Organization:</strong> {form.organization} • {form.designation}</p>
                <hr />
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
                            <span className="text-gray-600">{email}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {createdEvent?.eventCode ? (
                  <div className="mt-3 p-3 border rounded bg-[#f7fff0]">
                    <div className="text-sm text-[#151616]/70">Event Code</div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">{createdEvent.eventCode}</div>
                      <button onClick={() => { navigator.clipboard?.writeText(createdEvent.eventCode); }} className="px-2 py-1 border rounded text-sm">Copy</button>
                    </div>
                    <div className="text-xs text-[#151616]/60">Share this code with judges so they can sign in to this event.</div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-[#151616]/60">The event code will be generated after creation.</div>
                )}
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
          {success && <div className="text-sm text-green-600 mt-4">{success}</div>}

          <div className="mt-6 flex items-center justify-between">
            <div>
              <button onClick={onClose} className="px-4 py-2 border rounded mr-2">Cancel</button>
              {step > 0 && <button onClick={goBack} className="px-4 py-2 border rounded">Back</button>}
            </div>
            <div>
              {step < steps.length - 1 && <button onClick={goNext} className="px-4 py-2 bg-[#D6F32F] border rounded">Next</button>}
              {step === steps.length - 1 && (
                <motion.button
                  onClick={submit}
                  disabled={loading || createdEvent}
                  className={`px-4 py-2 rounded transition-all ${
                    createdEvent 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#4CAF50] hover:bg-[#45a049] active:transform active:scale-95'
                  } text-white`}
                  whileHover={{ scale: createdEvent ? 1 : 1.02 }}
                  whileTap={{ scale: createdEvent ? 1 : 0.98 }}
                >
                  {loading ? 'Creating...' : createdEvent ? 'Event Created!' : 'Create Event'}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventWizard;