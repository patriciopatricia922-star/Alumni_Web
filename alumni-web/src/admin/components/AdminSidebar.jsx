/**
 * AdminSidebar.jsx
 *
 * Changes from original:
 *  - Fetches `module_permissions` alongside existing user fields (one extra
 *    column in the same query — no new request).
 *  - Filters `menuItems` through `filterMenuByPermissions()` before passing
 *    them to the view. The view is untouched.
 *  - Dashboard is always visible (no module gate needed).
 *  - All original logic (displayName, initials, role display, logout,
 *    responsive width, mobile state) is preserved character-for-character.
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminSidebarView from './AdminSidebarview';
import { MODULES, canAccessModule } from '../../utils/modulePermissions'; // ← NEW

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

// ─── Module key mapping ───────────────────────────────────────────────────────
// Each menu item that should be gated carries a `module` key.
// Items WITHOUT a `module` key (e.g. Dashboard) are always rendered.
const ALL_ADMIN_MENU_ITEMS = [
  {
    path:  '/admin/admin-dashboard',
    icon:  'TbLayoutDashboardFilled',
    label: 'Dashboard',
    // no `module` → always visible
  },
  {
    path:   '/admin/alumni-management',
    icon:   'BsFillPeopleFill',
    label:  'Alumni Management',
    module: MODULES.ALUMNI,
  },
  {
    path:   '/admin/survey-management',
    icon:   'RiSurveyFill',
    label:  'Survey Management',
    module: MODULES.SURVEY,
  },
  {
    path:      '/admin/response-and-analytics',
    icon:      'SiGoogleanalytics',
    label:     'Response & Analytics',
    module:    MODULES.REPORTS,
  },
  {
    path:      '/admin/predictive-analytics',
    icon:      'RiOrganizationChart',
    label:     'Predictive Analytics',
    marginTop: '16px',
    module:    MODULES.REPORTS,
  },
  {
    path:      '/admin/content-mgmt',
    icon:      'FaBookBookmark',
    label:     'Content Management',
    marginTop: '16px',
    module:    MODULES.ENGAGEMENT,
  },
];

/**
 * filterMenuByPermissions(items, user)
 * Returns only the items the user is allowed to see.
 * Items without a `module` key pass through unconditionally.
 *
 * @param {object[]} items
 * @param {object|null} user  – must include `role` and `module_permissions`
 * @returns {object[]}
 */
function filterMenuByPermissions(items, user) {
  return items.filter(item => {
    if (!item.module) return true;               // always-visible item
    return canAccessModule(user, item.module);   // permission check
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const width                     = useWindowWidth();
  const isMobile                  = width < 768;
  const isTablet                  = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on navigation (unchanged)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Fetch user — now also selects module_permissions (one extra column)
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('users')
        // ↓ Added `module_permissions` — everything else unchanged
        .select('first_name, last_name, email, role, module_permissions')
        .eq('id', authUser.id)
        .single();

      if (data) setUser(data);
    };
    fetchUser();
  }, []);

  // Logout (unchanged)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Display helpers (unchanged)
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

  // ── Permission-filtered menu ─────────────────────────────────────────────
  // `user` is null on first render → filterMenuByPermissions returns only
  // always-visible items (Dashboard) until the fetch resolves. This avoids
  // a flash of all items before permissions load.
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
      menuItems={menuItems}       // ← filtered list; view is unchanged
      handleLogout={handleLogout}
    />
  );
};

export default AdminSidebar;