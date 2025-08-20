import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Trophy,
  Users,
  Calendar,
  Award,
  Code,
  ShieldCheck,
  Github,
  Twitter,
  Linkedin,
  Plus,
  Minus,
} from 'lucide-react';

// --- FaqItem COMPONENT ---
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const contentVariants = {
    open: { opacity: 1, height: 'auto', marginTop: 16, transition: { duration: 0.4, ease: 'easeInOut' } },
    closed: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  return (
    <div
      className="faq-item p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold text-primary">
          {question}
        </h3>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent"
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={contentVariants}
            className="overflow-hidden"
          >
            <p className="text-sm md:text-base opacity-80 text-primary">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LandingPage = ({ onNavigate }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Apply theme to root element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Animation variants
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
  };

  const faqData = [
    { question: "What is Eventure?", answer: "Eventure is a platform designed to help you organize, participate in, and judge hackathons, streamlining the entire event lifecycle." },
    { question: "Who can participate in hackathons?", answer: "Anyone with a passion for innovation and problem-solving can participate. Whether you're a student, professional, or hobbyist, Eventure welcomes you." },
    { question: "How do I host a hackathon on Eventure?", answer: "Hosting a hackathon is simple. Sign up as an organizer, create your event, and use our tools to manage participants, teams, and judging seamlessly." },
    { question: "Is Eventure free to use?", answer: "Eventure offers both free and premium plans. The free plan includes essential features, while premium plans provide advanced tools for organizers and participants." },
  ];

  return (
    <>
  {/* CSS Variables */}
  <style>{`
        :root {
          /* Light Theme Colors */
          --light-bg-primary: #F2EDD1;     /* Light cream */
          --light-bg-secondary: #F9CB99;   /* Peach */
          --light-bg-accent: #689B8A;      /* Sage green */
          --light-text-primary: #280A3E;   /* Deep purple */
          --light-text-secondary: #F2EDD1; /* Light cream for contrast */
          --light-border: #280A3E;         /* Deep purple */
          --light-shadow: #280A3E;         /* Deep purple */
          --light-navbar-bg: rgba(242, 237, 209, 0.94); /* Light cream with transparency */
          
          /* Dark Theme Colors - Updated palette */
          --dark-bg-primary: #222831;      /* Dark gray - main background */
          --dark-bg-secondary: #31363F;    /* Medium gray - secondary backgrounds */
          --dark-bg-accent: #76ABAE;       /* Teal blue - accent elements */
          --dark-text-primary: #EEEEEE;    /* Light gray - main text */
          --dark-text-secondary: #222831;  /* Dark gray for contrast text on light backgrounds */
          --dark-border: #76ABAE;          /* Teal blue for borders */
          --dark-shadow: #31363F;          /* Medium gray for shadows */
          --dark-navbar-bg: rgba(49, 54, 63, 0.94); /* Medium gray with transparency */
        }

        .light-theme {
          --bg-primary: var(--light-bg-primary);
          --bg-secondary: var(--light-bg-secondary);
          --bg-accent: var(--light-bg-accent);
          --text-primary: var(--light-text-primary);
          --text-secondary: var(--light-text-secondary);
          --border-color: var(--light-border);
          --shadow-color: var(--light-shadow);
          --navbar-bg: var(--light-navbar-bg);
        }

        .dark-theme {
          --bg-primary: var(--dark-bg-primary);
          --bg-secondary: var(--dark-bg-secondary);
          --bg-accent: var(--dark-bg-accent);
          --text-primary: var(--dark-text-primary);
          --text-secondary: var(--dark-text-secondary);
          --border-color: var(--dark-border);
          --shadow-color: var(--dark-shadow);
          --navbar-bg: var(--dark-navbar-bg);
        }

        /* Utility Classes */
        .bg-primary { background-color: var(--bg-primary); }
        .bg-secondary { background-color: var(--bg-secondary); }
        .bg-accent { background-color: var(--bg-accent); }
        .text-primary { color: var(--text-primary); }
        .text-secondary { color: var(--text-secondary); }
        .text-accent { color: var(--bg-accent); }
        .border-themed { border-color: var(--border-color); }
        .shadow-themed { box-shadow: 2px 2px 0px 0px var(--shadow-color); }
        .shadow-themed-lg { box-shadow: 4px 4px 0px 0px var(--shadow-color); }
        .shadow-themed-xl { box-shadow: 6px 6px 0px 0px var(--shadow-color); }

        /* Component-specific styles */
        .navbar {
          background-color: var(--navbar-bg);
          border-bottom-color: var(--border-color);
        }

        .faq-item {
          background-color: var(--bg-primary);
          border-color: var(--border-color);
          box-shadow: 2px 2px 0px 0px var(--shadow-color);
        }

        .faq-item:hover {
          transform: translateY(-2px);
        }

        .btn-primary {
          background-color: var(--bg-accent);
          color: var(--text-secondary);
          border-color: var(--border-color);
        }

        .btn-primary:hover {
          filter: brightness(0.9);
        }

        .btn-secondary {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--border-color);
        }

        .btn-secondary:hover {
          background-color: var(--text-primary);
          color: var(--text-secondary);
        }

        .feature-card {
          background-color: var(--bg-primary);
          border-color: var(--bg-accent);
          box-shadow: 6px 6px 0px 0px var(--shadow-color);
        }

        .feature-card:hover {
          transform: translateY(-10px) scale(1.03);
        }

        .feature-icon {
          background-color: var(--bg-accent);
          border-color: var(--border-color);
          color: var(--text-secondary);
        }

        .dotted-bg {
          background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.05;
        }

        .theme-toggle {
          background-color: var(--bg-secondary);
        }

        .verified-banner {
          background-color: rgba(118, 171, 174, 0.2);
          border-color: var(--border-color);
        }
  `}</style>

      <div className="min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden bg-primary">
        {/* NAVBAR */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="navbar sticky top-0 z-50 w-full px-8 py-4 flex justify-between items-center border-b-2 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 font-extrabold text-xl cursor-pointer text-accent">
            <Trophy className="w-6 h-6" />
            <span>Eventure</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium ml-26">
            <a href="#features" className="text-primary transition-colors hover:opacity-70">Features</a>
            <a href="#about" className="text-primary transition-colors hover:opacity-70">About</a>
            <a href="#contact" className="text-primary transition-colors hover:opacity-70">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle p-2 rounded-full border-2 border-themed transition-colors"
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div key="sun" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                    <Sun className="w-5 h-5 text-accent" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                    <Moon className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              onClick={() => onNavigate('signin')}
              className="btn-secondary hidden sm:block px-4 py-2 rounded-lg font-bold border-2 transition-all shadow-themed"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              onClick={() => onNavigate('signup')}
              className="btn-primary px-4 py-2 rounded-lg font-bold border-2 transition-all shadow-themed"
            >
              Sign Up
            </motion.button>
          </div>
        </motion.header>

        {/* HERO SECTION */}
        <section className="flex flex-col items-center justify-center flex-1 px-8 py-20 text-center relative">
          <div className="dotted-bg absolute inset-0 pointer-events-none" />
          <motion.div variants={heroContainerVariants} initial="hidden" animate="show" className="z-10">
            <motion.h1 variants={heroItemVariants} className="text-5xl md:text-7xl font-black leading-tight mb-6 text-primary">
              Hack. Innovate. <br />
              <span className="text-accent">Grow.</span>
            </motion.h1>
            <motion.p variants={heroItemVariants} className="max-w-2xl text-lg opacity-80 mb-8 text-primary">
              Eventure is your one-stop platform to <b>organize</b>, <b>participate</b>, and <b>judge hackathons</b>. Build meaningful projects, expand your network, and shape the future of tech 🚀
            </motion.p>
            <motion.div variants={heroItemVariants} className="flex gap-6 flex-wrap items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('signup')}
                className="btn-primary px-8 py-3 rounded-lg font-bold border-2 transition-all duration-200 shadow-themed-lg"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary px-8 py-3 rounded-lg font-bold border-2 transition-all duration-200 shadow-themed-lg"
              >
                Learn More
              </motion.button>
            </motion.div>
            
            {/* VERIFIED EVENTS BANNER */}
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.7, type: "spring", stiffness: 100 }}
              className="verified-banner mt-12 flex items-center justify-center gap-3 p-3 px-6 rounded-lg border-2 border-dashed backdrop-blur-sm"
            >
              <ShieldCheck className="w-8 h-8 text-green-500" />
              <span className="text-lg font-bold tracking-wide text-primary">Verified Events Only. No Scams.</span>
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <motion.section id="features" className="px-8 py-20" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <h2 className="text-4xl font-black text-center mb-16 text-primary">
            Everything You Need, All in One Place
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {[
              { title: "Organize Hackathons", desc: "Empower communities by creating impactful events.", icon: <Calendar className="w-10 h-10" /> },
              { title: "Participate with Peers", desc: "Collaborate, compete, and innovate at scale.", icon: <Users className="w-10 h-10" /> },
              { title: "Boost Your Growth", desc: "Learn by doing, get mentorship, and land opportunities.", icon: <Code className="w-10 h-10" /> },
              { title: "Judge & Mentor", desc: "Shape the innovators of tomorrow with your guidance.", icon: <Award className="w-10 h-10" /> },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card p-6 rounded-2xl border-2 text-center transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, amount: 0.5 }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <div className="feature-icon mx-auto w-20 h-20 flex items-center justify-center rounded-full border-2 mb-6">
                  {React.cloneElement(f.icon, { className: 'w-10 h-10' })}
                </div>
                <h3 className="text-xl font-extrabold mb-2 text-primary">{f.title}</h3>
                <p className="text-sm opacity-80 text-primary">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ABOUT SECTION */}
        <motion.section
          id="about"
          className="px-8 py-20 text-center bg-accent"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-black mb-6 text-secondary">Why Eventure?</h2>
          <p className="max-w-3xl mx-auto text-lg mb-8 opacity-90 text-secondary">
            Unlike any other platform, Eventure gives you end-to-end hackathon engagement: from organizers setting up challenges, to participants competing globally, and industry leaders acting as mentors & judges. It's more than just an event — it's a movement.
          </p>
          <motion.button
            onClick={() => onNavigate('signup')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg font-bold border-2 transition-all shadow-themed-lg"
            style={{
              backgroundColor: 'var(--text-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--text-secondary)',
            }}
          >
            Join the Movement
          </motion.button>
        </motion.section>

        {/* CTA SECTION */}
        <motion.section
          className="px-8 py-20 text-center bg-secondary"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-black mb-6 text-primary">Ready to Hack the Future?</h2>
          <p className="max-w-3xl mx-auto text-lg opacity-90 mb-10 text-primary">
            Whether you're looking to host a global hackathon with seamless judging tools, 
            or you're a developer aiming to find your next winning team, Eventure provides 
            the ultimate platform for competitive innovation.
          </p>
          <motion.button
            onClick={() => onNavigate('signup')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 1 }}
            className="btn-primary px-10 py-4 rounded-lg font-bold border-2 transition-all shadow-themed-lg"
          >
            Create Your First Event 🚀
          </motion.button>
        </motion.section>

        {/* FAQ SECTION */}
        <motion.section
          id="faq"
          className="px-8 py-20 bg-primary"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-4xl font-black text-center mb-12 text-primary">
            Frequently Asked Questions
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqData.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </motion.section>

        {/* FOOTER */}
        <motion.footer
          id="contact"
          className="w-full px-8 py-16 border-t-2 border-themed bg-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start col-span-1">
              <div className="flex items-center gap-2 font-extrabold text-2xl mb-2 text-accent">
                <Trophy className="w-7 h-7" />
                <span>Eventure</span>
              </div>
              <p className="text-sm opacity-70 text-primary">The Future of Innovation, Verified.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 uppercase tracking-wider text-primary">Platform</h3>
              <div className="flex flex-col gap-3 text-sm opacity-90">
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">Host an Event</a>
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">Find Hackathons</a>
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">For Judges</a>
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">Pricing</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 uppercase tracking-wider text-primary">Company</h3>
              <div className="flex flex-col gap-3 text-sm opacity-90">
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">About Us</a>
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">Careers</a>
                <a href="#" className="text-primary hover:underline transition-colors hover:opacity-70">Contact Support</a>
              </div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-opacity-20 flex justify-center items-center">
            <p className="text-sm opacity-60 text-primary">© {new Date().getFullYear()} Eventure. All rights reserved.</p>
          </div>
        </motion.footer>
      </div>
    </>
  );
};

export default LandingPage;
