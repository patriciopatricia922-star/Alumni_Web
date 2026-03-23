import React from 'react';
import { useNavigate } from 'react-router-dom';
import TermsOfServiceAboutView from '../Views/TermsOfServiceAboutView';

const SECTIONS = [
  { title: '1. Acceptance of Terms',    body: 'By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.' },
  { title: '2. Purpose of the Platform', body: 'AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.' },
  { title: '3. User Responsibilities',   body: 'Provide accurate and truthful information. Use the platform only for lawful and appropriate purposes. Keep your login credentials secure and confidential. Refrain from activities that may disrupt or harm the platform.' },
  { title: '4. Data Use and Accuracy',   body: 'The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.' },
  { title: '5. Availability and Updates', body: 'The institution may modify, update, or discontinue platform features at any time without prior notice.' },
  { title: '6. Limitation of Liability', body: 'AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.' },
  { title: '7. Changes to the Terms',    body: 'We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.' },
];

const TermsOfServiceAbout = () => {
  const navigate = useNavigate();

  return (
    <TermsOfServiceAboutView
      sections={SECTIONS}
      navigate={navigate}
    />
  );
};

export default TermsOfServiceAbout;