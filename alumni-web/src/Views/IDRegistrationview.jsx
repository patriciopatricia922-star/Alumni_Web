import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CameraIcon from '../assets/camera_icn.svg';
import CameraIconBlue from '../assets/camerablue_icn.svg';
import '../styles/IDregistration.css';
import TermsModal         from '../modals/TermsModal';
import PrivacyPolicyModal from '../modals/PrivacyPolicyModal';

const IDRegistrationView = ({
  fileInputRef, videoRef, canvasRef,
  agreed, preview, showModal, cameraActive,
  status, errorMsg, extractedData, camGuide,
  borderColor, frameBorder,
  setAgreed, setShowModal,
  startCamera, stopCamera,
  handleFileChange, handleReset, handleNext,
  isModal = false,
  onClose,          // ← dedicated close/dismiss handler for modal context
  onSwitchToLogin,  // ← only used for the "Log in" footer link
}) => {
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null

  return (
    <>
      {/*
        aid-page-root:
          • Full-page route  → dark blue backdrop, fills viewport (default)
          • Modal context    → transparent, no min-height; parent overlay owns the backdrop
      */}
      <div
        className={`aid-page-root${isModal ? ' aid-page-root--modal' : ''}`}
        style={{ fontFamily: 'Arimo, Arial, sans-serif' }}
      >

        {/* Back link — full-page route only */}
        {!isModal && (
          <div className="aid-back">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </Link>
          </div>
        )}

        {/* ── Upload / Camera choice modal ──────────────────────────────────── */}
        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="aid-modal-box" onClick={e => e.stopPropagation()}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(43,114,251,0.15)',
                border: '1px solid rgba(43,114,251,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H5a2 2 0 00-2 2v4M9 3h6M9 3v18m6-18h4a2 2 0 012 2v4M15 3v18M9 21h6M3 9v6m18-6v6M3 15h18"
                    stroke="#51A2FF" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '17px', color: '#FFFFFF', margin: '0 0 5px' }}>Scan Alumni ID</h3>
                <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: '18px' }}>
                  Choose how you'd like to provide your ID for verification
                </p>
              </div>
              {/* Upload from device */}
              <button
                onClick={() => { setShowModal(false); fileInputRef.current?.click(); }}
                className="aid-choice-btn"
              >
                <div className="aid-choice-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                      stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Upload from Device</p>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>JPG, PNG, or other image formats</p>
                </div>
              </button>
              {/* Use camera */}
              <button onClick={startCamera} className="aid-choice-btn">
                <div className="aid-choice-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="4" stroke="#51A2FF" strokeWidth="2" />
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Use Camera</p>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>ID will be captured automatically when stable</p>
                </div>
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', marginTop: '4px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Camera fullscreen overlay ──────────────────────────────────────── */}
        {cameraActive && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: isModal ? 3000 : 200,
            background: '#000',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
          }}>
            <div style={{
              minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)', borderRadius: '20px', padding: '0 20px',
              backdropFilter: 'blur(4px)',
            }}>
              <p style={{ fontFamily: 'Arimo', fontSize: '14px', fontWeight: 600, color: '#FFFFFF', margin: 0, textAlign: 'center' }}>{camGuide}</p>
            </div>
            <div style={{ position: 'relative', width: '90%', maxWidth: '680px' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '16px', display: 'block' }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{
                  width: '88%', height: '60%',
                  border: `2px solid ${frameBorder}`,
                  borderRadius: '12px',
                  boxShadow: '0 0 0 2000px rgba(0,0,0,0.5)',
                  transition: 'border-color 0.3s ease',
                  position: 'relative',
                }}>
                  {[
                    { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
                    { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
                    { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
                    { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', width: 20, height: 20, borderStyle: 'solid', borderWidth: 0, borderColor: frameBorder, ...s }} />
                  ))}
                </div>
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                ID will be captured automatically when stable
              </p>
              <button
                onClick={stopCamera}
                style={{
                  height: '44px', padding: '0 28px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', fontFamily: 'Arimo', fontSize: '14px',
                  color: '#FFFFFF', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MAIN FLOATING CARD — Figma-faithful web layout
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="aid-floating-card">

          {/* ── Card header band ─────────────────────────────────────────────── */}
          <div className="aid-card-header">
            {/* Camera icon badge */}
            <div className="aid-header-icon">
              <img src={CameraIcon} alt="" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)' }} />
            </div>

            {/* Title + subtitle */}
            <div className="aid-header-text">
              <h1 className="aid-header-title">Alumni Registration</h1>
              <p className="aid-header-sub">Create your account to join</p>
            </div>

            {/* Close button:
                  • Modal context    → calls onClose to dismiss the parent modal
                  • Full-page route  → navigates back to "/" via Link
                  Focus ring is added via onFocus/onBlur for accessibility
                  without reintroducing any background or circular styling. */}
            {isModal ? (
              <button
                className="aid-header-close"
                onClick={onClose}
                title="Close"
                aria-label="Close registration modal"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  padding: 0,
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.outlineOffset = '3px';
                }}
                onBlur={e => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            ) : (
              <Link
                to="/"
                className="aid-header-close"
                title="Back"
                aria-label="Go back"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  padding: 0,
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.outlineOffset = '3px';
                }}
                onBlur={e => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Link>
            )}
          </div>

          {/* ── Card body ────────────────────────────────────────────────────── */}
          <div className="aid-card-body">

            {/* Photo of Alumni ID section */}
            <div className="aid-section">
              <h2 className="aid-section-label">Photo of Alumni ID</h2>

              {/* Upload area */}
              <div
                className="aid-upload-area"
                onClick={() => !preview && setShowModal(true)}
                style={{
                  border: `1.5px solid ${borderColor}`,
                  cursor: preview ? 'default' : 'pointer',
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Alumni ID Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="aid-upload-placeholder">
                    <img
                      src={CameraIconBlue}
                      alt="Upload ID"
                      style={{ width: '52px', height: '52px', opacity: 1 }}
                    />
                    <p className="aid-upload-hint">Click to upload or use camera</p>
                  </div>
                )}

                {/* Scanning overlay */}
                {status === 'scanning' && preview && (
                  <div className="aid-scan-overlay">
                    <div className="scan-line" />
                    <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div className="aid-spinner" />
                      <p style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Scanning ID...</p>
                    </div>
                  </div>
                )}

                {/* Verified badge */}
                {status === 'verified' && preview && (
                  <div className="aid-status-badge aid-badge-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                {/* Failed badge */}
                {status === 'failed' && preview && (
                  <div className="aid-status-badge aid-badge-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id="alumni-id-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Retake button */}
              {preview && status !== 'scanning' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button className="aid-retake-btn" onClick={handleReset}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Retake Image
                  </button>
                </div>
              )}
            </div>

            {/* Tips panel — idle, no preview */}
            {status === 'idle' && !preview && (
              <div className="aid-tips-panel">
                <div className="aid-tips-header">
                  <div className="aid-tips-icon">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#51A2FF" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="aid-tips-title">Tips for a successful scan</p>
                </div>
                {[
                  '1. Place your ID on a flat, well-lit surface before scanning.',
                  '2. Keep the ID straight and avoid tilting or angling it.',
                  '3. Make sure all text on the ID is clearly visible and not blurry.',
                  '4. Avoid covering any part of the ID with your fingers.',
                  "5. Avoid glare — don't scan under direct bright light or flash.",
                ].map((tip, i) => (
                  <p key={i} className="aid-tip-line">{tip}</p>
                ))}
              </div>
            )}

            {/* Scanning banner */}
            {status === 'scanning' && (
              <div className="aid-banner aid-banner-info">
                <div className="aid-spinner aid-spinner-sm" />
                <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: '#93C5FD', margin: 0 }}>
                  Reading your Alumni ID, please wait...
                </p>
              </div>
            )}

            {/* Failed banner */}
            {status === 'failed' && errorMsg && (
              <div className="aid-banner aid-banner-error">
                <div className="aid-banner-icon aid-banner-icon-error">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '12px', color: '#FCA5A5', margin: '0 0 2px' }}>
                    Verification Failed
                  </p>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(252,165,165,0.7)', margin: 0, lineHeight: '17px' }}>
                    {errorMsg}
                  </p>
                </div>
              </div>
            )}

            {/* Verified banner */}
            {status === 'verified' && extractedData && (
              <div className="aid-banner aid-banner-success">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div className="aid-banner-icon aid-banner-icon-success">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '12px', color: '#86EFAC', margin: 0 }}>Alumni ID Verified!</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '26px' }}>
                  {extractedData.firstName  && <p className="aid-extracted-row"><span className="aid-extracted-label">First Name: </span>{extractedData.firstName}</p>}
                  {extractedData.middleName && <p className="aid-extracted-row"><span className="aid-extracted-label">Middle Name: </span>{extractedData.middleName}</p>}
                  {extractedData.lastName   && <p className="aid-extracted-row"><span className="aid-extracted-label">Last Name: </span>{extractedData.lastName}</p>}
                  {extractedData.program    && <p className="aid-extracted-row"><span className="aid-extracted-label">Program: </span>{extractedData.program}</p>}
                  {extractedData.batchYear  && <p className="aid-extracted-row"><span className="aid-extracted-label">Batch Year: </span>{extractedData.batchYear}</p>}
                </div>
                <p style={{ fontFamily: 'Arimo', fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '6px 0 0 26px' }}>
                  This info will be pre-filled in your signup form.
                </p>
              </div>
            )}

            {/* ── Terms checkbox ──────────────────────────────────────────────── */}
            <div className="aid-terms-row">
              <input
                type="checkbox"
                id="terms-id"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="aid-checkbox"
              />
              <label htmlFor="terms-id" className="aid-terms-label">
                I agree to the{' '}
                <button type="button" className="aid-legal-btn" onClick={() => setLegalModal('terms')}>
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" className="aid-legal-btn" onClick={() => setLegalModal('privacy')}>
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* ── Next button ─────────────────────────────────────────────────── */}
            <button
              onClick={handleNext}
              disabled={status !== 'verified' || !agreed}
              className={`aid-next-btn${status === 'verified' && agreed ? ' aid-next-btn--active' : ''}`}
            >
              {status === 'scanning' ? 'Verifying…' : 'Next'}
            </button>

            {/* ── Footer link ─────────────────────────────────────────────────── */}
            <p className="aid-footer-text">
              Already have an account?{' '}
              {isModal ? (
                <button onClick={onSwitchToLogin} className="aid-login-link">Log in</button>
              ) : (
                <Link to="/login" className="aid-login-link">Log in</Link>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Legal modals — above everything ───────────────────────────────── */}
      {legalModal === 'terms'   && <TermsModal         onClose={() => setLegalModal(null)} />}
      {legalModal === 'privacy' && <PrivacyPolicyModal  onClose={() => setLegalModal(null)} />}
    </>
  );
};

export default IDRegistrationView;