import React, { useState } from 'react';
import {
  ArrowRight,
  Sun,
  Moon,
  Trophy,
  Users,
  Calendar,
  Award,
  Code,
  ShieldCheck,
} from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode ? 'bg-[#151616] text-[#D6F32F]' : 'bg-[#FFFFF4] text-[#151616]'
      }`}
    >
      {/* NAVBAR */}
      <header
        className={`w-full px-8 py-4 flex justify-between items-center border-b-2 border-[#151616] ${
          darkMode ? 'bg-[#1e1f20]' : 'bg-white'
        }`}
      >
        <div className="flex items-center gap-2 font-extrabold text-xl cursor-pointer">
          <Trophy className="w-6 h-6" />
          HackHub
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-[#151616] shadow hover:scale-110 transition"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onNavigate('signin')}
            className="px-4 py-2 rounded-lg font-bold border-2 border-[#151616] bg-[#D6F32F] shadow"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="px-4 py-2 rounded-lg font-bold border-2 border-[#151616] bg-white shadow hover:bg-[#D6F32F] transition"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center flex-1 px-8 pt-20 pb-8 text-center relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-pattern"></div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Hack. Innovate. <span className="text-[#D6F32F]">Grow.</span>
        </h1>
        <p className="max-w-2xl text-lg opacity-80 mb-8">
          HackHub is your one-stop platform to <b>organize</b>, <b>participate</b>, 
          and <b>judge hackathons</b>. Build meaningful projects, expand your network, and shape the future of tech 🚀
        </p>
        <div className="flex gap-6 flex-wrap items-center justify-center">
          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3 rounded-lg font-bold border-2 border-[#151616] bg-[#D6F32F] shadow hover:translate-y-[2px]"
          >
            Get Started
          </button>
          <a href="#features" className="px-8 py-3 rounded-lg font-bold border-2 border-[#151616] bg-white shadow hover:bg-[#D6F32F]">Learn More</a>
        </div>
      </section>

      {/* ✅ VERIFIED & SECURE SECTION */}
      <section className="px-8 py-16 bg-green-100 border-y-2 border-[#151616] text-center">
        <div className="flex flex-col md:flex-row gap-10 items-center justify-center max-w-5xl mx-auto">
          <div className="flex justify-center items-center flex-shrink-0">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500 text-white border-4 border-[#151616] shadow-lg">
              <ShieldCheck className="w-10 h-10" />
            </div>
          </div>
          <div className="text-left max-w-2xl">
            <h2 className="text-3xl font-extrabold mb-3">
              ✅ Verified & Secure Events
            </h2>
            <p className="text-lg font-medium mb-3">
              All hackathons on HackHub are <b>authorized</b> and <b>authenticated</b>.  
              No scams, only <span className="text-green-700 font-bold">real innovation</span>.
            </p>

            {/* Trust badges */}
            <div className="flex gap-4 flex-wrap mt-4">
              <span className="px-3 py-1 bg-white border border-[#151616] rounded-full text-sm font-medium shadow">🔒 Authorized Organizers</span>
              <span className="px-3 py-1 bg-white border border-[#151616] rounded-full text-sm font-medium shadow">🔑 Secure Login</span>
              <span className="px-3 py-1 bg-white border border-[#151616] rounded-full text-sm font-medium shadow">🏆 Verified Hackathons</span>
              <span className="px-3 py-1 bg-white border border-[#151616] rounded-full text-sm font-medium shadow">🌍 Global Community</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-8 pt-12 pb-20">
        <h2 className="text-3xl font-black text-center mb-12">🚀 Platform Highlights</h2>
        {/* ... keep your features + leaderboard/xp/badges here ... */}
      </section>

      {/* ABOUT / CTA / FOOTER (same as before)… */}
      
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
