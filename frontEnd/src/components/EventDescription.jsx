import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, Clock, Award, X, Plus } from 'lucide-react';

const EventDescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(location.state?.event || null);

  useEffect(() => {
    if (!event) {
      // If no event was passed, try to fetch it from the server
      const eventId = location.pathname.split('/').pop();
      if (eventId) {
        fetch(`/api/events/${eventId}`)
          .then(res => res.json())
          .then(data => setEvent(data))
          .catch(err => console.error('Error fetching event:', err));
      }
    }
  }, [location]);

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h2>
          <p className="mb-6">The event you're looking for doesn't exist or couldn't be loaded.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Helper to determine event status
  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event.startDate || event.start_date);
    const endDate = new Date(event.endDate || event.end_date);
    
    if (now < startDate) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now > endDate) {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { status: 'live', color: 'bg-green-100 text-green-800' };
    }
  };

  const eventStatus = getEventStatus();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>
        
        {/* Main card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header with image */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black/30 flex items-end p-6">
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{event.eventTitle || event.title || event.name}</h1>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${eventStatus.color}`}>
                    {eventStatus.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-blue-100 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {event.organization || event.organizer || 'Synap Events'}
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Event details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* When */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  When
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Starts</p>
                    <p className="text-gray-900">
                      {event.startDate} {event.startTime && `at ${event.startTime}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ends</p>
                    <p className="text-gray-900">
                      {event.endDate} {event.endTime && `at ${event.endTime}`}
                    </p>
                  </div>
                  {event.registrationDeadline && (
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-600">Registration Deadline</p>
                      <p className="text-gray-900">{event.registrationDeadline}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Where */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Where
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mode</p>
                    <p className="text-gray-900 capitalize">
                      {event.mode || 'Not specified'}
                    </p>
                  </div>
                  {event.meetingLink && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {event.mode === 'online' ? 'Meeting Link' : 'Venue'}
                      </p>
                      <p className="text-gray-900 break-words">
                        {event.meetingLink}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Participation */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Participation
                </h3>
                <div className="space-y-2">
                  {event.teamSize && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Team Size</p>
                      <p className="text-gray-900">{event.teamSize}</p>
                    </div>
                  )}
                  {event.maxParticipants && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Max Participants</p>
                      <p className="text-gray-900">{event.maxParticipants}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prizes & Certificates */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Prizes & Certificates
                </h3>
                <div className="space-y-2">
                  {event.prizes ? (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Prizes</p>
                      <p className="text-gray-900">{event.prizes}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No prize information available</p>
                  )}
                  <p className="text-green-600 text-sm flex items-center gap-1">
                    <span>✓</span> Participation certificates will be provided
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none text-gray-700">
                {event.eventDescription || event.description || 'No description available.'}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/register', { state: { event } })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                disabled={eventStatus.status === 'ended'}
              >
                <Plus size={20} />
                {eventStatus.status === 'ended' ? 'Registration Closed' : 'Register Now'}
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDescription;

/*
How to use:

1. Add this file to frontEnd/src/EventDescriptionPage.jsx.

2. Register the route in your router (e.g., App.jsx or wherever your routes are defined):

   import EventDescriptionPage from "./EventDescriptionPage";
   ...
   <Route path="/event/:eventId" element={<EventDescriptionPage />} />

3. When clicking on the Register button, navigate to the page and pass event data:

   import { useNavigate } from "react-router-dom";
   ...
   const navigate = useNavigate();
   ...
   <button onClick={() => navigate(`/event/${event.id}`, { state: event })}>Register</button>

Where "event" contains all the necessary fields:
{
  id: "H2F3K8",
  name: "Testing",
  type: "Hackathon",
  organizer: "Mujhe",
  description: "fadfadf",
  startDate: "21 August 2025",
  startTime: "05:30",
  endDate: "28 August 2025",
  endTime: "05:30",
  registrationDeadline: "23 August 2025 at 05:30",
  mode: "In-Person",
  meetingLink: "Dekhte hai",
  teamSize: "2 - 4 members",
  maxParticipants: 120,
  prizes: "100k"
}

This will open the event details in a new page with the same format as your modal/popup.

No other files are changed!
*/