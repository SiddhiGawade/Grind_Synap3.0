import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import SignupPage from './components/SignupPage';
import SigninPage from './components/SigninPage';
import ParticipantDashboard from './components/ParticipantDashboard';
import CreatorDashboard from './components/CreatorDashboard';
import JudgeDashboard from './components/JudgeDashboard';
import LandingPage from './components/LandingPage';

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const { user } = useAuth();

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (user && currentPage === 'dashboard') {
      switch (user.role) {
        case 'landing':
          return <LandingPage onNavigate={handleNavigation} />;
        case 'participant':
          return <ParticipantDashboard />;
        case 'organizer':
          return <CreatorDashboard />;
        case 'judge':
          return <JudgeDashboard />;
        default:
          return <ParticipantDashboard />;
      }
    }

    switch (currentPage) {
      case 'signup':
        return <SignupPage onNavigate={handleNavigation} />;
      case 'signin':
        return <SigninPage onNavigate={handleNavigation} />;
      case 'landing': // Ensure landing page is explicitly handled
        return <LandingPage onNavigate={handleNavigation} />;
      default:
        return <LandingPage onNavigate={handleNavigation} />; // Default to landing page
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
};

// Root Component with Auth Provider
const Root = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default Root;