/**
 * SuperAdminSidebar.jsx
 *
 * Changes from original:
 *  - menuItems now carry a `module` annotation for documentation/consistency
 *    with the admin sidebar. The annotation is informational only — superadmins
 *    are NEVER filtered (canAccessModule returns true for role === 'superadmin').
 *  - No filtering logic is applied; all items always render.
 *  - All original logic is preserved character-for-character.
 *
 * Why no filtering here?
 *  SuperAdmin has unrestricted access by design (canAccessModule short-circuits
 *  on role === 'superadmin'). Adding a filter call would be harmless but
 *  unnecessary, and keeping this file simple makes that invariant obvious.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAlumniType } from './contexts/AlumniTypeContext';
import SuperAdminSidebarView from './Views/SuperAdSidebarview';
import { MODULES } from '../utils/modulePermissions'; // ← imported for annotation only

// ─── Responsive width hook (unchanged) ───────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

// ─── Component ────────────────────────────────────────────────────────────────
const SuperAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [isLoadingUser, setIsLoading] = useState(true);
  const width                         = useWindowWidth();
  const isMobile                      = width < 768;
  const isTablet                      = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen]   = useState(false);

  // Alumni type switcher — shared context, migrated into superadmin folder
  const { alumniType, setAlumniType } = useAlumniType();

  // Unmount-safety guard (mirrors Admin sidebar's mountedRef pattern)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Close mobile menu on navigation (unchanged)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Fetch user (unchanged — superadmin sidebar never needs module_permissions)
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser || !isMounted) return;

        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', authUser.id)
          .single();

        if (data && isMounted && mountedRef.current) setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        if (isMounted && mountedRef.current) setIsLoading(false);
      }
    };

    fetchUser();
    return () => { isMounted = false; };
  }, []);

  // Logout (unchanged)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Display values (unchanged)
  const displayName = 'Super Admin';
  const initials    = 'S';
  const role        = 'Super Admin';

  // ── Menu items (unchanged paths/icons/labels; module annotations added) ──
  // `module` keys here are documentation-only — no filtering is performed.
  const menuItems = [
    {
      path:  '/superadmin/super-admin-dashboard',
      icon:  'TbLayoutDashboardFilled',
      label: 'Dashboard',
      // no module — always visible for all roles
    },
    {
      path:   '/superadmin/audit-logs',
      icon:   'SiGoogleanalytics',
      label:  'Audit Logs',
      module: MODULES.AUDIT,          // annotation only
    },
    {
      path:   '/superadmin/admin-management',
      icon:   'BsFillPeopleFill',
      label:  'Admin Management',
      split:  true,
      // superadmin-exclusive — no equivalent module gate for regular admins
    },
    {
      path:   '/superadmin/super-admin-alumni',
      icon:   'RiSurveyFill',
      label:  'Alumni Management',
      split:  true,
      module: MODULES.ALUMNI,         // annotation only
    },
    {
      path:   '/superadmin/super-alumni-engagement',
      icon:   'FaBookBookmark',
      label:  'Content Management',
      split:  true,
      module: MODULES.ENGAGEMENT,     // annotation only
    },
    {
      path:   '/superadmin/survey-management',
      icon:   'RiSurveyFill',
      label:  'Survey Management',
      module: MODULES.SURVEY,         // annotation only
    },
    {
      path:   '/superadmin/response-and-analytics',
      icon:   'SiGoogleanalytics',
      label:  'Response & Analytics',
      module: MODULES.REPORTS,        // annotation only
    },
    {
      path:      '/superadmin/predictive-analytics',
      icon:      'RiOrganizationChart',
      label:     'Predictive Analytics',
      marginTop: '16px',
      module:    MODULES.REPORTS,     // annotation only
    },
  ];

  // SuperAdmin always receives the full menu — no filtering applied.
  return (
    <SuperAdminSidebarView
      location={location}
      isMobile={isMobile}
      isTablet={isTablet}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      user={user}
      role={role}
      displayName={displayName}
      initials={initials}
      menuItems={menuItems}
      isLoadingUser={isLoadingUser}
      handleLogout={handleLogout}
      alumniType={alumniType}
      setAlumniType={setAlumniType}
    />
  );
};

export default SuperAdminSidebar;