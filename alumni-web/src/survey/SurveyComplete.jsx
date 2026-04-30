import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

/* ─── Google Fonts: Montserrat ─────────────────────────────────────────────── */
const fontLink = document.querySelector('#montserrat-font');
if (!fontLink) {
  const link = document.createElement('link');
  link.id = 'montserrat-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap';
  document.head.appendChild(link);
}

/*
 * ─── Scale factor: 0.78 ───────────────────────────────────────────────────
 * Applied uniformly to every measurement derived from the Figma spec so the
 * card, its typography, spacing, and child elements all shrink together at
 * the same ratio — no individual element distorts relative to another.
 *
 * Card footprint:  672 × 728 px  →  524 × 568 px
 * Card padding:    45/48/50 px   →  35/37/39 px
 * Heading font:    36 px         →  28 px
 * Body font:       18 px         →  14 px
 * Icon circle:     96 px         →  75 px
 * Stat cards:      181 px wide   →  141 px wide
 * Button:          235 × 40 px   →  183 × 31 px
 */

const SurveyComplete = () => {
  const navigate = useNavigate();

  /* ── Scoped scroll suppression — this page only ──────────────────────────
     Targets #root so no other route is affected. Restored on unmount.      */
  useEffect(() => {
    const el = document.getElementById('root') || document.body;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#e8edf5',
        fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Main content area ───────────────────────────────────────────────── */}
      <div
        style={{
          marginLeft: '229px',
          flex: 1,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',     /* vertical centering */
          justifyContent: 'center', /* horizontal centering */
          padding: '0 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        {/* ── Notification bell — position unchanged ────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            width: '52px',
            height: '52px',
            background: '#003ea6',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 4px 12px rgba(0,62,166,0.35)',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
              fill="white"
            />
          </svg>
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '16px',
              height: '16px',
              background: '#ef4444',
              borderRadius: '50%',
              border: '2px solid #003ea6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            3
          </span>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            Card  —  all values scaled at 0.78× from the original Figma spec.
            width: 524px | height: 568px | border-radius: 19px
            Centered via parent flexbox; flexShrink:0 prevents distortion.
        ══════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '19px',
            boxShadow: '0px 8px 40px rgba(0,0,0,0.12)',
            width: '524px',
            height: '568px',
            flexShrink: 0,
            padding: '35px 37px 39px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >

          {/* ── Check icon ── container: 75px | svg: 44px ───────────────────── */}
          <div
            style={{
              width: '75px',
              height: '75px',
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '19px',
              flexShrink: 0,
            }}
          >
            <svg width="44" height="44" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" stroke="#22c55e" strokeWidth="2.5" fill="none" />
              <path
                d="M17 28L24 36L39 20"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* ── Heading — 28px / lh 32px ────────────────────────────────────── */}
          <h1
            style={{
              color: '#1e3a5f',
              fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '32px',
              textAlign: 'center',
              margin: '0 0 16px 0',
              whiteSpace: 'nowrap',
            }}
          >
            Thank You!
          </h1>

          {/* ── Body text — 14px / lh 25px / maxWidth 350px ─────────────────── */}
          <p
            style={{
              color: '#4a5565',
              fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '25px',
              textAlign: 'center',
              margin: '0 0 20px 0',
              maxWidth: '350px',
            }}
          >
            Your responses have been successfully submitted. We appreciate your time and
            valuable feedback.
          </p>

          {/* ── Stats row — gap 20px ─────────────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '22px',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {/* Sections Completed — 141px wide, padding 12px, radius 11px */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '11px',
                boxShadow: '4px 4px 15px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                width: '141px',
                gap: '3px',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="15" r="6" stroke="#003ea6" strokeWidth="1.5" fill="none" />
                <path d="M9 3H15L13 9H11L9 3Z" stroke="#003ea6" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M9 3L11 9" stroke="#003ea6" strokeWidth="1.5" />
                <path d="M15 3L13 9" stroke="#003ea6" strokeWidth="1.5" />
              </svg>
              <span
                style={{
                  color: '#003ea6',
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: '19px',
                  lineHeight: '25px',
                }}
              >
                7
              </span>
              <span
                style={{
                  color: '#4a5565',
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '13px',
                  textAlign: 'center',
                }}
              >
                Sections Completed
              </span>
            </div>

            {/* Progress — 141px wide */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '11px',
                boxShadow: '4px 4px 15px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                width: '141px',
                gap: '3px',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L9 12L13 16L20 8" stroke="#f5cb00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 8H20V12" stroke="#f5cb00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                style={{
                  color: '#f5cb00',
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: '19px',
                  lineHeight: '25px',
                }}
              >
                100%
              </span>
              <span
                style={{
                  color: '#4a5565',
                  fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '13px',
                  textAlign: 'center',
                }}
              >
                Progress
              </span>
            </div>
          </div>

          {/* ── What's next banner — padding 15/19px, radius 11px ────────────── */}
          <div
            style={{
              background: 'rgba(21,93,252,0.25)',
              borderRadius: '11px',
              padding: '15px 19px',
              width: '100%',
              boxSizing: 'border-box',
              marginBottom: '23px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                color: '#003ea6',
                fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                margin: '0 0 6px 0',
              }}
            >
              What's next?
            </p>
            <p
              style={{
                color: '#6a7282',
                fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '18px',
                margin: 0,
              }}
            >
              Your responses help us improve our programs and services, we're using alumni
              feedback to enhance the NU-Dasmariñas experience.
            </p>
          </div>

          {/* ── Button — 183 × 31px, radius 8px, font 12px ──────────────────── */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#003ea6',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
              color: '#ffffff',
              cursor: 'pointer',
              fontFamily: "'Montserrat', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              lineHeight: '19px',
              height: '31px',
              width: '183px',
              textAlign: 'center',
              transition: 'opacity 0.15s ease',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Return to Dashboard
          </button>

        </div>
      </div>
    </div>
  );
};

export default SurveyComplete;