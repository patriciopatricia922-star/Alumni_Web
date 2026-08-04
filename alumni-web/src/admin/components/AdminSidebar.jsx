/**
 * AdminSidebar.jsx
 * Purpose: Renders the sidebar navigation for the admin dashboard, including
 *          user info, menu items, alumni type switcher, and logout functionality.
 *          Handles responsive behavior and permission-based menu filtering.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAlumniType } from '../contexts/AlumniTypeContext';
import AdminSidebarView from './AdminSidebarview';
import { MODULES, canAccessModule } from '../../utils/modulePermissions';

// ─── Module-level user cache ──────────────────────────────────────────────────
// Survives component remounts within the same JS session (i.e. same tab).
// Reset to null on logout (see handleLogout).
// Using a plain object instead of React state so it is never the cause of
// an extra render cycle.
let _cachedUser = null;

// ─── Responsive width hook ────────────────────────────────────────────────────
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
const ALL_ADMIN_MENU_ITEMS = [
  {
    path:  '/admin/admin-dashboard',
    icon:  'dashboard_icn',
    label: 'Dashboard',
    marginTop: '12px',
    // no `module` → always visible
  },
  {
    path:   '/admin/alumni-management',
    icon:   'alumni_icn',
    label:  'Alumni Management',
    marginTop: '8px',
    module: MODULES.ALUMNI,
  },
  {
    path:   '/admin/survey-management',
    icon:   'survey_icn',
    label:  'Survey Management',
    marginTop: '8px',
    module: MODULES.SURVEY,
  },
  {
    path:   '/admin/response-and-analytics',
    icon:   'analytics_icn',
    label:  'Response & Analytics',
    marginTop: '8px',
    module: MODULES.REPORTS,
    iconSize: '15px',
  },
  {
    path:      '/admin/predictive-analytics',
    icon:      'predict_icn',
    label:     'Predictive Analytics',
    marginTop: '8px',
    module:    MODULES.REPORTS,
  },
  {
    path:      '/admin/content-mgmt',
    icon:      'content_icn',
    label:     'Content Management',
    marginTop: '8px',
    module:    MODULES.ENGAGEMENT,
  },
];

/**
 * filterMenuByPermissions(items, user)
 * Returns only the items the user is allowed to see.
 * Items without a `module` key pass through unconditionally.
 *
 * When `user` is null (fetch not yet resolved AND no cache), returns only
 * always-visible items. The caller is responsible for showing a loading
 * skeleton during this window.
 *
 * @param {object[]} items
 * @param {object|null} user  – must include `role` and `module_permissions`
 * @returns {object[]}
 */
function filterMenuByPermissions(items, user) {
  return items.filter(item => {
    if (!item.module) return true;
    return canAccessModule(user, item.module);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-seed from cache so the very first render already has the right items
  // if this component remounts after the initial fetch.
  const [user, setUser]               = useState(_cachedUser);
  const [isLoadingUser, setIsLoading] = useState(_cachedUser === null);

  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Alumni type switcher state — sourced from shared context so other pages
  // (e.g. Alumni Management, Analytics) can react to the selection.
  const { alumniType, setAlumniType } = useAlumniType();

  // Track whether the component is still mounted to avoid setState after
  // unmount — a common source of "missing content" when navigating quickly.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ── User fetch with cache short-circuit ────────────────────────────────────
  useEffect(() => {
    // If we already have a cached user from a previous mount in this session,
    // skip the network round-trip entirely — use the cache synchronously.
    // The permission set cannot change server-side while the user is actively
    // navigating, so the cached value is always safe to use here.
    if (_cachedUser !== null) {
      // State was already seeded in useState initialiser; just clear loading.
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
      } catch {
        // Non-fatal: sidebar degrades gracefully to always-visible items.
        if (mountedRef.current) setIsLoading(false);
      }
    };

    fetchUser();

    // Cleanup: mark the in-flight request as stale if the component unmounts
    // before it resolves (e.g. user navigates away mid-fetch).
    return () => { cancelled = true; };
  }, []); // intentionally empty — fetch once per mount, cache handles the rest

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    // Clear the module-level cache so the next login fetches fresh data.
    _cachedUser = null;
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Display helpers ───────────────────────────────────────────────────────
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    if (user?.first_name) return user.first_name;
    if (user?.email)      return user.email.split('@')[0];
    return 'NUD-AAO';
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name)
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    if (user?.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user?.email)      return user.email.charAt(0).toUpperCase();
    return 'N';
  };

  const getRoleDisplay = () => {
    if (user?.role === 'superadmin') return 'Super Admin';
    if (user?.role === 'admin')      return 'Admin';
    return 'Admin';
  };

  const displayName = getDisplayName();
  const initials    = getInitials();
  const role        = getRoleDisplay();

  // ── Permission-filtered menu ──────────────────────────────────────────────
  // While loading (cold start, no cache): only always-visible items are shown
  // and the view renders a skeleton in their place.
  // Once user resolves: full filtered list, stable across navigations.
  const menuItems = filterMenuByPermissions(ALL_ADMIN_MENU_ITEMS, user);

  return (
    <AdminSidebarView
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

export default AdminSidebar;