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
        {/* Logo */}
        <div className="flex items-center gap-2 font-extrabold text-xl cursor-pointer">
          <Trophy className="w-6 h-6" />
          HackHub
        </div>

        {/* Links */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:underline">
            Features
          </a>
          <a href="#about" className="hover:underline">
            About
          </a>
          <a href="#contact" className="hover:underline">
            Contact
          </a>
        </nav>

        {/* Theme Toggle + Signin/Signup */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-[#151616] shadow hover:scale-110 transition"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onNavigate('signin')}
            className="px-4 py-2 rounded-lg font-bold border-2 border-[#151616] bg-[#D6F32F] shadow hover:translate-y-[2px] hover:shadow-none transition"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="px-4 py-2 rounded-lg font-bold border-2 border-[#151616] bg-white shadow hover:bg-[#D6F32F] hover:translate-y-[2px] hover:shadow-none transition"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center flex-1 px-8 py-20 text-center relative">
        {/* Decorative BG shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-pattern"></div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Hack. Innovate. <span className="text-[#D6F32F]">Grow.</span>
        </h1>
        <p className="max-w-2xl text-lg opacity-80 mb-8">
          HackHub is your one-stop platform to <b>organize</b>, <b>participate</b>, 
          and <b>judge hackathons</b>. Build meaningful projects, 
          expand your network, and shape the future of tech 🚀
        </p>
        <div className="flex gap-6 flex-wrap items-center justify-center">
          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3 rounded-lg font-bold border-2 border-[#151616] bg-[#D6F32F] shadow-[4px_4px_0px_0px_#151616] hover:translate-y-[2px] hover:shadow-none transition"
          >
            Get Started
          </button>
          <a href="#features" className="px-8 py-3 rounded-lg font-bold border-2 border-[#151616] bg-white shadow hover:bg-[#D6F32F] hover:translate-y-[2px] hover:shadow-none transition">
            Learn More
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-8 py-20 bg-opacity-30">
        <h2 className="text-3xl font-black text-center mb-12">🚀 Platform Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "Organize Hackathons",
              desc: "Empower communities by creating impactful events.",
              icon: <Calendar className="w-10 h-10" />,
            },
            {
              title: "Participate with Peers",
              desc: "Collaborate, compete, and innovate at scale.",
              icon: <Users className="w-10 h-10" />,
            },
            {
              title: "Boost Your Growth",
              desc: "Learn by doing, get mentorship, and land opportunities.",
              icon: <Code className="w-10 h-10" />,
            },
            {
              title: "Judge & Mentor",
              desc: "Shape the innovators of tomorrow with guidance.",
              icon: <Award className="w-10 h-10" />,
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl border-2 border-[#151616] shadow-[6px_6px_0px_0px_#151616] text-center transform transition-all duration-500 hover:-translate-y-3 hover:shadow-[10px_10px_0px_0px_#151616] ${
                darkMode ? 'bg-[#1e1f20] text-[#D6F32F]' : 'bg-white text-[#151616]'
              }`}
            >
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full border-2 border-[#151616] bg-[#D6F32F] shadow mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-extrabold mb-2">{f.title}</h3>
              <p className="text-sm opacity-80">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="px-8 py-20 bg-[#D6F32F] text-black text-center">
        <h2 className="text-3xl font-black mb-6">Why HackHub?</h2>
        <p className="max-w-3xl mx-auto text-lg mb-8">
          Unlike any other platform, HackHub gives you end-to-end hackathon 
          engagement: from organizers setting up challenges, to participants 
          competing globally, and industry leaders acting as mentors & judges. 
          It's more than just an event — it's a movement.
        </p>
        <button
          onClick={() => onNavigate('signup')}
          className="px-8 py-3 rounded-lg font-bold border-2 border-black bg-white shadow-lg hover:bg-black hover:text-white transition"
        >
          Join the Movement
        </button>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 text-center">
        <h2 className="text-4xl font-black mb-6">Ready to Hack the Future?</h2>
        <p className="mb-8">Sign up and be part of the next wave of innovation!</p>
        <button
          onClick={() => onNavigate('signup')}
          className="px-10 py-4 rounded-lg font-bold border-2 border-[#151616] bg-[#D6F32F] shadow-[4px_4px_0px_0px_#151616] hover:translate-y-[2px] hover:shadow-none transition"
        >
          Get Started Now 🚀
        </button>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className={`w-full px-8 py-6 border-t-2 border-[#151616] flex flex-col md:flex-row justify-between items-center gap-4 ${
          darkMode ? 'bg-[#1e1f20] text-[#D6F32F]' : 'bg-white text-[#151616]'
        }`}
      >
        <p className="text-sm">© 2025 HackHub. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </footer>

      {/* STYLES */}
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
        