import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const About = () => {
  const navigate = useNavigate();

  const links = [
    { label: 'Terms of Service', action: () => navigate('/terms') },
    { label: 'Privacy Policy', action: () => navigate('/privacy') },
    { label: 'Contact Support', action: () => navigate('/contact-support') },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '229px', flex: 1, padding: '37px 51px', position: 'relative' }}>

        {/* Notification Bell — fixed top right */}
        <div style={{ position: 'fixed', top: '53px', right: '51px', zIndex: 50 }}>
          <button style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, rgba(15, 22, 66, 0.1) 0%, rgba(10, 15, 46, 0.05) 100%)',
            border: '1.24px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px',
              background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* Centered Card */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '31px' }}>
          <div style={{
            position: 'relative',
            width: '547px',
            background: 'rgba(13, 19, 56, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '34px 38px 40px',
            boxSizing: 'border-box',
          }}>

            {/* Back button */}
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                marginBottom: '24px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>
                Back
              </span>
            </button>

            {/* Title */}
            <h2 style={{
              fontFamily: 'Arimo', fontWeight: 700,
              fontSize: '19px', lineHeight: '20px',
              color: '#FFFFFF', margin: '0 0 8px 0',
              textAlign: 'center',
            }}>
              About AlumnAI
            </h2>
            <p style={{
              fontFamily: 'Arimo', fontWeight: 400,
              fontSize: '15px', lineHeight: '20px',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: '0 0 24px 0', textAlign: 'center',
            }}>
              Learn more about the platform
            </p>

            {/* App Info Card */}
            <div style={{
              background: 'rgba(13, 19, 56, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '32px 24px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}>
              {/* Logo Icon */}
              <div style={{
                width: '90px', height: '90px',
                background: 'linear-gradient(180deg, #002263 0%, rgba(0, 69, 201, 0.05) 100%)',
                border: '1.24px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0px 10px 15px -3px rgba(43, 114, 251, 0.25), 0px 4px 6px -4px rgba(217, 202, 129, 0.1)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 14L8 22.5L24 31L40 22.5L24 14Z" stroke="#D9CA81" strokeWidth="2.67" strokeLinejoin="round"/>
                  <path d="M40 22.5V32" stroke="#D9CA81" strokeWidth="2.67" strokeLinecap="round"/>
                  <path d="M15 27V34L24 38.5L33 34V27" stroke="#D9CA81" strokeWidth="2.67" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* AlumnAI name */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '20px', lineHeight: '32px', color: '#FFFFFF' }}>Alumn</span>
                <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '20px', lineHeight: '32px', color: '#D9CA81' }}>AI</span>
              </div>

              {/* Description */}
              <p style={{
                fontFamily: 'Arimo', fontWeight: 400,
                fontSize: '17px', lineHeight: '28px',
                color: '#FFFFFF', textAlign: 'center', margin: 0,
              }}>
                Connecting National University—Dasmariñas alumni through a modern, intelligent platform built for lifelong community engagement.
              </p>
            </div>

            {/* Links Card */}
            <div style={{
              background: 'rgba(13, 19, 56, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '26px 28px',
            }}>
              {links.map((link, i) => (
                <React.Fragment key={i}>
                  <button
                    onClick={link.action}
                    style={{
                      width: '100%', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      background: 'none', border: 'none',
                      cursor: 'pointer', padding: '3px 0',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <span style={{
                      fontFamily: 'Arimo', fontWeight: 700,
                      fontSize: '16px', lineHeight: '20px', color: '#FFFFFF',
                    }}>
                      {link.label}
                    </span>
                    <svg width="13" height="20" viewBox="0 0 13 20" fill="none">
                      <path d="M2 2L11 10L2 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {i < links.length - 1 && (
                    <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
                  )}
                </React.Fragment>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default About;