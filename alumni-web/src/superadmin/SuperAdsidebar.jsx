/**
 * SuperAdminSidebar.jsx
 *
 * Synchronized with AdminSidebar.jsx (source of truth for logic/behavior).
 * Ported over from Admin:
 *  - Module-level user cache (_cachedUser) to avoid refetch on remount.
 *  - Full user fetch (role, module_permissions) instead of partial fields.
 *  - Dynamic display helpers (getDisplayName / getInitials / getRoleDisplay)
 *    instead of hardcoded 'Super Admin' / 'S' values.
 *  - College vs SHS department filtering: Predictive Analytics is hidden for
 *    SHS users, matching Admin's collegeOnly behavior exactly.
 *  - isCollegeOnlyRoute passed through to the view, matching Admin.
 *  - Cache is cleared on logout, matching Admin.
 *
 * Preserved (intentionally NOT changed, per Super Admin architecture):
 *  - All existing Super Admin routes, class names, folder structure.
 *  - menuItems list, icons, labels, and `split` flags are unchanged.
 *  - `module` annotations remain informational only — canAccessModule
 *    short-circuits to true for role === 'superadmin', so NO module-based
 *    filtering is applied. This is the one intentional, permission-based
 *    difference from Admin: superadmins are never gated by module_permissions.
 *  - Only the `collegeOnly` (department) rule is applied here, since that
 *    distinction is about data scope/department, not permission level, and
 *    must behave identically to Admin per the sync requirements.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAlumniType } from './contexts/AlumniTypeContext';
import SuperAdminSidebarView from './Views/SuperAdSidebarview';
import { MODULES } from '../utils/modulePermissions'; // ← imported for annotation only

// ─── Module-level user cache ──────────────────────────────────────────────────
// Survives component remounts within the same JS session (i.e. same tab).
// Reset to null on logout (see handleLogout).
let _cachedUser = null;

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

// ─── Menu item definitions ────────────────────────────────────────────────────
// Paths/icons/labels/split flags unchanged from original Super Admin sidebar.
// `collegeOnly` added to Predictive Analytics to match Admin's department
// behavior — SHS users should not see this item, identically to Admin.
const ALL_SUPERADMIN_MENU_ITEMS = [
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
    collegeOnly: true,               // ← ported from Admin: hidden for SHS
  },
];

/**
 * filterMenuByDepartment(items, alumniType)
 * Super Admin equivalent of Admin's filterMenuByPermissions, but restricted
 * to the department (College vs SHS) rule only. Module-based gating is
 * intentionally NOT applied here — superadmins always have full module
 * access, per canAccessModule's role === 'superadmin' short-circuit.
 *
 * @param {object[]} items
 * @param {string} alumniType – 'college' | 'shs'
 * @returns {object[]}
 */
function filterMenuByDepartment(items, alumniType) {
  return items.filter(item => {
    if (item.collegeOnly && alumniType === 'shs') return false;
    return true;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
const SuperAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-seed from cache so the very first render already has the right
  // display info if this component remounts after the initial fetch.
  const [user, setUser]               = useState(_cachedUser);
  const [isLoadingUser, setIsLoading] = useState(_cachedUser === null);

  const width                         = useWindowWidth();
  const isMobile                      = width < 768;
  const isTablet                      = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen]   = useState(false);

  // Alumni type switcher — shared context, migrated into superadmin folder
  const { alumniType, setAlumniType, isCollegeOnlyRoute } = useAlumniType();

  // Unmount-safety guard (mirrors Admin sidebar's mountedRef pattern)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Close mobile menu on navigation (unchanged)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ── User fetch with cache short-circuit (ported from Admin) ──────────────
  useEffect(() => {
    if (_cachedUser !== null) {
      // State already seeded in useState initialiser; just clear loading.
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser || cancelled) return;

        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, email, role, module_permissions')
          .eq('id', authUser.id)
          .single();

        if (error || !data || cancelled) return;

        // Populate the module-level cache before setting state so that any
        // sibling remount that fires between now and the next tick also gets
        // the cached value immediately.
        _cachedUser = data;

        if (mountedRef.current) {
          setUser(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        if (mountedRef.current) setIsLoading(false);
      }
    };

    fetchUser();

    return () => { cancelled = true; };
  }, []); // intentionally empty — fetch once per mount, cache handles the rest

  // ── Logout (cache clear ported from Admin) ────────────────────────────────
  const handleLogout = async () => {
    try {
      _cachedUser = null;
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ── Display helpers (ported from Admin; role display kept Super Admin) ───
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    if (user?.first_name) return user.first_name;
    if (user?.email)      return user.email.split('@')[0];
    return 'Super Admin';
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name)
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email)      return user.email.charAt(0).toUpperCase();
    return 'S';
  };

  // Role label stays fixed for this sidebar — Super Admin route is exclusive
  // to the superadmin role, so there's no need to branch on user?.role here.
  const getRoleDisplay = () => 'Super Admin';

  const displayName = getDisplayName();
  const initials    = getInitials();
  const role        = getRoleDisplay();

  // ── Department-filtered menu (ported concept from Admin) ─────────────────
  // Module-based gating intentionally omitted — superadmin always sees every
  // module-gated item. Only the College/SHS department rule is applied, so
  // Super Admin's department behavior matches Admin's exactly.
  const menuItems = filterMenuByDepartment(ALL_SUPERADMIN_MENU_ITEMS, alumniType);

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
      isCollegeOnlyRoute={isCollegeOnlyRoute}
    />
  );
};

export default SuperAdminSidebar;