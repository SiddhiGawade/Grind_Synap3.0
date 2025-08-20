import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EventDescriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // The event data should be passed via React Router's location.state
  const event = location.state;

  if (!event) {
    return (
      <div style={{ padding: "2rem", color: "red" }}>
        <h2>No Event Details Provided</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{
      background: "#f8f4d8",
      borderRadius: "20px",
      maxWidth: "900px",
      margin: "2rem auto",
      padding: "2rem",
      boxShadow: "0 0 10px #ccc",
      fontFamily: "inherit"
    }}>
      <div style={{display: "flex", alignItems: "center"}}>
        <h1 style={{marginRight: "12px"}}>{event.name}</h1>
        <span style={{
          background: "#a8e6cf",
          color: "#444",
          borderRadius: "12px",
          padding: "4px 12px",
          fontWeight: "bold",
          marginRight: "12px"
        }}>{event.type || "Hackathon"}</span>
        <span style={{fontSize: "1.2rem"}}>👤 {event.organizer || "Organizer"}</span>
      </div>
      <div style={{
        border: "1px solid #594545",
        borderRadius: "10px",
        margin: "18px 0",
        padding: "16px",
        background: "#f8f4d8"
      }}>
        <h2 style={{marginBottom: "8px"}}>About This Event</h2>
        <div>{event.description}</div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "18px"
      }}>
        <div style={{
          border: "1px solid #594545",
          borderRadius: "10px",
          padding: "16px",
          background: "#f8f4d8"
        }}>
          <h3>📅 When</h3>
          <div>
            <strong>Starts</strong><br />
            {event.startDate} at {event.startTime}
          </div>
          <div>
            <strong>Ends</strong><br />
            {event.endDate} at {event.endTime}
          </div>
          <div>
            <strong>Registration Deadline</strong><br />
            {event.registrationDeadline}
          </div>
        </div>
        <div style={{
          border: "1px solid #594545",
          borderRadius: "10px",
          padding: "16px",
          background: "#f8f4d8"
        }}>
          <h3>📍 Where</h3>
          <div>
            <strong>Mode</strong><br />
            {event.mode}
          </div>
          <div>
            <strong>Meeting Link</strong><br />
            {event.meetingLink}
          </div>
        </div>
        <div style={{
          border: "1px solid #594545",
          borderRadius: "10px",
          padding: "16px",
          background: "#f8f4d8"
        }}>
          <h3>👥 Participation</h3>
          <div>
            <strong>Team Size</strong><br />
            {event.teamSize}
          </div>
          <div>
            <strong>Max Participants</strong><br />
            {event.maxParticipants}
          </div>
        </div>
        <div style={{
          border: "1px solid #594545",
          borderRadius: "10px",
          padding: "16px",
          background: "#f8f4d8"
        }}>
          <h3>🏆 Prizes & Certificates</h3>
          <div>
            <strong>Prizes</strong><br />
            {event.prizes}
          </div>
          <div>
            <span>✔ Participation certificates will be provided</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDescriptionPage;

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