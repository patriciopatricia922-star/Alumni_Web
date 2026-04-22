import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from '../lib/surveyProgress';
import homeIcon    from '../assets/home_icn.svg';
import aboutIcon   from '../assets/about_icn.svg';
import surveyIcon  from '../assets/tracer_ic.svg';
import profileIcon from '../assets/profile_icn.svg';
import sidebarLogo from '../assets/alumnai_logo_new.svg';
import SidebarView from './Sidebarview';

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

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user,        setUser]        = useState(null);
  const [surveyRoute, setSurveyRoute] = useState(null); // null = still resolving
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // ── 1. Auth user ──────────────────────────────────────────────────────
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || cancelled) return;

      // ── 2. Profile data ───────────────────────────────────────────────────
      const { data: profile } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', authUser.id)
        .single();

      if (!cancelled && profile) setUser(profile);

      // ── 3. Survey route ───────────────────────────────────────────────────
      // Load sections first (populates cache), then resolve route.
      // Both calls are awaited sequentially — no race condition.
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();

        if (cancelled) return;

        if (complete) {
          setSurveyRoute('/update-tracer');
        } else {
          const route = await getResumeRoute();
          if (!cancelled) setSurveyRoute(route);
        }
      } catch (err) {
        console.error('Sidebar: error resolving survey route:', err);
        if (!cancelled) setSurveyRoute('/survey/personal-background');
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // ── Derived display values ────────────────────────────────────────────────
  const email       = user?.email ?? '';
  const role        = email === 'superadmin@nu-dasma.edu.ph' ? 'Super Admin'
                    : email === 'nudaao@nu-dasma.edu.ph'     ? 'Admin'
                    : 'Alumni';
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Loading...';
  const initials    = user?.first_name?.charAt(0).toUpperCase() ?? 'U';

  // surveyRoute stays null while resolving — SidebarView should render
  // the survey link as disabled/skeleton during this time.
  const menuItems = [
    { path: '/dashboard', label: 'Home',          icon: homeIcon,    navPath: '/dashboard'                    },
    { path: '/survey',    label: 'Tracer Survey', icon: surveyIcon,  navPath: surveyRoute, loading: !surveyRoute },
    { path: '/profile',   label: 'Profile',       icon: profileIcon, navPath: '/profile'                      },
  ];

  const helpItems = [
    { path: '/about', label: 'About', icon: aboutIcon },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); 
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