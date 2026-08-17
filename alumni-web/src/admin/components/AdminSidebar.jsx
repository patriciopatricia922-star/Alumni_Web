import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAlumniType } from '../contexts/AlumniTypeContext';
import AdminSidebarView from './AdminSidebarview';
import { MODULES, canAccessModule } from '../../utils/Modulepermissions';

// ─── Module-level user cache ──────────────────────────────────────────────────
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
 *
 * @param {object[]} items
 * @param {object|null} user
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
  const [user, setUser]               = useState(_cachedUser);
  const [isLoadingUser, setIsLoading] = useState(_cachedUser === null);

  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Alumni type switcher state
  const { alumniType, setAlumniType } = useAlumniType();

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // ── User fetch with cache short-circuit ────────────────────────────────────
  useEffect(() => {
    if (_cachedUser !== null) {
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

        _cachedUser = data;

        if (mountedRef.current) {
          setUser(data);
          setIsLoading(false);
        }
      } catch {
        if (mountedRef.current) setIsLoading(false);
      }
    };

    fetchUser();
    return () => { cancelled = true; };
  }, []); 

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    _cachedUser = null;
    await supabase.auth.signOut();
    navigate('/');
  };

  // ── Display helpers ───────────────────────────────────────────────────────
  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    if (user?.first_name) return user.first_name;
    if (user?.email === 'nudaao@nu-dasma.edu.ph') return 'NU-D AAO';
    if (user?.email)      return user.email.split('@')[0];
    return 'NU-D AAO';
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