import { createContext, useContext, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const AlumniTypeContext = createContext(undefined);

// Routes that only exist for College alumni — SHS has no equivalent page,
// so switching away from College is blocked while sitting on one of these.
const COLLEGE_ONLY_PATHS = ['/superadmin/predictive-analytics'];

// ============================================================================
// AlumniTypeModal — in-app replacement for window.alert() / window.confirm()
// ============================================================================
// Two modes:
//  - 'blocked'  → info-only dialog with a single "Got it" button
//                 (replaces window.alert)
//  - 'confirm'  → two-button dialog, "Cancel" / "Continue"
//                 (replaces window.confirm)
const AlumniTypeModal = ({ mode, message, onConfirm, onCancel }) => {
  if (!mode) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        // Click-outside dismisses the same way Cancel would (or Got it, for
        // the info-only variant) — mirrors native dialog dismiss behavior.
        if (e.target === e.currentTarget) onCancel();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 16,
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-live="assertive"
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.25)',
          padding: '24px 24px 20px',
          fontFamily: "'Lexend', sans-serif",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: '#1E293B',
          }}
        >
          {mode === 'blocked' ? 'Predictive Analytics' : 'Unsaved changes'}
        </h3>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 13.5,
            lineHeight: 1.5,
            color: '#475569',
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 22,
          }}
        >
          {mode === 'confirm' && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '9px 18px',
                borderRadius: 999,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: 13.5,
                fontWeight: 600,
                fontFamily: "'Lexend', sans-serif",
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '9px 20px',
              borderRadius: 999,
              border: 'none',
              background: '#155DFC',
              color: '#FFFFFF',
              fontSize: 13.5,
              fontWeight: 600,
              fontFamily: "'Lexend', sans-serif",
              cursor: 'pointer',
            }}
          >
            {mode === 'blocked' ? 'Got it' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AlumniTypeProvider = ({ children, initialType = 'college' }) => {
  const [alumniType, setAlumniTypeRaw] = useState(initialType);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const location = useLocation();

  // Drives the modal in place of window.alert / window.confirm.
  //   { mode: 'blocked' }                    → info-only dialog
  //   { mode: 'confirm', nextType: 'shs' }    → confirm-discard dialog,
  //                                              remembers the switch that's
  //                                              waiting on the user's answer
  const [pendingModal, setPendingModal] = useState(null);

  const isCollegeOnlyRoute = COLLEGE_ONLY_PATHS.some(p =>
    location.pathname.startsWith(p)
  );

  const setAlumniType = useCallback((nextType) => {
    if (nextType === alumniType) return;

    // Predictive Analytics has no SHS view — don't allow switching to SHS
    // while sitting on it.
    if (nextType === 'shs' && isCollegeOnlyRoute) {
      setPendingModal({ mode: 'blocked' });
      return;
    }

    // Content Mgmt / Survey Mgmt forms, or an in-progress export in
    // Response & Analytics, can set this flag — warn before discarding it.
    if (hasUnsavedChanges) {
      setPendingModal({ mode: 'confirm', nextType });
      return;
    }

    setAlumniTypeRaw(nextType);
  }, [alumniType, isCollegeOnlyRoute, hasUnsavedChanges]);

  const handleModalConfirm = useCallback(() => {
    if (pendingModal?.mode === 'confirm') {
      setHasUnsavedChanges(false);
      setAlumniTypeRaw(pendingModal.nextType);
    }
    setPendingModal(null);
  }, [pendingModal]);

  const handleModalCancel = useCallback(() => {
    setPendingModal(null);
  }, []);

  return (
    <AlumniTypeContext.Provider
      value={{
        alumniType,
        setAlumniType,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        isCollegeOnlyRoute,
      }}
    >
      <Outlet />
      {children}

      <AlumniTypeModal
        mode={pendingModal?.mode}
        message={
          pendingModal?.mode === 'blocked'
            ? 'Predictive Analytics is only available for College alumni. Leave this page before switching to SHS.'
            : 'You have unsaved changes. Switching alumni type will discard them. Continue?'
        }
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </AlumniTypeContext.Provider>
  );
};

export const useAlumniType = () => {
  const ctx = useContext(AlumniTypeContext);
  if (ctx === undefined) {
    throw new Error(
      'useAlumniType must be used inside <AlumniTypeProvider>. ' +
      'Check that the admin routes in App.jsx are wrapped with ' +
      '<Route element={<AlumniTypeProvider />}>.'
    );
  }
  return ctx;
};

export default AlumniTypeContext;