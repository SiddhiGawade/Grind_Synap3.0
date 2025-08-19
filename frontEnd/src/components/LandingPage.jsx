import React, { useState } from 'react';
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

// --- COLOR CONSTANTS FROM PALETTE ---
const LIGHT_CREAM = '#F2EDD1';  // Light background, text on dark
const PEACH = '#F9CB99';        // Secondary accent, warm highlights
const SAGE_GREEN = '#689B8A';   // Primary actions, main accent
const DEEP_PURPLE = '#280A3E';  // Dark elements, shadows, text

// --- FaqItem COMPONENT ---
const FaqItem = ({ question, answer, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const contentVariants = {
    open: { opacity: 1, height: 'auto', marginTop: 16, transition: { duration: 0.4, ease: 'easeInOut' } },
    closed: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  };

  return (
    <div
      className="p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300"
      onClick={() => setIsOpen(!isOpen)}
      style={{
        backgroundColor: darkMode ? DEEP_PURPLE : LIGHT_CREAM,
        borderColor: darkMode ? SAGE_GREEN : DEEP_PURPLE,
        boxShadow: darkMode ? `2px 2px 0px 0px ${SAGE_GREEN}` : `2px 2px 0px 0px ${DEEP_PURPLE}`,
      }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold"
            style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
          {question}
        </h3>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: darkMode ? SAGE_GREEN : DEEP_PURPLE }}
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
            <p className="text-sm md:text-base opacity-80" 
               style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
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
    { question: "What is HackHub?", answer: "HackHub is a platform designed to help you organize, participate in, and judge hackathons, streamlining the entire event lifecycle." },
    { question: "Who can participate in hackathons?", answer: "Anyone with a passion for innovation and problem-solving can participate. Whether you're a student, professional, or hobbyist, HackHub welcomes you." },
    { question: "How do I host a hackathon on HackHub?", answer: "Hosting a hackathon is simple. Sign up as an organizer, create your event, and use our tools to manage participants, teams, and judging seamlessly." },
    { question: "Is HackHub free to use?", answer: "HackHub offers both free and premium plans. The free plan includes essential features, while premium plans provide advanced tools for organizers and participants." },
  ];

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden"
      style={{
        backgroundColor: darkMode ? '#1A0F1F' : LIGHT_CREAM, // Custom dark bg instead of pure purple
        color: darkMode ? LIGHT_CREAM : DEEP_PURPLE,
      }}
    >
      {/* NAVBAR */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="sticky top-0 z-50 w-full px-8 py-4 flex justify-between items-center border-b-2 backdrop-blur-sm"
        style={{
          backgroundColor: darkMode ? `${DEEP_PURPLE}F0` : `${LIGHT_CREAM}F0`,
          borderBottomColor: darkMode ? SAGE_GREEN : DEEP_PURPLE,
        }}
      >
        <div className="flex items-center gap-2 font-extrabold text-xl cursor-pointer"
             style={{ color: darkMode ? SAGE_GREEN : DEEP_PURPLE }}>
          <Trophy className="w-6 h-6" />
          <span>HackHub</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" 
             className="transition-colors hover:opacity-70"
             style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
            Features
          </a>
          <a href="#about" 
             className="transition-colors hover:opacity-70"
             style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
            About
          </a>
          <a href="#contact" 
             className="transition-colors hover:opacity-70"
             style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border-2 transition-colors"
            style={{
              borderColor: darkMode ? SAGE_GREEN : DEEP_PURPLE,
              backgroundColor: darkMode ? DEEP_PURPLE : PEACH,
            }}
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div key="sun" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                  <Sun className="w-5 h-5" style={{ color: SAGE_GREEN }} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                  <Moon className="w-5 h-5" style={{ color: DEEP_PURPLE }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <motion.button
            whileHover={{ y: -2, backgroundColor: DEEP_PURPLE, color: LIGHT_CREAM }}
            whileTap={{ y: 1 }}
            onClick={() => onNavigate('signin')}
            className="hidden sm:block px-4 py-2 rounded-lg font-bold border-2 transition-all"
            style={{
              borderColor: DEEP_PURPLE,
              backgroundColor: darkMode ? SAGE_GREEN : LIGHT_CREAM,
              color: darkMode ? LIGHT_CREAM : DEEP_PURPLE,
              boxShadow: `2px 2px 0px 0px ${DEEP_PURPLE}`,
            }}
          >
            Sign In
          </motion.button>
          <motion.button
            whileHover={{ y: -2, backgroundColor: '#5A8678' }}
            whileTap={{ y: 1 }}
            onClick={() => onNavigate('signup')}
            className="px-4 py-2 rounded-lg font-bold border-2 transition-all"
            style={{
              backgroundColor: SAGE_GREEN,
              borderColor: DEEP_PURPLE,
              color: LIGHT_CREAM,
              boxShadow: `2px 2px 0px 0px ${DEEP_PURPLE}`,
            }}
          >
            Sign Up
          </motion.button>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center flex-1 px-8 py-20 text-center relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
             style={{
               backgroundImage: `radial-gradient(${darkMode ? SAGE_GREEN : DEEP_PURPLE} 1px, transparent 1px)`,
               backgroundSize: '24px 24px'
             }} />
        <motion.div variants={heroContainerVariants} initial="hidden" animate="show" className="z-10">
          <motion.h1 variants={heroItemVariants} className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Hack. Innovate. <br />
            <span className="relative inline-block"
                  style={{ color: SAGE_GREEN }}>
              Grow.
            </span>
          </motion.h1>
          <motion.p variants={heroItemVariants} className="max-w-2xl text-lg opacity-80 mb-8">
            HackHub is your one-stop platform to <b>organize</b>, <b>participate</b>, and <b>judge hackathons</b>. Build meaningful projects, expand your network, and shape the future of tech 🚀
          </motion.p>
          <motion.div variants={heroItemVariants} className="flex gap-6 flex-wrap items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#5A8678' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('signup')}
              className="px-8 py-3 rounded-lg font-bold border-2 transition-all duration-200"
              style={{
                backgroundColor: SAGE_GREEN,
                borderColor: DEEP_PURPLE,
                color: LIGHT_CREAM,
                boxShadow: `4px 4px 0px 0px ${DEEP_PURPLE}`,
              }}
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: DEEP_PURPLE, color: LIGHT_CREAM }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 rounded-lg font-bold border-2 transition-all duration-200"
              style={{
                borderColor: DEEP_PURPLE,
                backgroundColor: darkMode ? PEACH : LIGHT_CREAM,
                color: DEEP_PURPLE,
                boxShadow: `4px 4px 0px 0px ${DEEP_PURPLE}`,
              }}
            >
              Learn More
            </motion.button>
          </motion.div>
          
          {/* VERIFIED EVENTS BANNER */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 0.7, type: "spring", stiffness: 100 }}
            className="mt-12 flex items-center justify-center gap-3 p-3 px-6 rounded-lg border-2 border-dashed backdrop-blur-sm"
            style={{
              backgroundColor: darkMode ? `${SAGE_GREEN}20` : `${PEACH}40`,
              borderColor: darkMode ? SAGE_GREEN : DEEP_PURPLE,
            }}
          >
            <ShieldCheck className="w-8 h-8 text-green-500" />
            <span className="text-lg font-bold tracking-wide">Verified Events Only. No Scams.</span>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <motion.section id="features" className="px-8 py-20" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <h2 className="text-4xl font-black text-center mb-16" 
            style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
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
              className="p-6 rounded-2xl border-2 text-center transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
              whileHover={{ y: -10, scale: 1.03 }}
              style={{
                backgroundColor: darkMode ? DEEP_PURPLE : LIGHT_CREAM,
                borderColor: SAGE_GREEN,
                boxShadow: `6px 6px 0px 0px ${DEEP_PURPLE}`,
              }}
            >
              <div
                className="mx-auto w-20 h-20 flex items-center justify-center rounded-full border-2 mb-6"
                style={{ 
                  backgroundColor: SAGE_GREEN, 
                  borderColor: DEEP_PURPLE,
                }}
              >
                {React.cloneElement(f.icon, { 
                  className: 'w-10 h-10',
                  style: { color: LIGHT_CREAM }
                })}
              </div>
              <h3 className="text-xl font-extrabold mb-2" 
                  style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
                {f.title}
              </h3>
              <p className="text-sm opacity-80" 
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ABOUT SECTION - FIXED COLOR */}
      <motion.section
        id="about"
        className="px-8 py-20 text-center"
        style={{
          backgroundColor: SAGE_GREEN, // Solid sage green instead of gradient
          color: LIGHT_CREAM,
        }}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-4xl font-black mb-6" style={{ color: LIGHT_CREAM }}>Why HackHub?</h2>
        <p className="max-w-3xl mx-auto text-lg mb-8 opacity-90" style={{ color: LIGHT_CREAM }}>
          Unlike any other platform, HackHub gives you end-to-end hackathon engagement: from organizers setting up challenges, to participants competing globally, and industry leaders acting as mentors & judges. It's more than just an event — it's a movement.
        </p>
        <motion.button
          onClick={() => onNavigate('signup')}
          whileHover={{ scale: 1.05, backgroundColor: DEEP_PURPLE, color: LIGHT_CREAM }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 rounded-lg font-bold border-2 transition-all"
          style={{
            backgroundColor: LIGHT_CREAM,
            color: DEEP_PURPLE,
            borderColor: LIGHT_CREAM,
            boxShadow: `4px 4px 0px 0px ${DEEP_PURPLE}`,
          }}
        >
          Join the Movement
        </motion.button>
      </motion.section>

      {/* CTA SECTION */}
      <motion.section
        className="px-8 py-20 text-center"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        style={{
          backgroundColor: darkMode ? DEEP_PURPLE : PEACH,
          color: darkMode ? LIGHT_CREAM : DEEP_PURPLE,
        }}
      >
        <h2 className="text-4xl font-black mb-6">Ready to Hack the Future?</h2>
        <p className="max-w-3xl mx-auto text-lg opacity-90 mb-10">
          Whether you're looking to host a global hackathon with seamless judging tools, 
          or you're a developer aiming to find your next winning team, HackHub provides 
          the ultimate platform for competitive innovation.
        </p>
        <motion.button
          onClick={() => onNavigate('signup')}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95, y: 1 }}
          className="px-10 py-4 rounded-lg font-bold border-2 transition-all"
          style={{
            backgroundColor: SAGE_GREEN,
            color: LIGHT_CREAM,
            borderColor: DEEP_PURPLE,
            boxShadow: `4px 4px 0px 0px ${DEEP_PURPLE}`,
          }}
        >
          Create Your First Event 🚀
        </motion.button>
      </motion.section>

      {/* FAQ SECTION */}
      <motion.section
        id="faq"
        className="px-8 py-20"
        style={{
          backgroundColor: darkMode ? '#1A0F1F' : LIGHT_CREAM,
        }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-4xl font-black text-center mb-12" 
            style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
          Frequently Asked Questions
        </h2>
        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              darkMode={darkMode}
            />
          ))}
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        id="contact"
        className="w-full px-8 py-16 border-t-2"
        style={{
          borderTopColor: darkMode ? SAGE_GREEN : DEEP_PURPLE,
          backgroundColor: darkMode ? DEEP_PURPLE : LIGHT_CREAM,
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-2xl mb-2"
                 style={{ color: darkMode ? SAGE_GREEN : DEEP_PURPLE }}>
              <Trophy className="w-7 h-7" />
              <span>HackHub</span>
            </div>
            <p className="text-sm opacity-70">The Future of Innovation, Verified.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-wider" 
                style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
              Platform
            </h3>
            <div className="flex flex-col gap-3 text-sm opacity-90">
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>Host an Event</a>
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>Find Hackathons</a>
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>For Judges</a>
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>Pricing</a>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4 uppercase tracking-wider" 
                style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>
              Company
            </h3>
            <div className="flex flex-col gap-3 text-sm opacity-90">
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>About Us</a>
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>Careers</a>
              <a href="#" className="hover:underline transition-colors hover:opacity-70"
                 style={{ color: darkMode ? LIGHT_CREAM : DEEP_PURPLE }}>Contact Support</a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-opacity-20 flex justify-center items-center">
          <p className="text-sm opacity-60">© {new Date().getFullYear()} HackHub. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
