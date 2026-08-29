import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

/* ─── Google Fonts: Montserrat ─────────────────────────────────────────────── */
const fontLink = document.querySelector('#montserrat-font');
if (!fontLink) {
  const link = document.createElement('link');
  link.id = 'montserrat-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

/* ─── Survey sections shown in the completed checklist ─────────────────────── */
const SECTIONS = [
  'Personal Background',
  'Educational Background',
  'Certification Achievement',
  'Employment Information',
  'Work Experience',
  'Skills & Competencies',
  'Feedback and Engagement',
];

const SurveyComplete = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  /* ── Scoped scroll suppression — this page only ──────────────────────────
     Targets #root so no other route is affected. Restored on unmount.      */
  useEffect(() => {
    const el = document.getElementById('root') || document.body;
    const prev = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = prev; };
  }, []);

  /* ── Entrance animation trigger — card fade-in + staggered checklist ────── */
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{ fontFamily: "'Montserrat', Helvetica, Arial, sans-serif", background: '#e8edf5' }}>
      <style>{`
        .sc-wrap { display: flex; min-height: 100vh; }
        .sc-main {
          margin-left: 229px;
          flex: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          box-sizing: border-box;
          position: relative;
          overflow-y: auto;
          background-image: radial-gradient(rgba(0,62,166,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .sc-card {
          width: 100%;
          max-width: 780px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 1px 2px rgba(15,35,65,0.04), 0 32px 60px -28px rgba(0,62,166,0.28);
          box-sizing: border-box;
          display: flex;
          overflow: hidden;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .sc-card.in { opacity: 1; transform: translateY(0); }

        .sc-left {
          flex: 0 0 38%;
          background: #003ea6;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #ffffff;
        }
        .sc-right {
          flex: 1;
          padding: 36px 36px 32px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .sc-badge-glow {
          width: 104px;
          height: 104px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
        }
        .sc-check-badge {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(0,20,60,0.25);
        }

        .sc-rate {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.18);
          width: 100%;
        }

        .sc-check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 6px;
          margin: 0 -6px;
          border-radius: 8px;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.35s ease, transform 0.35s ease, background 0.15s ease;
        }
        .sc-check-row.in { opacity: 1; transform: translateX(0); }
        .sc-check-row:hover { background: #f8fafc; }

        .sc-banner {
          border-left: 3px solid #003ea6;
          background: #f8fafc;
          border-radius: 0 10px 10px 0;
          padding: 13px 16px;
          margin: 18px 0 22px 0;
          text-align: left;
        }

        .sc-btn {
          width: 100%;
          background: #003ea6;
          border: none;
          border-radius: 12px;
          color: #ffffff;
          cursor: pointer;
          font-family: 'Montserrat', Helvetica, Arial, sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.01em;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: auto;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .sc-btn:hover { background: #003491; }
        .sc-btn:hover .sc-arrow { transform: translateX(3px); }
        .sc-btn:active { transform: scale(0.98); }
        .sc-btn:focus-visible { outline: 2px solid #6ea8ff; outline-offset: 2px; }
        .sc-arrow { transition: transform 0.15s ease; display: flex; }

        @media (max-width: 768px) {
          .sc-main { margin-left: 0; padding: 24px 16px; }
        }
        @media (max-width: 640px) {
          .sc-card { flex-direction: column; max-width: 440px; }
          .sc-left { flex: none; padding: 32px 28px 28px; }
          .sc-right { padding: 28px 24px 26px; }
          .sc-rate { margin-top: 20px; padding-top: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-card, .sc-check-row, .sc-btn, .sc-arrow {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="sc-wrap">
        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <Sidebar />

        {/* ── Main content area ───────────────────────────────────────────────── */}
        <div className="sc-main">
          <div className={`sc-card${mounted ? ' in' : ''}`}>

            {/* Left: brand panel */}
            <div className="sc-left">
              <div className="sc-badge-glow">
                <div className="sc-check-badge">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5L9.5 17L19 6.5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px, 3vw, 27px)', lineHeight: '1.25', letterSpacing: '-0.01em', margin: '0 0 10px 0' }}>
                Thank you!
              </h1>
              <p style={{ fontWeight: 400, fontSize: '14px', lineHeight: '1.6', opacity: 0.8, margin: 0, maxWidth: '260px' }}>
                Your responses have been submitted. We appreciate your time and feedback.
              </p>

              <div className="sc-rate">
                <div style={{ fontWeight: 700, fontSize: '30px', lineHeight: '1.1' }}>100%</div>
                <div style={{ fontWeight: 500, fontSize: '11px', letterSpacing: '0.03em', opacity: 0.65, marginTop: '4px' }}>
                  Response rate
                </div>
              </div>
            </div>

            {/* Right: detail panel */}
            <div className="sc-right">
              <p style={{ color: '#1e3a5f', fontWeight: 600, fontSize: '13px', letterSpacing: '0.02em', margin: '0 0 4px 0' }}>
                You completed 7 of 7 sections
              </p>
              <p style={{ color: '#94a3b8', fontWeight: 400, fontSize: '12px', margin: '0 0 14px 0' }}>
                Every part of the survey has been recorded.
              </p>

              <div>
                {SECTIONS.map((label, i) => (
                  <div
                    key={label}
                    className={`sc-check-row${mounted ? ' in' : ''}`}
                    style={{ transitionDelay: mounted ? `${0.15 + i * 0.06}s` : '0s' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="11" fill="#dcfce7" />
                      <path d="M7.5 12.5L10.3 15.3L16.5 8.7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ color: '#334155', fontWeight: 400, fontSize: '13.5px' }}>{label}</span>
                  </div>
                ))}
              </div>

              <div className="sc-banner">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <circle cx="12" cy="12" r="9" stroke="#003ea6" strokeWidth="1.6" fill="none" />
                    <path d="M12 11V16.5" stroke="#003ea6" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="8" r="1" fill="#003ea6" />
                  </svg>
                  <div>
                    <p style={{ color: '#003ea6', fontWeight: 600, fontSize: '13px', lineHeight: '1.4', margin: '0 0 4px 0' }}>
                      What's next?
                    </p>
                    <p style={{ color: '#64748b', fontWeight: 400, fontSize: '12.5px', lineHeight: '1.5', margin: 0 }}>
                      Your feedback helps us improve our programs and enhance the NU-Dasmariñas experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Button — preserves original navigate('/dashboard') handler ──── */}
              <button className="sc-btn" onClick={() => navigate('/dashboard')}>
                Return to dashboard
                <span className="sc-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyComplete;