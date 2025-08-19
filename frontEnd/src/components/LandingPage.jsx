import React from 'react';
import { Trophy, Users, Calendar, Brain, Sparkles, ArrowRight } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#FFFFF4]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-pattern"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-40 left-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-xl"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b-2 border-[#151616]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#D6F32F] rounded-lg flex items-center justify-center border-2 border-[#151616] shadow-[2px_2px_0px_0px_#151616]">
                <Trophy className="w-6 h-6 text-[#151616]" />
              </div>
              <span className="text-xl font-black text-[#151616]">Eventure</span>
            </div>
            <button
              onClick={() => onNavigate('signin')}
              className="px-4 py-2 bg-[#D6F32F] rounded-lg border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:shadow-[2px_2px_0px_0px_#151616] hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold text-[#151616]"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl font-black text-[#151616] mb-6">
              Where Innovation Meets
              <span className="text-[#D6F32F] bg-[#151616] px-4 ml-3 inline-block transform -rotate-2">
                Competition
              </span>
            </h1>
            <p className="text-xl text-[#151616]/70 mb-8 max-w-2xl mx-auto">
              Join the ultimate hackathon platform where creators build, judges evaluate, and innovation thrives.
            </p>
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-[#D6F32F] rounded-xl border-2 border-[#151616] shadow-[8px_8px_0px_0px_#151616] hover:shadow-[4px_4px_0px_0px_#151616] hover:translate-x-[4px] hover:translate-y-[4px] transition-all font-bold text-[#151616] text-lg inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "For Participants",
                description: "Showcase your skills, collaborate with peers, and win exciting prizes."
              },
              {
                icon: Calendar,
                title: "For Organizers",
                description: "Create and manage hackathons with powerful tools and real-time analytics."
              },
              {
                icon: Brain,
                title: "For Judges",
                description: "Evaluate projects efficiently with our structured assessment system."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-[#151616] shadow-[4px_4px_0px_0px_#151616] hover:shadow-[8px_8px_0px_0px_#151616] transition-all"
              >
                <div className="w-12 h-12 bg-[#D6F32F] rounded-lg flex items-center justify-center border-2 border-[#151616] mb-4">
                  <feature.icon className="w-6 h-6 text-[#151616]" />
                </div>
                <h3 className="text-xl font-bold text-[#151616] mb-2">{feature.title}</h3>
                <p className="text-[#151616]/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 bg-[#151616] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "100+", label: "Active Hackathons" },
              { number: "10,000+", label: "Participants" },
              { number: "500+", label: "Projects Submitted" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-black text-[#D6F32F] mb-2">{stat.number}</div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            ))}
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

export default LandingPage;
