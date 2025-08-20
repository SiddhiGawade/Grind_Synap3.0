# EmailJS Template Setup for Hackathon Invitations

## Template ID: template_abekdac

This document explains how to set up the EmailJS template for sending hackathon invitation emails to participants.

## Template Variables

The following variables are used in the email template and will be automatically populated by the application:

### Recipient Information
- `{{to_email}}` - Participant's email address
- `{{participant_name}}` - Name of the participant (or "Team Member" for invited members)

### Event Information
- `{{event_name}}` - Name of the hackathon/event
- `{{event_description}}` - Description of the event
- `{{event_type}}` - Type of event (e.g., "hackathon")
- `{{event_start_date}}` - Event start date
- `{{event_start_time}}` - Event start time
- `{{event_end_date}}` - Event end date
- `{{event_end_time}}` - Event end time
- `{{event_venue}}` - Event venue or "TBD"
- `{{event_mode}}` - Event mode (Online/Offline/Hybrid)
- `{{event_code}}` - Unique event code
- `{{registration_deadline}}` - Last date for registration

### Team Information
- `{{team_name}}` - Name of the team (or "Individual" for solo participants)
- `{{team_leader_name}}` - Name of the team leader
- `{{team_leader_email}}` - Email of the team leader
- `{{min_team_size}}` - Minimum team size allowed
- `{{max_team_size}}` - Maximum team size allowed

### Event Details
- `{{themes}}` - Hackathon themes (comma-separated)
- `{{tracks}}` - Competition tracks (comma-separated)
- `{{eligibility}}` - Eligibility criteria
- `{{prize_details}}` - Information about prizes
- `{{submission_guidelines}}` - Guidelines for submissions
- `{{evaluation_criteria}}` - How submissions will be evaluated

### Organizer Information
- `{{organizer_name}}` - Name of the event organizer
- `{{organizer_email}}` - Contact email of the organizer

## Setting up the EmailJS Template

1. **Log in to EmailJS Dashboard**
   - Go to https://dashboard.emailjs.com/
   - Log in with your account

2. **Navigate to Email Templates**
   - Click on "Email Templates" in the sidebar
   - Find the template with ID: `template_abekdac`

3. **Template Configuration**
   - **Subject**: `🎉 Welcome to {{event_name}} - You're Registered!`
   - **Content**: Use the HTML template provided in `hackathon-invitation-template.html` or the text version in `hackathon-invitation-template.txt`

4. **Template Settings**
   - **To Email**: Use `{{to_email}}`
   - **From Name**: Your organization name
   - **Reply To**: `{{organizer_email}}`

## HTML Template Usage

If using the HTML template (`hackathon-invitation-template.html`):
1. Copy the entire HTML content
2. Paste it into the EmailJS template editor
3. Make sure all the variable placeholders ({{variable_name}}) are preserved
4. Test the template with sample data

## Text Template Usage

If using the text template (`hackathon-invitation-template.txt`):
1. Copy the text content
2. Paste it into the EmailJS template editor
3. Ensure all variable placeholders are preserved
4. Test the template

## Testing the Template

Use these sample values for testing:
```
to_email: test@example.com
participant_name: John Doe
event_name: Innovation Hackathon 2024
event_type: hackathon
event_start_date: 2024-03-15
event_start_time: 09:00 AM
team_name: Code Warriors
team_leader_name: John Doe
organizer_name: Tech Organization
organizer_email: organizer@techorg.com
```

## Environment Variables Required

Make sure these are set in your `.env` file:
```
VITE_EMAILJS_SERVICE_ID=service_99yk4us
VITE_EMAILJS_INVITATION_TEMPLATE_ID=template_abekdac
VITE_EMAILJS_PUBLIC_KEY=4h8Dq7z_reAUzHagL
```

## Notes

- The template is responsive and works well on both desktop and mobile devices
- All participant emails (team leader + invited members) will receive this invitation
- The email includes comprehensive event information to ensure participants have all necessary details
- The design uses modern styling with gradients and proper spacing for professional appearance
