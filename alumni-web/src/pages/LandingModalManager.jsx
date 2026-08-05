// LandingModalManager.jsx
import React, { useEffect } from 'react';
import ModalIDRegistration from './ModalIDRegistration';
import ModalSignup         from './ModalSignup';
import ModalLogin          from './ModalLogin';
import ModalForgotPassword from './Modalforgotpassword';
import ModalVerification   from './ModalVerification';
import ModalResetPassword  from './ModalResetPassword';

const LandingModalManager = ({
  modal,
  idExtracted,
  onClose,
  onIDVerified,
  onSignupSuccess,
  onLoginSuccess,
  onSwitchToLogin,
  onSwitchToRegister,
  forgotPasswordEmail,
  onSwitchToForgotPassword,
  onSwitchToVerification,
  onSwitchToResetPassword,
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
        position:             'fixed',
        inset:                0,
        zIndex:               2000,
        background:           'rgba(0, 0, 0, 0.72)',
        backdropFilter:       'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'center',
        padding:              '16px',
        boxSizing:            'border-box',
        animation:            'lmm-fade-in 0.18s ease',
      }}
    >
      {/* Stop click-through on the card itself */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>

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
            onSwitchToForgotPassword={onSwitchToForgotPassword}
            onClose={onClose}
          />
        )}

        {modal === 'forgot-password' && (
          <ModalForgotPassword
            onSwitchToLogin={onSwitchToLogin}
            onClose={onClose}
            // ModalForgotPassword renders ModalVerification as an internal
            // sub-view (view state: 'forgotPassword' → 'verification').
            // onResetPassword is threaded through so that internal
            // ModalVerification can fire onSwitchToResetPassword on the
            // outer LandingPage state after a successful OTP verification.
            onResetPassword={onSwitchToResetPassword}
          />
        )}

        {/* Fallback: if anything sets modal = 'verification' directly */}
        {modal === 'verification' && (
          <ModalVerification
            email={forgotPasswordEmail}
            onBack={onSwitchToForgotPassword}
            onClose={onClose}
            onResetPassword={onSwitchToResetPassword}
          />
        )}

        {modal === 'reset-password' && (
          <ModalResetPassword
            onBack={onSwitchToLogin}
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