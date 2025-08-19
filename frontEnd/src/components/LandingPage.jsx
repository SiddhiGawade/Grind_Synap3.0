import React, { useState } from 'react';
import { ArrowRight, Sun, Moon, Trophy } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
        darkMode ? 'bg-[#151616] text-[#D6F32F]' : 'bg-[#FFFFF4] text-[#151616]'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="bg-pattern absolute inset-0"></div>
      </div>

      {/* Decorative Elements */}
      <div
        className={`absolute top-20 left-10 w-24 h-24 rounded-full blur-3xl transition-all duration-700 ${
          darkMode ? 'bg-purple-400/30' : 'bg-blue-200/30'
        }`}
      ></div>
      <div
        className={`absolute bottom-20 right-16 w-40 h-40 rounded-full blur-3xl transition-all duration-700 ${
          darkMode ? 'bg-yellow-400/20' : 'bg-purple-200/20'
        }`}
      ></div>

      {/* Toggle Theme Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-6 right-6 p-3 rounded-full shadow-lg border-2 border-[#151616] transition-all duration-300 ${
          darkMode
            ? 'bg-yellow-200 text-black hover:rotate-180'
            : 'bg-[#D6F32F] text-black hover:scale-110'
        }`}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Main Content */}
      <div
        className={`relative w-full max-w-2xl text-center px-6 py-12 rounded-3xl border-2 border-[#151616] shadow-[10px_10px_0px_0px_#151616] transition-all duration-500 ${
          darkMode ? 'bg-[#1e1f20]' : 'bg-white'
        }`}
      >
        {/* Hero Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-[#151616] shadow-[6px_6px_0px_0px_#151616] mx-auto mb-6 animate-bounce ${
            darkMode ? 'bg-[#D6F32F] text-black' : 'bg-[#D6F32F] text-[#151616]'
          }`}
        >
          <Trophy className="w-10 h-10" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-black mb-4 tracking-tight">
          Welcome to HackHub 🚀
        </h1>
        <p className="mb-8 text-lg opacity-80">
          Connect with innovators, compete in hackathons, and showcase your
          skills!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={() => onNavigate('signin')}
            className={`flex items-center justify-center gap-2 px-6 py-3 w-40 rounded-lg border-2 border-[#151616] font-bold shadow-[4px_4px_0px_0px_#151616] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#151616] transition-all ${
              darkMode ? 'bg-[#D6F32F] text-black' : 'bg-[#D6F32F] text-black'
            }`}
          >
            Sign In
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('signup')}
            className={`flex items-center justify-center gap-2 px-6 py-3 w-40 rounded-lg border-2 border-[#151616] font-bold shadow-[4px_4px_0px_0px_#151616] hover:bg-[#D6F32F] transition-all ${
              darkMode ? 'bg-white text-black' : 'bg-white text-black'
            }`}
          >
            Sign Up
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Extra Animations */}
      <style>{`
        .bg-pattern {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 22px 22px;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
