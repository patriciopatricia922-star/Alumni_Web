import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const SurveyComplete = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{
        marginLeft: '229px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Card */}
        <div style={{
          background: 'rgba(13, 19, 56, 0.4)',
          border: '1.24px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          borderRadius: '14px',
          padding: '50px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          width: '345px',
        }}>

          {/* Icon */}
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            {/* Glow */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: '#2B72FB',
              opacity: 0.2,
              filter: 'blur(24px)',
              borderRadius: '50%',
            }} />
            {/* Circle icon */}
            <svg
              width="80" height="80" viewBox="0 0 80 80" fill="none"
              style={{ position: 'absolute', inset: 0 }}
            >
              <circle cx="40" cy="40" r="34" stroke="#2B72FB" strokeWidth="5" fill="none" />
              <path d="M26 40L35 50L54 30" stroke="#2B72FB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Heading */}
          <span style={{
            fontFamily: 'Arimo, Arial',
            fontWeight: 400,
            fontSize: '28px',
            lineHeight: '42px',
            color: '#FFFFFF',
            textAlign: 'center',
          }}>
            Thank You!
          </span>

          {/* Body text */}
          <p style={{
            fontFamily: 'Arimo, Arial',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '26px',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            margin: 0,
            width: '278px',
          }}>
            Your responses have been successfully submitted. We appreciate your time and feedback!
          </p>

          {/* Return to Dashboard button */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '247px',
              height: '47px',
              background: '#0028FF',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Arimo, Arial',
              fontSize: '15px',
              lineHeight: '22px',
              color: '#FFFFFF',
              cursor: 'pointer',
              textAlign: 'center',
            }}
            onMouseOver={e => e.target.style.opacity = '0.9'}
            onMouseOut={e => e.target.style.opacity = '1'}
          >
            Return to Dashboard
          </button>

        </div>
      </div>
    </div>
  );
};

export default SurveyComplete;