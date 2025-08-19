import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignupPage from './components/SignupPage';
import SigninPage from './components/SigninPage';
import ParticipantDashboard from './components/ParticipantDashboard';
import CreatorDashboard from './components/CreatorDashboard';
import JudgeDashboard from './components/JudgeDashboard';

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('signup');
  const { user } = useAuth();

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    if (user && currentPage === 'dashboard') {
      switch (user.role) {
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
      default:
        return <SignupPage onNavigate={handleNavigation} />;
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