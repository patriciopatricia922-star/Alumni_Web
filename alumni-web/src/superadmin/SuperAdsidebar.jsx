import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SuperAdminSidebarView from './Views/SuperAdSidebarview';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const SuperAdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [mobileOpen, setMobileOpen] = useState(false);

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
      navigate('/'); 
    
  };

  const displayName = 'Super Admin';
  const initials    = 'S';
  const role        = 'Super Admin';

  const menuItems = [
    { path: '/superadmin/super-admin-dashboard', icon: 'TbLayoutDashboardFilled', label: 'Audit Overview'     },
    { path: '/superadmin/audit-logs',            icon: 'SiGoogleanalytics',       label: 'Audit Logs'         },
    { path: '/superadmin/admin-management',      icon: 'BsFillPeopleFill',        label: 'Admin Management',   split: true },
    { path: '/superadmin/super-admin-alumni',    icon: 'RiSurveyFill',            label: 'Alumni Management',  split: true },
    { path: '/superadmin/super-alumni-engagement', icon: 'FaBookBookmark',        label: 'Content Management', split: true },
    { path: '/superadmin/survey-management',      icon: 'RiSurveyFill',            label: 'Survey Management' },
    { path: '/superadmin/response-and-analytics', icon: 'SiGoogleanalytics',       label: 'Response & Analytics' },
    { path: '/superadmin/predictive-analytics',   icon: 'RiOrganizationChart',     label: 'Predictive Analytics', marginTop: '16px' },
  ];

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
      handleLogout={handleLogout}
    />
  );
};

export default SuperAdminSidebar;