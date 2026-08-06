import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AboutView from '../Views/AboutView';
import { useNotifications } from '../hooks/useNotifications';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const About = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Use the shared notification hook
  const { unreadCount } = useNotifications();

  const links = [
    { label: 'Terms of Service', action: () => navigate('/terms-about') },
    { label: 'Privacy Policy', action: () => navigate('/privacy-about') },
    { label: 'Contact Support', action: () => navigate('/contact-support') },
  ];

  return (
    <AboutView
      isMobile={isMobile}
      isTablet={isTablet}
      links={links}
      navigate={navigate}
    />
  );
};

export default About;