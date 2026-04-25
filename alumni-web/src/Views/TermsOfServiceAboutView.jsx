// TermsOfServiceAboutView.jsx

import React from 'react';
import Sidebar from '../components/Sidebar';

const scrollbarStyles = `
  .custom-scroll::-webkit-scrollbar { width: 6px; }
  .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb { background: rgba(217,202,129,0.4); border-radius: 10px; }
  .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(217,202,129,0.8); }

  .tos-page {
    margin-left: 229px;
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 37px 51px;
    box-sizing: border-box;
    overflow: hidden;
    height: 100vh;
  }

  .tos-card-header {
    padding: 42px 88px 24px;
    text-align: center;
    flex-shrink: 0;
  }

  .tos-card-body {
    padding: 0 88px 42px;
  }

  .tos-title {
    font-family: Arimo;
    font-weight: 700;
    font-size: 28px;
    line-height: 42px;
    color: #FFFFFF;
    margin: 0 0 8px 0;
  }

  @media (max-width: 1024px) {
    .tos-page { margin-left: 200px; padding: 28px 32px; }
    .tos-card-header { padding: 32px 48px 20px; }
    .tos-card-body { padding: 0 48px 32px; }
    .tos-title { font-size: 24px; }
  }

  @media (max-width: 767px) {
    .tos-page { margin-left: 0; padding: 20px 16px 80px; height: auto; min-height: 100vh; overflow: auto; }
    .tos-card-header { padding: 24px 20px 16px; }
    .tos-card-body { padding: 0 20px 24px; }
    .tos-title { font-size: 20px; line-height: 30px; }
  }
`;

const TermsOfServiceAboutView = ({ sections, navigate }) => (
  <>
    <style>{scrollbarStyles}</style>
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: '#002263', fontFamily: 'Arimo, sans-serif', overflow: 'hidden' }}>
      <Sidebar />

      <div className="tos-page">

        {/* ── Back button ──────────────────────────────────────────────────── */}
        <div style={{ flexShrink: 0, marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/about')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '15px', color: '#FFFFFF' }}>Back</span>
          </button>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          <div style={{
            width: '100%',
            maxWidth: '864px',
            maxHeight: '85vh',
            background: 'rgba(13,19,56,0.25)',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div className="tos-card-header" style={{ flexShrink: 0 }}>
              <h1 className="tos-title">Terms of Service</h1>
              <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '14px', lineHeight: '21px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Last Updated: February 28, 2026
              </p>
            </div>

            {/* Scrollable content */}
            <div className="custom-scroll tos-card-body" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sections.map((section, index) => (
                <div key={index}>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '16px', lineHeight: '24px', color: '#D9CA81', margin: '0 0 4px 0' }}>
                    {section.title}
                  </p>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 400, fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  </>
);

export default TermsOfServiceAboutView;