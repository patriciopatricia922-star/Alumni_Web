import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const scrollbarStyles = `
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(217,202,129,0.4); border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(217,202,129,0.8); }
`;

const PrivacyPolicyAbout = () => {
  const sections = [
    { title: '1. Information We Collect', body: 'We may collect the following types of information: Personal Information: Name, Contact Details, Demographic info. Educational Data: Program, Year Graduated, Academic Records (when applicable). Employment Information: Job Details, Career Progress, and Related Survey Responses. Usage Data: Device Information, Logs, and Interactions with the Platform.' },
    { title: '2. How We Use Your Information', body: 'Information collected through AlumnAI may be used to: Maintain and improve alumni records. Analyze graduate outcomes and employment trends. Provide personalized alumni services, opportunities, and notifications. Enhance the overall alumni engagement experience.' },
    { title: '3. Data Sharing', body: 'We do not sell personal data. Information may only be shared with: Internal university offices for legitimate academic or administrative purposes. Third-party service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements.' },
    { title: '4. Data Security', body: 'We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.' },
    { title: '5. User Rights', body: 'You have the right to: Access a copy of your personal data. Update or correct inaccurate information.' },
    { title: '6. Cookies and Tracking', body: 'The platform may use cookies or similar technologies to improve functionality and user experience.' },
    { title: '7. Data Retention', body: 'Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.' },
    { title: '8. Third-Party Links', body: 'AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.' },
    { title: '9. Updates to the Policy', body: 'We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.' },
    { title: '10. Contact Us', body: "For questions or requests regarding your data or privacy:\nEmail: nudaao@nu-dasma.edu.ph\nPhone: 0912-345-6789\nLocation: Governor\'s Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114" },
  ];

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#002263', fontFamily: 'Arimo, sans-serif', overflow: 'hidden' }}>
        <Sidebar />

        <div style={{ marginLeft: '229px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', padding: '37px 51px', boxSizing: 'border-box', overflow: 'hidden' }}>

          {/* Back Button — top-left, same as About */}
          <div style={{ flexShrink: 0, marginBottom: '0' }}>
            <Link to="/about" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
            </Link>
          </div>

          {/* Card — centred in remaining space */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <div style={{ width: '100%', maxWidth: '864px', maxHeight: '85vh', background: 'rgba(13,19,56,0.25)', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ padding: '42px 88px 24px', textAlign: 'center', flexShrink: 0 }}>
                <h1 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '28px', lineHeight: '42px', color: '#FFFFFF', margin: '0 0 8px 0' }}>Privacy Policy</h1>
                <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '14px', lineHeight: '21px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Last Updated: February 28, 2026</p>
              </div>

              {/* Scrollable content */}
              <div className="custom-scroll" style={{ padding: '0 88px 42px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sections.map((section, index) => (
                  <div key={index}>
                    <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', lineHeight: '24px', color: '#D9CA81', margin: '0 0 4px 0' }}>{section.title}</p>
                    <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0, whiteSpace: 'pre-line' }}>{section.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyAbout;