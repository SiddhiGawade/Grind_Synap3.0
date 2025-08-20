import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Confetti from "react-confetti";
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, Copy, Share2, CheckCircle, ExternalLink } from 'lucide-react';
import emailjs from '@emailjs/browser';

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
  mentorEmails: [], // NEW: store mentor emails
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
        mentorEmails: Array.isArray(event.mentorEmails) ? event.mentorEmails : [],
        selectedJudges: Array.isArray(event.authorizedJudges) ? event.authorizedJudges : []
      }));
    }
  }, [isEdit, event]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState(null);
  // const [showCelebration, setShowCelebration] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [approvalLetterFile, setApprovalLetterFile] = useState(null);
  const [approvalLetterPreview, setApprovalLetterPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isApprovalDragOver, setIsApprovalDragOver] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  // Supabase storage client (optional)
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  let supabase = null;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try { supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch(e) { supabase = null; }
  }

  // Updated sendEmailToJudges function to match your EmailJS template
  const sendEmailToJudges = async (judges, eventCode, eventDetails) => {
    console.log('Starting email sending process...', { judges, eventCode });
    
    const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.replace(/['"]/g, '');
    const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.replace(/['"]/g, '');
    const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.replace(/['"]/g, '');

    console.log('EmailJS Config:', { 
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      hasPublicKey: !!EMAILJS_PUBLIC_KEY
    });

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('Missing EmailJS configuration!');
      throw new Error('EmailJS configuration missing');
    }

    try {
      // Initialize EmailJS with public key
      console.log('Initializing EmailJS...');
      emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY,
        // Limit rate to prevent spam
        limitRate: {
          throttle: 10000, // 10 seconds between requests
        },
      });

      // Test EmailJS configuration first
      console.log('Testing EmailJS configuration...');
      
      // Send email to each judge
      console.log('Preparing to send emails to judges...');
      const emailPromises = judges.map(async judgeEmail => {
        // Get judge name from availableJudges list
        const judge = availableJudges.find(j => j.email === judgeEmail);
        const judgeName = judge ? judge.name : judgeEmail.split('@')[0];

        // EmailJS template parameters matching your template format
        const templateParams = {
          // Core EmailJS template parameters
          to_email: judgeEmail,
          to_name: judgeName,
          from_name: eventDetails.name,
          reply_to: eventDetails.email,
          
          // Template-specific parameters (matching your template exactly)
          event_name: eventDetails.eventTitle,  // For {{event_name}}
          event_code: eventCode,  // For {{event_code}}
          event_date: eventDetails.startDate && eventDetails.endDate 
            ? `${eventDetails.startDate} to ${eventDetails.endDate}`
            : eventDetails.startDate || 'TBA',  // For {{event_date}}
          host_name: eventDetails.name,  // For {{host_name}}
          host_email: eventDetails.email  // For {{host_email}}
        };

        console.log('Sending email to:', judgeEmail, 'with params:', templateParams);
        console.log('Using service:', EMAILJS_SERVICE_ID, 'template:', EMAILJS_TEMPLATE_ID);
        console.log('Event details received:', {
          eventTitle: eventDetails.eventTitle,
          eventCode: eventCode,
          startDate: eventDetails.startDate,
          endDate: eventDetails.endDate,
          hostName: eventDetails.name,
          hostEmail: eventDetails.email
        });
        
        try {
          const result = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
          );
          console.log('Email sent successfully to:', judgeEmail, result);
          return result;
        } catch (emailError) {
          console.error('Failed to send email to:', judgeEmail, emailError);
          // Log more details about the error
          console.error('Error details:', {
            status: emailError.status,
            text: emailError.text,
            message: emailError.message,
            templateParams: templateParams,
            serviceId: EMAILJS_SERVICE_ID,
            templateId: EMAILJS_TEMPLATE_ID
          });
          throw emailError;
        }
      });

      const results = await Promise.all(emailPromises);
      console.log('✅ Successfully sent emails to all judges:', results);
      return results;
    } catch (error) {
      console.error('Failed to send emails:', error);
      throw error;
    }
  };

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
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
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
      // Mentor email validation
      if (n > 0) {
        if (!form.mentorEmails || form.mentorEmails.length !== n) {
          return `Please enter ${n} mentor email${n > 1 ? 's' : ''}`;
        }
        for (let i = 0; i < n; i++) {
          const email = (form.mentorEmails[i] || '').trim();
          if (!email) return `Mentor ${i + 1} email is required`;
          if (!/^[^@]+@gmail\.com$/.test(email)) return `Mentor ${i + 1} must be a valid gmail.com address`;
        }
      }
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
      // Build payload
      const payload = { ...form };
      if (Array.isArray(form.selectedJudges)) {
        payload.authorizedJudges = form.selectedJudges;
      } else {
        payload.authorizedJudges = [];
      }
      delete payload.selectedJudges;
      
      if (Array.isArray(form.mentorEmails)) {
        payload.mentorEmails = form.mentorEmails;
      }

      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const url = isEdit ? `${API_BASE}/api/events/${event.id}` : `${API_BASE}/api/events`;
      const method = isEdit ? 'PUT' : 'POST';

      // Handle image upload
      if (supabase && imageFile) {
        try {
          console.log('🖼️ Starting Supabase image upload...');
          const bucket = 'event-images';
          const filename = `${Date.now()}_${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filename, imageFile, { cacheControl: '3600', upsert: false });
          
          if (uploadError) {
            console.error('❌ Supabase storage upload failed:', uploadError);
            setError(`Image upload failed: ${uploadError.message}`);
          } else {
            console.log('✅ Upload successful:', uploadData);
            const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
            payload.image_url = publicData?.publicUrl || null;
          }
        } catch (e) {
          console.error('💥 Supabase image upload exception:', e);
          setError(`Image upload error: ${e.message}`);
        }
      } else if (imageFile) {
        // Fallback: include base64 if Supabase not configured
        const toBase64 = (file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        try {
          const b64 = await toBase64(imageFile);
          payload.imageBase64 = b64;
          payload.imageFilename = imageFile.name;
        } catch (e) {
          console.warn('Failed to convert image to base64', e);
        }
      }

      // Create/update event
      console.log('Sending request:', { url, method, payload });
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json().catch(() => ({}));
      console.log('Response:', { status: res.status, data });
      setLoading(false);
      
      if (!res.ok) {
        console.error('Request failed:', { status: res.status, error: data.error });
        return setError(data.error || (isEdit ? 'Failed to update event' : 'Failed to create event'));
      }
      
      const createdEventData = data.event || null;
      setCreatedEvent(createdEventData);
      
      // Send emails to judges if we have authorized judges
      if (createdEventData && Array.isArray(form.selectedJudges) && form.selectedJudges.length > 0) {
        try {
          console.log('Attempting to send emails to judges:', form.selectedJudges);
          await sendEmailToJudges(form.selectedJudges, createdEventData.eventCode, {
            ...form,
            ...createdEventData
          });
          setSuccess(isEdit ? 'Event updated successfully and notification emails sent to judges!' : 'Event created successfully and notification emails sent to judges!');
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          setSuccess('Event created successfully but failed to send notification emails to judges');
          setError('Failed to send emails to judges: ' + (emailError.message || 'Unknown error'));
        }
      } else {
        setSuccess(data.message || (isEdit ? 'Event updated successfully' : 'Event created successfully'));
      }

      // Show celebration animation
      // setShowCelebration(true);
      // setTimeout(() => setShowCelebration(false), 5000);
      
      if (onCreated) {
        try { onCreated(createdEventData); } catch (e) {}
      }
      
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
        {/* Celebration animation removed */}
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
                  {/* Enhanced Image upload for event card */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">Event Image (optional)</label>
                    
                    {!imagePreview ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                          isDragOver 
                            ? 'border-accent bg-accent/10 border-solid' 
                            : 'border-themed hover:border-accent hover:bg-accent/5'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          const files = e.dataTransfer.files;
                          if (files && files[0] && files[0].type.startsWith('image/')) {
                            const f = files[0];
                            setImageFile(f);
                            try { setImagePreview(URL.createObjectURL(f)); } catch(e) {}
                          }
                        }}
                        onClick={() => document.getElementById('image-upload').click()}
                      >
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                              setImageFile(f);
                              try { setImagePreview(URL.createObjectURL(f)); } catch(e) {}
                            } else {
                              setImageFile(null);
                              setImagePreview(null);
                            }
                          }}
                          className="hidden"
                        />
                        
                        <div className="flex flex-col items-center gap-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                            isDragOver ? 'bg-accent text-secondary' : 'bg-secondary border-2 border-themed'
                          }`}>
                            <Upload className="w-8 h-8" />
                          </div>
                          
                          <div>
                            <p className="text-lg font-semibold text-primary mb-1">
                              {isDragOver ? 'Drop your image here' : 'Drop files here, or click below!'}
                            </p>
                            <p className="text-sm text-primary opacity-60 mb-3">
                              Upload an image that represents the event
                            </p>
                            
                            <button
                              type="button"
                              className="btn-primary px-6 py-2 rounded-lg border-2 font-medium inline-flex items-center gap-2 hover:shadow-themed transition-all"
                            >
                              <Upload className="w-4 h-4" />
                              Choose File
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs text-primary opacity-50">
                          Supported formats: JPG, PNG, GIF • Max size: 2MB
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="bg-secondary border-2 border-themed rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <img 
                              src={imagePreview} 
                              alt="Event preview" 
                              className="w-32 h-24 object-cover rounded-lg border-2 border-themed shadow-themed"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="w-5 h-5 text-accent" />
                                <span className="font-medium text-primary">
                                  {imageFile?.name || 'Event Image'}
                                </span>
                              </div>
                              <p className="text-sm text-primary opacity-60 mb-3">
                                {imageFile?.size ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : 'Image uploaded'}
                              </p>
                              <button
                                type="button"
                                onClick={() => document.getElementById('image-upload').click()}
                                className="btn-secondary px-4 py-1 rounded border-2 text-sm font-medium hover:bg-secondary transition-colors"
                              >
                                Change Image
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="p-1 rounded-full hover:bg-red-100 transition-colors"
                              title="Remove image"
                            >
                              <X className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                              setImageFile(f);
                              try { setImagePreview(URL.createObjectURL(f)); } catch(e) {}
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Event Approval Letter upload */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">Event Approval Letter</label>
                    
                    {!approvalLetterPreview ? (
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                          isApprovalDragOver 
                            ? 'border-accent bg-accent/10 border-solid' 
                            : 'border-themed hover:border-accent hover:bg-accent/5'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsApprovalDragOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsApprovalDragOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsApprovalDragOver(false);
                          const files = e.dataTransfer.files;
                          if (files && files[0] && files[0].type.startsWith('image/')) {
                            const f = files[0];
                            setApprovalLetterFile(f);
                            try { setApprovalLetterPreview(URL.createObjectURL(f)); } catch(e) {}
                          }
                        }}
                        onClick={() => document.getElementById('approval-letter-upload').click()}
                      >
                        <input
                          id="approval-letter-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                              setApprovalLetterFile(f);
                              try { setApprovalLetterPreview(URL.createObjectURL(f)); } catch(e) {}
                            } else {
                              setApprovalLetterFile(null);
                              setApprovalLetterPreview(null);
                            }
                          }}
                          className="hidden"
                        />
                        
                        <div className="flex flex-col items-center gap-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                            isApprovalDragOver ? 'bg-accent text-secondary' : 'bg-secondary border-2 border-themed'
                          }`}>
                            <Upload className="w-8 h-8" />
                          </div>
                          
                          <div>
                            <p className="text-lg font-semibold text-primary mb-1">
                              {isApprovalDragOver ? 'Drop your approval letter here' : 'Drop approval letter here, or click below!'}
                            </p>
                            <p className="text-sm text-primary opacity-60 mb-3">
                              Upload the official approval letter for this event
                            </p>
                            
                            <button
                              type="button"
                              className="btn-primary px-6 py-2 rounded-lg border-2 font-medium inline-flex items-center gap-2 hover:shadow-themed transition-all"
                            >
                              <Upload className="w-4 h-4" />
                              Choose File
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs text-primary opacity-50">
                          Supported formats: JPG, PNG, PDF • Max size: 5MB
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="bg-secondary border-2 border-themed rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <img 
                              src={approvalLetterPreview} 
                              alt="Approval letter preview" 
                              className="w-32 h-24 object-cover rounded-lg border-2 border-themed shadow-themed"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Image className="w-5 h-5 text-accent" />
                                <span className="font-medium text-primary">
                                  {approvalLetterFile?.name || 'Approval Letter'}
                                </span>
                              </div>
                              <p className="text-sm text-primary opacity-60 mb-3">
                                {approvalLetterFile?.size ? `${(approvalLetterFile.size / 1024 / 1024).toFixed(2)} MB` : 'Document uploaded'}
                              </p>
                              <button
                                type="button"
                                onClick={() => document.getElementById('approval-letter-upload').click()}
                                className="btn-secondary px-4 py-1 rounded border-2 text-sm font-medium hover:bg-secondary transition-colors"
                              >
                                Change Document
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setApprovalLetterFile(null);
                                setApprovalLetterPreview(null);
                              }}
                              className="p-1 rounded-full hover:bg-red-100 transition-colors"
                              title="Remove approval letter"
                            >
                              <X className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        <input
                          id="approval-letter-upload"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                              setApprovalLetterFile(f);
                              if (f.type.startsWith('image/')) {
                                try { setApprovalLetterPreview(URL.createObjectURL(f)); } catch(e) {}
                              } else {
                                setApprovalLetterPreview('/api/placeholder/document-preview');
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
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
                      onChange={(e) => {
                        const n = Math.max(0, Number(e.target.value));
                        // Adjust mentorEmails array length
                        let mentorEmails = form.mentorEmails || [];
                        if (n > mentorEmails.length) {
                          mentorEmails = [...mentorEmails, ...Array(n - mentorEmails.length).fill('')];
                        } else if (n < mentorEmails.length) {
                          mentorEmails = mentorEmails.slice(0, n);
                        }
                        update({ numberOfMentors: n, mentorEmails });
                      }} 
                      min={0} 
                      className="input-field mt-1 w-40 border-2 p-3 rounded" 
                    />
                  </div>
                  {/* Mentor email inputs */}
                  {form.numberOfMentors > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2">Mentor Emails (gmail.com only)</label>
                      <div className="space-y-2">
                        {Array.from({ length: form.numberOfMentors }).map((_, i) => (
                          <input
                            key={i}
                            type="email"
                            value={form.mentorEmails[i] || ''}
                            onChange={e => {
                              const mentorEmails = [...(form.mentorEmails || [])];
                              mentorEmails[i] = e.target.value;
                              update({ mentorEmails });
                            }}
                            className="input-field w-full border-2 p-3 rounded"
                            placeholder={`Mentor ${i + 1} gmail.com address`}
                            pattern="^[^@]+@gmail\.com$"
                          />
                        ))}
                      </div>
                      <div className="text-xs text-primary opacity-60 mt-1">
                        Please enter valid gmail.com addresses for all mentors.
                      </div>
                    </div>
                  )}
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
              <div className="space-y-6">
                {createdEvent ? (
                  <div className="text-center">
                    {/* Success Animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="mb-6"
                    >
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-500">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                      </div>
                    </motion.div>

                    {/* Congratulations Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8"
                    >
                      <h2 className="text-3xl font-black text-primary mb-2">🎉 Congratulations! 🎉</h2>
                      <p className="text-xl text-primary mb-4">Your event has been successfully created!</p>
                      <div className="bg-secondary border-2 border-themed rounded-xl p-4 mb-6">
                        <h3 className="text-lg font-bold text-primary mb-2">{form.eventTitle}</h3>
                        <p className="text-sm text-primary opacity-70">{form.eventDescription}</p>
                      </div>
                    </motion.div>

                    {/* Event Code Section */}
                    {createdEvent?.eventCode && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-accent/10 border-2 border-accent rounded-xl p-6 mb-6"
                      >
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Share2 className="w-5 h-5 text-accent" />
                          <h4 className="text-lg font-bold text-primary">Event Code</h4>
                        </div>
                        <div className="bg-white border-2 border-themed rounded-lg p-4 mb-4">
                          <div className="text-3xl font-black text-primary text-center mb-2">
                            {createdEvent.eventCode}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(createdEvent.eventCode);
                                setCopySuccess('Event code copied!');
                                setTimeout(() => setCopySuccess(''), 2000);
                              }}
                              className="btn-primary px-4 py-2 rounded-lg border-2 font-medium inline-flex items-center gap-2 hover:shadow-themed transition-all"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </button>
                          </div>
                          {copySuccess && (
                            <div className="text-sm text-green-600 text-center mt-2">{copySuccess}</div>
                          )}
                        </div>
                        <p className="text-sm text-primary opacity-70 text-center">
                          Share this code with judges so they can access this event
                        </p>
                      </motion.div>
                    )}

                    {/* Shareable Link Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-secondary border-2 border-themed rounded-xl p-6 mb-6"
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <ExternalLink className="w-5 h-5 text-accent" />
                        <h4 className="text-lg font-bold text-primary">Shareable Link</h4>
                      </div>
                      <div className="bg-white border-2 border-themed rounded-lg p-4 mb-4">
                        <div className="text-sm text-primary mb-2 break-all">
                          {`${window.location.origin}/event/${createdEvent?.eventCode || 'EVENT_CODE'}`}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const shareLink = `${window.location.origin}/event/${createdEvent?.eventCode || 'EVENT_CODE'}`;
                              navigator.clipboard?.writeText(shareLink);
                              setCopySuccess('Link copied!');
                              setTimeout(() => setCopySuccess(''), 2000);
                            }}
                            className="btn-secondary px-4 py-2 rounded-lg border-2 font-medium inline-flex items-center gap-2 hover:bg-secondary transition-all"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Link
                          </button>
                          <button
                            onClick={() => {
                              const shareLink = `${window.location.origin}/event/${createdEvent?.eventCode || 'EVENT_CODE'}`;
                              if (navigator.share) {
                                navigator.share({
                                  title: form.eventTitle,
                                  text: `Join my event: ${form.eventTitle}`,
                                  url: shareLink,
                                });
                              } else {
                                // Fallback for browsers that don't support Web Share API
                                window.open(`https://wa.me/?text=${encodeURIComponent(`Join my event: ${form.eventTitle} - ${shareLink}`)}`, '_blank');
                              }
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg border-2 border-green-600 font-medium inline-flex items-center gap-2 hover:bg-green-600 transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                        {copySuccess && (
                          <div className="text-sm text-green-600 text-center mt-2">{copySuccess}</div>
                        )}
                      </div>
                      <p className="text-sm text-primary opacity-70 text-center">
                        Anyone with this link can view and register for your event
                      </p>
                    </motion.div>

                    {/* Event Details Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="bg-primary border-2 border-themed rounded-xl p-6 text-left"
                    >
                      <h4 className="text-lg font-bold text-primary mb-4 text-center">Event Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Host:</strong> {form.name}</p>
                          <p><strong>Email:</strong> {form.email}</p>
                          <p><strong>Organization:</strong> {form.organization || 'Not specified'}</p>
                        </div>
                        <div>
                          <p><strong>Type:</strong> {form.eventType === 'hackathon' ? 'Hackathon' : 'Event'}</p>
                          <p><strong>Dates:</strong> {form.startDate || '—'} to {form.endDate || '—'}</p>
                          <p><strong>Mentors:</strong> {form.numberOfMentors || 0}</p>
                        </div>
                      </div>
                      {form.selectedJudges?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-themed">
                          <p className="font-medium mb-2">Authorized Judges ({form.selectedJudges.length}):</p>
                          <div className="text-xs space-y-1">
                            {form.selectedJudges.slice(0, 3).map(email => {
                              const judge = availableJudges.find(j => j.email === email);
                              return (
                                <div key={email} className="flex justify-between">
                                  <span>{judge?.name || 'Unknown'}</span>
                                  <span className="opacity-60">{email}</span>
                                </div>
                              );
                            })}
                            {form.selectedJudges.length > 3 && (
                              <div className="text-center opacity-60">+{form.selectedJudges.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-4">Review Your Event Details</h3>
                    <div className="space-y-2 text-primary text-sm">
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

                      {!createdEvent && form.selectedJudges?.length > 0 && (
                        <div className="mt-4">
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
                      {!createdEvent && (
                        <div className="mt-3 text-sm text-primary opacity-60">The event code will be generated after creation.</div>
                      )}
                    </div>
                  </div>
                )}
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


