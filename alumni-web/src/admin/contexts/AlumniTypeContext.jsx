import { createContext, useContext, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const AlumniTypeContext = createContext(undefined);

// Routes that only exist for College alumni — SHS has no equivalent page,
// so switching away from College is blocked while sitting on one of these.
const COLLEGE_ONLY_PATHS = ['/admin/predictive-analytics'];

export const AlumniTypeProvider = ({ children, initialType = 'college' }) => {
  const [alumniType, setAlumniTypeRaw] = useState(initialType);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const location = useLocation();

  const isCollegeOnlyRoute = COLLEGE_ONLY_PATHS.some(p =>
    location.pathname.startsWith(p)
  );

  const setAlumniType = useCallback((nextType) => {
    if (nextType === alumniType) return;

    // Predictive Analytics has no SHS view — don't allow switching to SHS
    // while sitting on it.
    if (nextType === 'shs' && isCollegeOnlyRoute) {
      window.alert(
        'Predictive Analytics is only available for College alumni. ' +
        'Leave this page before switching to SHS.'
      );
      return;
    }

    // Content Mgmt / Survey Mgmt forms, or an in-progress export in
    // Response & Analytics, can set this flag — warn before discarding it.
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Switching alumni type will discard them. Continue?'
      );
      if (!confirmed) return;
      setHasUnsavedChanges(false);
    }

    setAlumniTypeRaw(nextType);
  }, [alumniType, isCollegeOnlyRoute, hasUnsavedChanges]);

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