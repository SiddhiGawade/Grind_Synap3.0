import React, { useState } from 'react';
import { Users, Calendar, Trophy, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const SigninPage = ({ onNavigate }) => {
  const { signin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'participant',
    eventId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await signin({ email: formData.email, password: formData.password, role: formData.role, eventId: formData.eventId });
    if (res.ok) {
      onNavigate('dashboard');
    } else {
      setError(res.error || 'Signin failed');
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
        .btn-primary:hover { box-shadow: 2px 2px 0px 0px var(--shadow-color); }
        .input-field { background-color: var(--bg-primary); color: var(--text-primary); border-color: var(--border-color); }
        .input-field:focus { ring-color: var(--bg-accent); border-color: var(--bg-accent); }
        .form-container { background-color: var(--bg-secondary); border-color: var(--border-color); }
        .bg-pattern {
          background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .decorative-blob-1 {
          background-color: var(--bg-secondary);
          opacity: 0.3;
        }
        .decorative-blob-2 {
          background-color: var(--bg-accent);
          opacity: 0.3;
        }
      `}</style>

      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-pattern"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 decorative-blob-1 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-16 w-32 h-32 decorative-blob-2 rounded-full blur-xl"></div>

        <div className="relative w-full max-w-md">
          <div className="form-container p-8 rounded-2xl border-2 shadow-themed-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center border-2 border-themed shadow-themed-lg mx-auto mb-4">
                <Trophy className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="text-2xl font-black text-primary mb-2">Welcome Back!</h1>
              <p className="text-primary opacity-70">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
                  {error}
                </div>
              )}
              
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Login as</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'participant', label: 'Participant', icon: Users },
                    { value: 'organizer', label: 'Organizer', icon: Calendar },
                    { value: 'judge', label: 'Judge', icon: Trophy }
                  ].map(({ value, label, icon: Icon }) => (
                    <label key={value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={formData.role === value}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.role === value 
                          ? 'bg-accent text-secondary border-themed shadow-themed' 
                          : 'bg-primary text-primary border-themed opacity-60 hover:opacity-80'
                      }`}>
                        <Icon className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-xs font-medium">{label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary opacity-60" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="input-field w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary opacity-60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="input-field w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-primary opacity-60" /> : <Eye className="w-5 h-5 text-primary opacity-60" />}
                  </button>
                </div>
              </div>

              {/* Event ID for judges */}
              {formData.role === 'judge' && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">Event ID</label>
                  <input
                    type="text"
                    required
                    className="input-field w-full py-3 px-4 border-2 rounded-lg focus:outline-none focus:ring-2"
                    placeholder="Enter Event ID provided by organizer"
                    value={formData.eventId}
                    onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                  />
                  <div className="text-xs text-primary opacity-60 mt-2">
                    Judges must use the Event ID and credentials authorized by the event creator.
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={/* loading comes from context */ false}
                className="btn-primary w-full py-3 px-4 rounded-lg border-2 border-themed shadow-themed-lg hover:shadow-themed hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-primary opacity-70">Don't have an account?</p>
              <button
                onClick={() => onNavigate('signup')}
                className="text-primary font-medium hover:underline"
              >
                Create one here
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SigninPage;
