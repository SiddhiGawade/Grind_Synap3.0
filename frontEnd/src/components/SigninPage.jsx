import React, { useState } from 'react';
import { Users, Calendar, Trophy, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const SigninPage = ({ onNavigate }) => {
  const { login, setLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'participant'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      login({
        name: 'John Doe',
        email: formData.email,
        role: formData.role
      });
      setLoading(false);
      onNavigate('dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FFFFF4] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-pattern"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-20 right-16 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-xl"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border-2 border-[#151616] shadow-[8px_8px_0px_0px_#151616]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#D6F32F] rounded-2xl flex items-center justify-center border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] mx-auto mb-4">
              <Trophy className="w-8 h-8 text-[#151616]" />
            </div>
            <h1 className="text-2xl font-black text-[#151616] mb-2">Welcome Back!</h1>
            <p className="text-[#151616]/70">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">Login as</label>
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

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-[#151616] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#151616]/60" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#151616] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6F32F] focus:border-[#D6F32F]"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
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
                  className="w-full pl-10 pr-12 py-3 border-2 border-[#151616] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6F32F] focus:border-[#D6F32F]"
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#D6F32F] py-3 px-4 rounded-lg border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:shadow-[2px_2px_0px_0px_#151616] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-[#151616] flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[#151616]/70">Don't have an account?</p>
            <button
              onClick={() => onNavigate('signup')}
              className="text-[#151616] font-medium hover:underline"
            >
              Create one here
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-pattern {
          background-image: radial-gradient(#151616 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default SigninPage;