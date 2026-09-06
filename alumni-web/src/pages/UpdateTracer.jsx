import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getSurveySections, invalidateSectionsCache } from '../lib/surveyProgress';
import DataPrivacyModal from '../modals/Dataprivacymodal';
import { useDpaGate } from '../hooks/useDpaGate';

/* ─── Google Fonts: Montserrat (shared with SurveyComplete) ────────────────── */
const fontLink = document.querySelector('#montserrat-font');
if (!fontLink) {
  const link = document.createElement('link');
  link.id   = 'montserrat-font';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
  document.head.appendChild(link);
}

// ─── Window width hook (unchanged) ───────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  React.useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const UpdateTracerPage = () => {
  const navigate     = useNavigate();
  const width        = useWindowWidth();
  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = 229;

  // ── DPA gate ──────────────────────────────────────────────────────────────
  const { showModal, requestNavigation, handleAccept, handleDecline } = useDpaGate(navigate);

  // ── First-section route (unchanged) ───────────────────────────────────────
  const [firstSectionRoute, setFirstSectionRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sections = await getSurveySections();
        if (!cancelled && sections.length > 0) {
          setFirstSectionRoute(sections[0].web_route);
        }
      } catch {
        if (!cancelled) setFirstSectionRoute('/survey/personal-background');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  // "Update Response" — invalidate cache first, then go through DPA gate.
  // forceShow: true ensures the DPA modal ALWAYS appears on the UpdateTracer
  // flow, even if the user has accepted it before. Re-submission means fresh
  // consent is required for each new data submission.
  const handleUpdateResponse = () => {
    invalidateSectionsCache();
    requestNavigation(firstSectionRoute ?? '/survey/personal-background', { forceShow: true });
  };

  const handleKeepResponse = () => {
    sessionStorage.removeItem('survey_claim_reward');
    sessionStorage.removeItem('survey_origin_route');
    navigate('/dashboard');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:    'flex',
      height:     '100vh',
      overflow:   'hidden',
      background: '#e8edf5',
      fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
    }}>
      {/* DPA Modal gate */}
      {showModal && (
        <DataPrivacyModal
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}

      <Sidebar />

      <div style={{
        marginLeft:     isMobile ? 0 : `${sidebarWidth}px`,
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        isMobile ? '20px' : isTablet ? '28px 32px' : '32px 51px',
        boxSizing:      'border-box',
        position:       'relative',
      }}>

        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <div style={{
          background:    '#ffffff',
          border:        'none',
          borderRadius:  '19px',
          padding:       isMobile ? '32px 24px' : '48px 40px',
          width:         '100%',
          maxWidth:      isMobile ? '100%' : '420px',
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          textAlign:     'center',
          boxShadow:     '0px 8px 40px rgba(0,0,0,0.12)',
        }}>

          <div style={{
            width:          isMobile ? '72px' : '75px',
            height:         isMobile ? '72px' : '75px',
            borderRadius:   '50%',
            background:     '#dbeafe',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            marginBottom:   '19px',
          }}>
            <svg width={isMobile ? 30 : 38} height={isMobile ? 30 : 38} viewBox="0 0 24 24" fill="none">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="#003ea6" strokeWidth="1.8"/>
              <path d="M8 9h8M8 12h8M8 15h5" stroke="#003ea6" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M14 3v4h4" stroke="#003ea6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p style={{
            fontFamily:    "'Montserrat', Helvetica, Arial, sans-serif",
            fontSize:      isMobile ? '22px' : '28px',
            fontWeight:    700,
            color:         '#1e3a5f',
            letterSpacing: '-0.5px',
            margin:        '0 0 14px 0',
          }}>
            Update Tracer?
          </p>

          <p style={{
            fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
            fontSize:   isMobile ? '13px' : '14px',
            color:      '#4a5565',
            lineHeight: 1.6,
            margin:     '0 0 32px 0',
          }}>
            You have previously submitted your response.{' '}
            Do you want to update it?
          </p>

          <button
            onClick={handleUpdateResponse}
            disabled={!firstSectionRoute}
            style={{
              width:        '100%',
              padding:      '14px',
              background:   firstSectionRoute ? '#003ea6' : 'rgba(0,62,166,0.35)',
              border:       'none',
              borderRadius: '10px',
              color:        '#FFFFFF',
              fontFamily:   "'Montserrat', Helvetica, Arial, sans-serif",
              fontSize:     isMobile ? '14px' : '15px',
              fontWeight:   700,
              cursor:       firstSectionRoute ? 'pointer' : 'not-allowed',
              marginBottom: '12px',
              boxShadow:    '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
              transition:   'opacity 0.15s',
            }}
            onMouseEnter={e => { if (firstSectionRoute) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {firstSectionRoute ? 'Update Response' : 'Loading…'}
          </button>

          <button
            onClick={handleKeepResponse}
            style={{
              width:        '100%',
              padding:      '14px',
              background:   'transparent',
              border:       '1.5px solid #003ea6',
              borderRadius: '10px',
              color:        '#003ea6',
              fontFamily:   "'Montserrat', Helvetica, Arial, sans-serif",
              fontSize:     isMobile ? '14px' : '15px',
              fontWeight:   700,
              cursor:       'pointer',
              transition:   'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#003ea6';
              e.currentTarget.style.color      = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color      = '#003ea6';
            }}
          >
            Keep Response
          </button>

        </div>
      </div>
    </div>
  );
};

export default UpdateTracerPage;