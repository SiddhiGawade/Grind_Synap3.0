// Test EmailJS Configuration
// Add this temporarily to your EventRegistrationForm.jsx for debugging

const testEmailJS = async () => {
  try {
    const testParams = {
      to_name: 'Test User',
      to_email: 'your-test-email@gmail.com', // Replace with your email
      participant_name: 'Test Participant',
      event_name: 'Test Hackathon',
      start_date: '2025-01-20',
      start_time: '10:00 AM',
      end_date: '2025-01-22',
      end_time: '6:00 PM',
      venue: 'Online',
      event_mode: 'Virtual',
      team_name: 'Test Team',
      team_size: '2',
      team_members: 'John Doe, Jane Smith',
      team_leader_name: 'Test Leader',
      organizer_name: 'Test Organizer',
      organizer_email: 'organizer@test.com',
      event_code: 'TEST123',
      themes: 'AI, Web Development',
      tracks: 'Innovation Track',
      prize_details: 'Exciting prizes!',
      registration_deadline: '2025-01-15'
    };

    console.log('Testing EmailJS with params:', testParams);

    const result = await emailjs.send(
      'service_99yk4us',
      'template_abekdac',
      testParams,
      '4h8Dq7z_reAUzHagL'
    );

    console.log('Test email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Test email failed:', error);
    throw error;
  }
};

// Call this function to test: testEmailJS();
