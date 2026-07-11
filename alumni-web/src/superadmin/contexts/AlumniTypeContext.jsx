/**
 * AlumniTypeContext.jsx
 *
 * Provides shared alumniType state ('college' | 'shs') across the admin section.
 *
 * AlumniTypeProvider is designed to work in two scenarios:
 *
 *   1. As a React Router v6 pathless Route wrapper (how App.jsx uses it):
 *        <Route element={<AlumniTypeProvider />}>
 *          <Route path="/admin/..." element={<AdminDashboard />} />
 *        </Route>
 *      In this case React Router injects the matched child via <Outlet />.
 *      The {children} prop will be undefined — Outlet handles rendering.
 *
 *   2. As a normal JSX wrapper (e.g. in tests or a layout component):
 *        <AlumniTypeProvider>
 *          <AdminDashboard />
 *        </AlumniTypeProvider>
 *      In this case {children} is used and Outlet renders nothing (no Router
 *      context means no matched child to inject — that's fine).
 *
 * Rendering BOTH {children} and <Outlet /> covers both cases safely.
 */

import { createContext, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';

const AlumniTypeContext = createContext(undefined);

export const AlumniTypeProvider = ({ children, initialType = 'college' }) => {
  const [alumniType, setAlumniType] = useState(initialType);

  return (
    <AlumniTypeContext.Provider value={{ alumniType, setAlumniType }}>
      {/* Outlet: renders the matched child route when used as a pathless
          React Router wrapper — required for App.jsx's Route grouping pattern */}
      <Outlet />
      {/* children: renders nested JSX when used as a normal wrapper component */}
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