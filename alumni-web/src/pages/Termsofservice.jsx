import React from 'react';
import { Link } from 'react-router-dom';

const scrollbarStyles = `
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(217, 202, 129, 0.4);
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(217, 202, 129, 0.8);
  }
`;

const TermsOfService = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: 'By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.',
    },
    {
      title: '2. Purpose of the Platform',
      body: 'AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.',
    },
    {
      title: '3. User Responsibilities',
      body: 'Provide accurate and truthful information. Use the platform only for lawful and appropriate purposes. Keep your login credentials secure and confidential. Refrain from activities that may disrupt or harm the platform.',
    },
    {
      title: '4. Data Use and Accuracy',
      body: 'The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.',
    },
    {
      title: '5. Availability and Updates',
      body: 'The institution may modify, update, or discontinue platform features at any time without prior notice.',
    },
    {
      title: '6. Limitation of Liability',
      body: 'AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.',
    },
    {
      title: '7. Changes to the Terms',
      body: 'We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.',
    },
  ];

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div
        style={{
          width: '100%',
          height: '100vh',
          background: '#002263',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Back Button */}
        <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
          <Link
            to="/register"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>
              Back
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            width: '864px',
            maxHeight: '85vh',
            background: 'rgba(13, 19, 56, 0.25)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Sticky Header */}
          <div
            style={{
              padding: '42px 88px 24px',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <h1 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: '28px', lineHeight: '42px', color: '#FFFFFF', margin: '0 0 8px 0' }}>
              Terms of Service
            </h1>
            <p style={{ fontFamily: 'Arial', fontWeight: 400, fontSize: '14px', lineHeight: '21px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              Last Updated: February 28, 2026
            </p>
          </div>

          {/* Scrollable Sections */}
          <div
            className="custom-scroll"
            style={{
              padding: '0 88px 42px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {sections.map((section, index) => (
              <div key={index}>
                <p style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '16px', lineHeight: '24px', color: '#D9CA81', margin: '0 0 4px 0' }}>
                  {section.title}
                </p>
                <p style={{ fontFamily: 'Arial', fontWeight: 400, fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;