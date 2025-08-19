import React, { useState, useEffect } from 'react';

// Clean 3-step wizard without image upload
const steps = ['Host details', 'Event details', 'Confirmation'];

const initialForm = (prefill = {}) => ({
  name: prefill.name || '',
  email: prefill.email || '',
  aadhar: '',
  organization: '',
  designation: '',
  eventTitle: '',
  eventDescription: '',
  startDate: '',
  endDate: ''
});

const CreateEventWizard = ({ onClose, prefill = {}, onCreated }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm(prefill));
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {};
  }, []);

  const update = (patch) => setForm((s) => ({ ...s, ...patch }));

  const validateStep = () => {
    setError(null);
    if (step === 0) {
      if (!form.name.trim()) return 'Name is required';
      if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return 'Valid email is required';
      if (!form.aadhar.trim()) return 'Aadhar number is required';
      return null;
    }
    if (step === 1) {
      if (!form.eventTitle.trim()) return 'Event title is required';
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
      const payload = { ...form };
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Failed to create event');
      setSuccess(data.message || 'Event created successfully');
      setTimeout(() => {
        if (onCreated) try { onCreated(data.event || null); } catch (e) {}
        onClose && onClose();
      }, 700);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Network error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-auto">
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
                  <input value={form.aadhar} onChange={(e) => update({ aadhar: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Organization</label>
                  <input value={form.organization} onChange={(e) => update({ organization: e.target.value })} className="mt-1 w-full border p-3 rounded bg-[#fafafa]" />
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
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Confirmation</h3>
              <div className="space-y-2">
                <p><strong>Host:</strong> {form.name} • {form.email}</p>
                <p><strong>Organization:</strong> {form.organization} • {form.designation}</p>
                <hr />
                <p><strong>Title:</strong> {form.eventTitle}</p>
                <p><strong>Description:</strong> {form.eventDescription}</p>
                <p><strong>Dates:</strong> {form.startDate || '—'} to {form.endDate || '—'}</p>
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
              {step === steps.length - 1 && <button onClick={submit} disabled={loading} className="px-4 py-2 bg-[#4CAF50] text-white rounded">{loading ? 'Creating...' : 'Create Event'}</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventWizard;