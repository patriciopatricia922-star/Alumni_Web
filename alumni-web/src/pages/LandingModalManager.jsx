import React, { useCallback, useEffect } from 'react';
import ModalIDRegistration from './ModalIDRegistration';
import ModalSignup         from './ModalSignup';
import ModalLogin          from './ModalLogin';

const LandingModalManager = ({
  modal,
  idExtracted,
  onClose,
  onIDVerified,
  onSignupSuccess,
  onLoginSuccess,
  onSwitchToLogin,
  onSwitchToRegister,
}) => {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         2000,
        background:     'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '16px',
        boxSizing:      'border-box',
        animation:      'lmm-fade-in 0.18s ease',
      }}
    >
      {/* Stop click-through on the card itself */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>

        {/* ── Close button (top-right of overlay, always visible) ── */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   'absolute',
            top:        '-14px',
            right:      '-14px',
            zIndex:     10,
            width:      '32px',
            height:     '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            border:     '1px solid rgba(255,255,255,0.2)',
            color:      '#FFFFFF',
            fontSize:   '16px',
            lineHeight: '1',
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
        >
          ×
        </button>

        {modal === 'register' && (
          <ModalIDRegistration
            onVerified={onIDVerified}
            onSwitchToLogin={onSwitchToLogin}
            onClose={onClose}
          />
        )}

        {modal === 'signup' && (
          <ModalSignup
            idExtracted={idExtracted}
            onSuccess={onSignupSuccess}
            onSwitchToLogin={onSwitchToLogin}
            onClose={onClose}
          />
        )}

        {modal === 'login' && (
          <ModalLogin
            onSuccess={onLoginSuccess}
            onSwitchToRegister={onSwitchToRegister}
            onClose={onClose}
          />
        )}
      </div>

      <style>{`
        @keyframes lmm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingModalManager;