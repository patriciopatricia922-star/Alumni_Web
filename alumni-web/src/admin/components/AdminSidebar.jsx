import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminSidebarView from './AdminSidebarview';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', authUser.id)
        .single();
      if (data) setUser(data);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName = 'NUD-AAO';
  const initials = 'N';
  const role = 'Admin';

  const menuItems = [
    { path: '/admin/admin-dashboard', icon: 'TbLayoutDashboardFilled', label: 'Dashboard' },
    { path: '/admin/alumni-management', icon: 'BsFillPeopleFill', label: 'Alumni Management' },
    { path: '/admin/survey-management', icon: 'RiSurveyFill', label: 'Survey Management' },
    { path: '/admin/response-and-analytics', icon: 'SiGoogleanalytics', label: 'Response & Analytics' },
    { path: '/admin/predictive-analytics', icon: 'RiOrganizationChart', label: 'Predictive Analytics', marginTop: '16px' },
    { path: '/admin/content-mgmt', icon: 'FaBookBookmark', label: 'Content Engagement', marginTop: '16px' },
  ];

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
      handleLogout={handleLogout}
    />
  );
};

export default AdminSidebar;