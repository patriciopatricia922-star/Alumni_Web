import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getResumeRoute } from '../lib/surveyProgress';
import homeIcon     from '../assets/home_icn.svg';
import settingsIcon from '../assets/settings_icn.svg';
import aboutIcon    from '../assets/about_icn.svg';
import surveyIcon   from '../assets/tracer_ic.svg';
import profileIcon  from '../assets/profile_icn.svg';
import sidebarLogo  from '../assets/new_lg.svg';
import SidebarView  from './Sidebarview';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [user,        setUser]        = useState(null);
  const [surveyRoute, setSurveyRoute] = useState('/survey/personal-background');
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

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

    const resolveSurveyRoute = async () => {
      try {
        const { isSurveyComplete } = await import('../lib/surveyProgress');
        const complete = await isSurveyComplete();
        if (complete) {
          setSurveyRoute('/update-tracer');
        } else {
          const route = await getResumeRoute();
          setSurveyRoute(route);
        }
      } catch {
        setSurveyRoute('/survey/personal-background');
      }
    };
    resolveSurveyRoute();
  }, []);

  const email       = user?.email || '';
  const role        = email === 'superadmin@nu-dasma.edu.ph' ? 'Super Admin'
                    : email === 'nudaao@nu-dasma.edu.ph'     ? 'Admin'
                    : 'Alumni';
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Loading...';
  const initials    = user ? user.first_name?.charAt(0).toUpperCase() : 'U';

  const menuItems = [
    { path: '/dashboard', label: 'Home',          icon: homeIcon,    navPath: '/dashboard' },
    { path: '/survey',    label: 'Tracer Survey', icon: surveyIcon,  navPath: surveyRoute  },
    { path: '/profile',   label: 'Profile',       icon: profileIcon, navPath: '/profile'   },
  ];

  const helpItems = [
    { path: '/personal-information', label: 'Settings', icon: settingsIcon },
    { path: '/about',                label: 'About',    icon: aboutIcon    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <SidebarView
      location={location}
      isMobile={isMobile}
      isTablet={isTablet}
      user={user}
      role={role}
      displayName={displayName}
      initials={initials}
      menuItems={menuItems}
      helpItems={helpItems}
      sidebarLogo={sidebarLogo}
      handleLogout={handleLogout}
    />
  );
};

export default Sidebar;