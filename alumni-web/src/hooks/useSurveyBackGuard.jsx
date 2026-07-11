/**
 * useSurveyBackGuard.jsx — Centralized Back-Navigation Guard
 * Location: src/hooks/useSurveyBackGuard.jsx
 *
 * A single reusable hook that provides:
 *   1. handleBack()   — call this instead of navigate('/dashboard') in the back button
 *   2. <BackGuardModal /> — drop this once anywhere in the controller's return JSX
 *
 * Usage (controller layer, e.g. PersonalBackground.jsx / PersonalBackgroundSHS.jsx):
 *
 *   import useSurveyBackGuard from '../hooks/useSurveyBackGuard';
 *
 *   const { handleBack, BackGuardModal } = useSurveyBackGuard(navigate, '/dashboard');
 *
 *   // Pass handleBack to the view via props:
 *   <SomeView onBack={handleBack} ... />
 *
 *   // Render the modal once at the bottom of the return:
 *   <BackGuardModal />
 *
 * The hook is destination-agnostic: pass any route as `backRoute` (default '/dashboard').
 * All survey business logic, progress, autofill, and validation are completely untouched.
 *
 * Styling philosophy:
 *   — Matches the existing app palette (#002263, #003EA6, Montserrat/Arimo).
 *   — Modal mirrors the mobile confirmation sheet shown in the product screenshot.
 *   — All styles are self-contained via a <style> tag scoped under a unique
 *     CSS class prefix (`sgm-`) so there is zero risk of leaking into survey form styles.
 *   — Respects prefers-reduced-motion.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* ─── Scoped styles ────────────────────────────────────────────────────────── */
const MODAL_STYLES = `
  /* Overlay */
  .sgm-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: flex-end;          /* sheet slides up from bottom, mobile-first */
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    animation: sgm-fade-in 0.18s ease;
  }

  @keyframes sgm-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Sheet */
  .sgm-sheet {
    width: 100%;
    max-width: 420px;
    background: #FFFFFF;
    border-radius: 24px 24px 0 0;
    padding: 8px 24px 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    animation: sgm-slide-up 0.22s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
  }

  @keyframes sgm-slide-up {
    from { transform: translateY(100%); opacity: 0.6; }
    to   { transform: translateY(0);    opacity: 1;   }
  }

  /* Handle bar */
  .sgm-handle {
    width: 36px;
    height: 4px;
    background: #D1D5DC;
    border-radius: 99px;
    margin: 8px 0 24px;
    flex-shrink: 0;
  }

  /* Floppy-disk icon container */
  .sgm-icon-wrap {
    width: 56px;
    height: 56px;
    background: rgba(0, 62, 166, 0.08);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  /* Heading */
  .sgm-title {
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.3;
    color: #0A0A0A;
    text-align: center;
    margin: 0 0 10px;
  }

  /* Body copy */
  .sgm-body {
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.55;
    color: #4A5565;
    text-align: center;
    margin: 0 0 28px;
    max-width: 300px;
  }

  /* Button group */
  .sgm-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Primary CTA — Save & Exit */
  .sgm-btn-primary {
    width: 100%;
    height: 52px;
    background: #003EA6;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #FFFFFF;
    letter-spacing: 0.2px;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 0 4px 16px rgba(0, 62, 166, 0.28);
  }
  .sgm-btn-primary:hover  { background: #002a80; }
  .sgm-btn-primary:active { transform: scale(0.98); }

  /* Secondary CTA — Exit Without Saving */
  .sgm-btn-secondary {
    width: 100%;
    height: 52px;
    background: transparent;
    border: 1.5px solid rgba(0, 34, 99, 0.25);
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Montserrat', 'Arimo', Arial, sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: #002263;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
  }
  .sgm-btn-secondary:hover  { background: rgba(0, 34, 99, 0.04); border-color: rgba(0, 34, 99, 0.45); }
  .sgm-btn-secondary:active { transform: scale(0.98); }

  /* Tertiary — Cancel (text link) */
  .sgm-btn-cancel {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.4);
    padding: 4px 0;
    margin-top: 2px;
    transition: color 0.15s;
    letter-spacing: 0.1px;
  }
  .sgm-btn-cancel:hover { color: rgba(0, 0, 0, 0.65); }

  /* On desktop: center the sheet rather than pin it to the bottom */
  @media (min-width: 600px) {
    .sgm-overlay {
      align-items: center;
    }
    .sgm-sheet {
      border-radius: 24px;
      padding: 8px 32px 40px;
    }
    @keyframes sgm-slide-up {
      from { transform: translateY(20px) scale(0.97); opacity: 0; }
      to   { transform: translateY(0)    scale(1);    opacity: 1; }
    }
  }

  /* Honour reduced-motion preference */
  @media (prefers-reduced-motion: reduce) {
    .sgm-overlay, .sgm-sheet { animation: none; }
  }
`;

/* ─── Save icon (matches mobile screenshot) ────────────────────────────────── */
const SaveIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"
      stroke="#003EA6"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 21V13H7V21M7 3V8H15"
      stroke="#003EA6"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Modal component (internal, rendered via portal) ──────────────────────── */
const BackGuardModalUI = ({ onSaveAndExit, onExitWithoutSaving, onCancel, sectionName }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <>
      <style>{MODAL_STYLES}</style>
      {/* Clicking the dim overlay = Cancel */}
      <div
        className="sgm-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sgm-title"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <div className="sgm-sheet">
          <div className="sgm-handle" aria-hidden="true" />

          <div className="sgm-icon-wrap">
            <SaveIcon />
          </div>

          <h2 className="sgm-title" id="sgm-title">Save Your Progress?</h2>
          <p className="sgm-body">
            Your answers
            {sectionName ? ` in ${sectionName}` : ''} will be saved
            so you can continue later.
          </p>

          <div className="sgm-actions">
            <button
              className="sgm-btn-primary"
              onClick={onSaveAndExit}
              autoFocus
            >
              Save &amp; Exit
            </button>
            <button
              className="sgm-btn-secondary"
              onClick={onExitWithoutSaving}
            >
              Exit Without Saving
            </button>
            <button
              className="sgm-btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

/* ─── The hook itself ───────────────────────────────────────────────────────── */
/**
 * @param {Function} navigate        — React Router's navigate function
 * @param {string}   backRoute       — Destination when leaving (default: '/dashboard')
 * @param {Function} [onSave]        — Optional async save function to call on "Save & Exit".
 *                                     If omitted, "Save & Exit" behaves identically to
 *                                     "Exit Without Saving" (just navigates away).
 *                                     Pass the controller's existing handleSave function here.
 * @param {string}   [sectionName]   — Human-readable section name shown in the modal body,
 *                                     e.g. "Personal Background". Defaults to generic copy.
 *
 * @returns {{ handleBack: Function, BackGuardModal: React.FC }}
 */
const useSurveyBackGuard = (navigate, backRoute = '/dashboard', onSave = null, sectionName = '') => {
  const [isOpen, setIsOpen] = useState(false);

  /** Replaces the inline `navigate('/dashboard')` call in back button handlers. */
  const handleBack = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleExitWithoutSaving = useCallback(() => {
    setIsOpen(false);
    navigate(backRoute);
  }, [navigate, backRoute]);

  const handleSaveAndExit = useCallback(async () => {
    if (typeof onSave === 'function') {
      try {
        await onSave();
      } catch (err) {
        // Save errors are non-blocking — we still navigate away so the user
        // is never trapped on the page. The calling component's own error
        // handling (console.error) already covers the logging side.
        console.error('[useSurveyBackGuard] Save before exit failed:', err);
      }
    }
    setIsOpen(false);
    navigate(backRoute);
  }, [onSave, navigate, backRoute]);

  /**
   * Drop <BackGuardModal /> once anywhere inside the controller's JSX.
   * It renders nothing when the modal is closed.
   */
  const BackGuardModal = useCallback(() => {
    if (!isOpen) return null;
    return (
      <BackGuardModalUI
        sectionName={sectionName}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
        onCancel={handleCancel}
      />
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sectionName, handleSaveAndExit, handleExitWithoutSaving, handleCancel]);

  return { handleBack, BackGuardModal };
};

export default useSurveyBackGuard;