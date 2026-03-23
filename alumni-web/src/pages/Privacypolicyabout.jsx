import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrivacyPolicyAboutView from '../Views/PrivacyPolicyAboutView';

const SECTIONS = [
  { title: '1. Information We Collect',      body: 'We may collect the following types of information: Personal Information: Name, Contact Details, Demographic info. Educational Data: Program, Year Graduated, Academic Records (when applicable). Employment Information: Job Details, Career Progress, and Related Survey Responses. Usage Data: Device Information, Logs, and Interactions with the Platform.' },
  { title: '2. How We Use Your Information', body: 'Information collected through AlumnAI may be used to: Maintain and improve alumni records. Analyze graduate outcomes and employment trends. Provide personalized alumni services, opportunities, and notifications. Enhance the overall alumni engagement experience.' },
  { title: '3. Data Sharing',                body: 'We do not sell personal data. Information may only be shared with: Internal university offices for legitimate academic or administrative purposes. Third-party service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements.' },
  { title: '4. Data Security',               body: 'We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.' },
  { title: '5. User Rights',                 body: 'You have the right to: Access a copy of your personal data. Update or correct inaccurate information.' },
  { title: '6. Cookies and Tracking',        body: 'The platform may use cookies or similar technologies to improve functionality and user experience.' },
  { title: '7. Data Retention',              body: 'Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.' },
  { title: '8. Third-Party Links',           body: 'AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.' },
  { title: '9. Updates to the Policy',       body: 'We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.' },
  { title: '10. Contact Us',                 body: "For questions or requests regarding your data or privacy:\nEmail: nudaao@nu-dasma.edu.ph\nPhone: 09399151561(Smart) / 09661381357(Globe)\nLocation: Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114" },
];

const PrivacyPolicyAbout = () => {
  const navigate = useNavigate();

  return (
    <PrivacyPolicyAboutView
      sections={SECTIONS}
      navigate={navigate}
    />
  );
};

export default PrivacyPolicyAbout;