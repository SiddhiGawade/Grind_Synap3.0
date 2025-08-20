import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, Info } from 'lucide-react';

const EventRegistrationForm = ({ event, onClose, onSubmit, currentStep = 1 }) => {
  const [step, setStep] = useState(currentStep);
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    college: '',
    // Team Details
    teamName: '',
    teamSize: 1,
    teamMembers: [],
    inviteEmails: ['', '', ''], // For storing emails to invite team members
    // Additional Details
    tshirtSize: '',
    dietaryPreference: '',
    // Terms
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleInviteEmailChange = (index, value) => {
    const newInviteEmails = [...formData.inviteEmails];
    newInviteEmails[index] = value;
    setFormData({
      ...formData,
      inviteEmails: newInviteEmails
    });
    
    // Clear error when field is edited
    if (errors[`inviteEmail${index}`]) {
      setErrors({
        ...errors,
        [`inviteEmail${index}`]: ''
      });
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
      if (!formData.college.trim()) newErrors.college = 'College/Institution is required';
    }
    
    if (stepNumber === 2 && event.teamEvent) {
      if (!formData.teamName.trim()) newErrors.teamName = 'Team name is required';
      if (formData.teamSize < 1) newErrors.teamSize = 'Team size must be at least 1';
      if (event.minTeamSize && formData.teamSize < event.minTeamSize) {
        newErrors.teamSize = `Team size must be at least ${event.minTeamSize}`;
      }
      if (formData.teamSize > 4) {
        newErrors.teamSize = 'Team size cannot exceed 4 members';
      } else if (event.maxTeamSize && formData.teamSize > event.maxTeamSize) {
        newErrors.teamSize = `Team size cannot exceed ${event.maxTeamSize}`;
      }
      
      // Validate invite emails
      formData.inviteEmails.forEach((email, index) => {
        if (email.trim() && !/^\S+@\S+\.\S+$/.test(email)) {
          newErrors[`inviteEmail${index}`] = 'Email is invalid';
        }
      });
    }
    
    if (stepNumber === 3) {
      if (!formData.tshirtSize) newErrors.tshirtSize = 'T-shirt size is required';
    }
    
    if (stepNumber === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(step)) {
      onSubmit(formData);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Personal Details' },
      { number: 2, label: 'Team Details' }, // Always include step 2
      { number: 3, label: 'Additional Info' },
      { number: 4, label: 'Review & Submit' }
    ];

    return (
      <div className="flex justify-between mb-6">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.number ? 'bg-accent text-white' : 'bg-secondary/50 text-primary/50'} border-2 border-themed`}
            >
              {s.number}
            </div>
            <span className={`ml-2 text-sm hidden sm:inline ${step >= s.number ? 'text-primary' : 'text-primary/50'}`}>
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-10 sm:w-16 h-0.5 mx-1 ${step > s.number ? 'bg-accent' : 'bg-secondary/50'}`}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPersonalDetailsStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary">Personal Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Full Name*</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
            className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.name ? 'border-red-500' : 'border-themed'}`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Email Address*</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.email ? 'border-red-500' : 'border-themed'}`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Phone Number*</label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleInputChange} 
            className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.phone ? 'border-red-500' : 'border-themed'}`}
            placeholder="Enter your 10-digit phone number"
            maxLength="10"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">College/Institution*</label>
          <input 
            type="text" 
            name="college" 
            value={formData.college} 
            onChange={handleInputChange} 
            className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.college ? 'border-red-500' : 'border-themed'}`}
            placeholder="Enter your college/institution name"
          />
          {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
        </div>
      </div>
    </div>
  );

  const renderTeamDetailsStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary">Team Details</h3>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Team Name*</label>
            <input 
              type="text" 
              name="teamName" 
              value={formData.teamName} 
              onChange={handleInputChange} 
              className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.teamName ? 'border-red-500' : 'border-themed'}`}
              placeholder="Enter your team name"
            />
            {errors.teamName && <p className="text-red-500 text-xs mt-1">{errors.teamName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Team Size*</label>
            <div className="flex items-center">
              <input 
                type="number" 
                name="teamSize" 
                value={formData.teamSize} 
                onChange={handleInputChange} 
                min="1"
                max={Math.min(event.maxTeamSize || 10, 4)}
                className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.teamSize ? 'border-red-500' : 'border-themed'}`}
              />
              {event.minTeamSize && event.maxTeamSize && (
                <span className="ml-2 text-xs text-primary/70">
                  ({event.minTeamSize}-{Math.min(event.maxTeamSize, 4)} members)
                </span>
              )}
            </div>
            {errors.teamSize && <p className="text-red-500 text-xs mt-1">{errors.teamSize}</p>}
          </div>
          
          <div className="mt-4">
            <h4 className="text-md font-medium text-primary mb-2">Invite Team Members</h4>
            <p className="text-sm text-primary/70 mb-4">
              <Info className="inline-block w-4 h-4 mr-1" />
              Invite up to 3 team members by email (maximum team size: 4 including you)
            </p>
            
            {formData.inviteEmails.map((email, index) => (
              <div key={index} className="mb-3">
                <label className="block text-sm font-medium text-primary mb-1">Team Member {index + 1} Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => handleInviteEmailChange(index, e.target.value)} 
                  className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors[`inviteEmail${index}`] ? 'border-red-500' : 'border-themed'}`}
                  placeholder="Enter team member's email address"
                />
                {errors[`inviteEmail${index}`] && <p className="text-red-500 text-xs mt-1">{errors[`inviteEmail${index}`]}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdditionalInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary">Additional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">T-Shirt Size*</label>
          <select 
            name="tshirtSize" 
            value={formData.tshirtSize} 
            onChange={handleInputChange} 
            className={`input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none ${errors.tshirtSize ? 'border-red-500' : 'border-themed'}`}
          >
            <option value="">Select Size</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            <option value="XL">Extra Large</option>
            <option value="XXL">XXL</option>
          </select>
          {errors.tshirtSize && <p className="text-red-500 text-xs mt-1">{errors.tshirtSize}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Dietary Preference</label>
          <select 
            name="dietaryPreference" 
            value={formData.dietaryPreference} 
            onChange={handleInputChange} 
            className="input-field w-full p-2 border-2 rounded-lg focus:ring-2 focus:ring-accent focus:outline-none border-themed"
          >
            <option value="">Select Preference</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-primary">Review Your Information</h3>
      
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
          <h4 className="font-semibold text-primary mb-2">Personal Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Name:</span> {formData.name}</div>
            <div><span className="font-medium">Email:</span> {formData.email}</div>
            <div><span className="font-medium">Phone:</span> {formData.phone}</div>
            <div><span className="font-medium">College:</span> {formData.college}</div>
          </div>
        </div>
        
        {event.teamEvent && (
          <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
            <h4 className="font-semibold text-primary mb-2">Team Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span className="font-medium">Team Name:</span> {formData.teamName}</div>
              <div><span className="font-medium">Team Size:</span> {formData.teamSize}</div>
              {formData.inviteEmails.filter(email => email.trim()).length > 0 && (
                <div className="col-span-2 mt-2">
                  <span className="font-medium">Invited Team Members:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {formData.inviteEmails.filter(email => email.trim()).map((email, index) => (
                      <li key={index}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
          <h4 className="font-semibold text-primary mb-2">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">T-Shirt Size:</span> {formData.tshirtSize || 'Not specified'}</div>
            <div><span className="font-medium">Dietary Preference:</span> {formData.dietaryPreference || 'Not specified'}</div>
          </div>
        </div>
        
        <div className="bg-secondary/20 p-4 rounded-lg border border-themed">
          <h4 className="font-semibold text-primary mb-2">Event Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Event:</span> {event.eventTitle}</div>
            {event.registrationFee && (
              <div><span className="font-medium">Registration Fee:</span> ₹{event.registrationFee}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="flex items-start gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="agreeToTerms" 
            checked={formData.agreeToTerms} 
            onChange={handleInputChange} 
            className={`mt-1 w-4 h-4 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
          />
          <span className="text-sm text-primary">
            I agree to the terms and conditions of this event. I understand that my personal information will be used for event-related communications and processing.
          </span>
        </label>
        {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return renderPersonalDetailsStep();
      case 2:
        return event.teamEvent ? renderTeamDetailsStep() : renderAdditionalInfoStep();
      case 3:
        return event.teamEvent ? renderAdditionalInfoStep() : renderReviewStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const maxStep = event.teamEvent ? 4 : 3;

  return (
    <motion.div 
      className="fixed inset-0 bg-primary flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full blur-xl" style={{
        backgroundColor: 'var(--bg-secondary)',
        opacity: 0.3
      }}></div>
      <div className="absolute bottom-20 right-16 w-32 h-32 rounded-full blur-xl" style={{
        backgroundColor: 'var(--bg-accent)',
        opacity: 0.3
      }}></div>
      <motion.div
        className="modal-content bg-primary p-6 rounded-2xl shadow-lg w-full max-w-3xl border-2 border-themed relative my-8 max-h-[85vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-primary hover:text-accent transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold text-primary mb-6">
          Register for {event.eventTitle}
        </h2>
        
        {renderStepIndicator()}
        
        <form onSubmit={step === maxStep ? handleSubmit : (e) => e.preventDefault()}>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={handleBack}
                className="btn-secondary px-4 py-2 rounded-lg border-2 flex items-center gap-1"
              >
                Back
              </button>
            ) : (
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary px-4 py-2 rounded-lg border-2"
              >
                Cancel
              </button>
            )}
            
            {step < maxStep ? (
              <button 
                type="button" 
                onClick={handleNext}
                className="btn-primary px-4 py-2 rounded-lg border-2 flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-primary px-6 py-2 rounded-lg border-2"
              >
                Complete Registration
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EventRegistrationForm;