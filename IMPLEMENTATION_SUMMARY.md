# Hackathon Participation Email Implementation

## Overview
This implementation automatically sends invitation emails to all participants (team leader + invited team members) after successful event registration using EmailJS.

## What's Been Implemented

### 1. Backend Changes (`server.js`)
- ✅ Added new endpoint `/api/send-participation-emails` for handling email data
- ✅ Modified registration endpoints to include `participant_emails` in the response
- ✅ Registration now stores participant emails in `metadata.participant_emails` array

### 2. Frontend Changes (`EventRegistrationForm.jsx`)
- ✅ Added EmailJS import: `import emailjs from '@emailjs/browser'`
- ✅ Created `sendInvitationEmails()` function that sends personalized emails to all participants
- ✅ Modified `handleSubmit()` to trigger email sending after successful registration
- ✅ Enhanced success messages to indicate email status

### 3. Environment Variables (`.env`)
- ✅ Added `VITE_EMAILJS_INVITATION_TEMPLATE_ID=template_abekdac`
- ✅ Existing EmailJS configuration:
  - `VITE_EMAILJS_SERVICE_ID=service_99yk4us`
  - `VITE_EMAILJS_PUBLIC_KEY=4h8Dq7z_reAUzHagL`

### 4. Email Templates
- ✅ Created comprehensive HTML email template (`hackathon-invitation-template.html`)
- ✅ Created text version (`hackathon-invitation-template.txt`)
- ✅ Created setup documentation (`README.md`)
- ✅ Created subject line templates (`subject-templates.md`)

## How It Works

### Registration Flow
1. User fills out the registration form
2. Form validates all fields
3. Registration data is submitted to backend
4. Backend stores registration with participant emails in metadata
5. Frontend collects all participant emails:
   - Team leader email (always included)
   - Valid team member emails from invite fields
6. Frontend sends personalized invitation email to each participant
7. Success message shows email sending status

### Email Data Structure
Each email includes these personalized fields:
```javascript
{
  to_email: participantEmail,
  participant_name: "John Doe" or "Team Member",
  event_name: "Innovation Hackathon 2024",
  event_description: "...",
  event_start_date: "2024-03-15",
  event_start_time: "09:00 AM",
  team_name: "Code Warriors",
  team_leader_name: "John Doe",
  team_leader_email: "john@example.com",
  organizer_name: "Tech Organization",
  // ... and many more fields
}
```

## EmailJS Template Setup

### Required Steps:
1. **Log in to EmailJS Dashboard** (https://dashboard.emailjs.com/)
2. **Find Template ID**: `template_abekdac`
3. **Set Subject**: `🎉 Welcome to {{event_name}} - You're Registered!`
4. **Copy Template Content**: Use the HTML from `hackathon-invitation-template.html`
5. **Configure Settings**:
   - To Email: `{{to_email}}`
   - From Name: Your organization name
   - Reply To: `{{organizer_email}}`

### Template Variables Used:
- **Recipient**: `to_email`, `participant_name`
- **Event Info**: `event_name`, `event_description`, `event_start_date`, `event_start_time`, etc.
- **Team Info**: `team_name`, `team_leader_name`, `team_leader_email`
- **Event Details**: `themes`, `tracks`, `prize_details`, `eligibility`
- **Organizer**: `organizer_name`, `organizer_email`

## Testing

### Test the Implementation:
1. Start the backend server
2. Start the frontend development server
3. Create or open an event
4. Fill out the registration form with:
   - Your personal details
   - Team information (if hackathon)
   - Include valid email addresses in team member fields
5. Complete registration
6. Check that all participants receive invitation emails

### Expected Behavior:
- ✅ All participant emails receive personalized invitations
- ✅ Team leader gets email with their name
- ✅ Team members get email as "Team Member"
- ✅ All emails contain complete event information
- ✅ Professional, responsive email design

## Database Storage
Participant emails are stored in Supabase `registrations` table:
```json
{
  "metadata": {
    "participant_emails": [
      "kamraanmulani8284@gmail.com",
      "fredrickmarsh2006@gmail.com", 
      "siddhigawade.sbg25@gmail.com"
    ]
  }
}
```

## Error Handling
- ✅ Graceful handling of email sending failures
- ✅ Registration still succeeds even if emails fail
- ✅ User gets appropriate feedback about email status
- ✅ Console logging for debugging email issues

## Files Modified/Created

### Modified:
- `frontEnd/.env` - Added invitation template ID
- `frontEnd/src/components/EventRegistrationForm.jsx` - Added email functionality
- `backEnd/server.js` - Added email endpoint and enhanced registration response

### Created:
- `email-templates/hackathon-invitation-template.html` - Professional HTML template
- `email-templates/hackathon-invitation-template.txt` - Text version
- `email-templates/README.md` - Setup documentation
- `email-templates/subject-templates.md` - Subject line options

## Next Steps
1. Configure the EmailJS template with the provided HTML/text content
2. Test the registration flow with real email addresses
3. Customize the email template branding as needed
4. Monitor email delivery and engagement

## Support
If you encounter any issues:
1. Check EmailJS console for template configuration
2. Verify environment variables are set correctly
3. Check browser console for JavaScript errors
4. Ensure all participant emails are valid format
