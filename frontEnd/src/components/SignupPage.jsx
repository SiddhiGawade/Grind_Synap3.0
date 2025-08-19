import React, { useState } from 'react';
import { Users, Calendar, Trophy, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const SignupPage = ({ onNavigate }) => {
  const { signup, loading } = useAuth();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'participant'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Call signup from context
    setError(null);
    const res = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (res.ok) {
      onNavigate('signin');
    } else {
      setError(res.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFF4] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-pattern"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-16 w-32 h-32 bg-green-200 rounded-full opacity-20 blur-xl"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border-2 border-[#151616] shadow-[8px_8px_0px_0px_#151616]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D6F32F] rounded-2xl flex items-center justify-center border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] mx-auto mb-4">
              <Trophy className="w-8 h-8 text-[#151616]" />
            </div>
            <h1 className="text-2xl font-black text-[#151616] mb-2">Join SynapHack 3.0</h1>
            <p className="text-[#151616]/70">Create your account to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 p-2 rounded">
                {error}
              </div>
            )}
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#151616]/60" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#151616] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6F32F] focus:border-[#D6F32F]"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#151616]/60" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#151616] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6F32F] focus:border-[#D6F32F]"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">I want to join as</label>
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
                        ? 'bg-[#D6F32F] border-[#151616] shadow-[2px_2px_0px_0px_#151616]' 
                        : 'bg-white border-[#151616]/20 hover:border-[#151616]/40'
                    }`}>
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">{label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#151616]/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-[#151616] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6F32F] focus:border-[#D6F32F]"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-[#151616]/60" /> : <Eye className="w-5 h-5 text-[#151616]/60" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#151616]/60" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-[#151616] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6F32F] focus:border-[#D6F32F]"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 text-[#151616]/60" /> : <Eye className="w-5 h-5 text-[#151616]/60" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D6F32F] py-3 px-4 rounded-lg border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:shadow-[2px_2px_0px_0px_#151616] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-[#151616] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[#151616]/70">Already have an account?</p>
            <button
              onClick={() => onNavigate('signin')}
              className="text-[#151616] font-medium hover:underline"
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .bg-pattern {
          background-image: radial-gradient(#151616 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;