import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import homeIcon from '../assets/home_icn.svg';
import announceIcon from '../assets/announce_icn.svg';
import profileIcon from '../assets/profile_icn.svg';
import logoutIcon from '../assets/logout_icn.svg';
import { supabase } from '../lib/supabase';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  // Determine role from email
  const email = user?.email || '';
  const role = email === 'superadmin@nu-dasma.edu.ph'
    ? 'Super Admin'
    : email === 'nudaao@nu-dasma.edu.ph'
    ? 'Admin'
    : 'Alumni';

  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Loading...';
  const initials = user ? user.first_name?.charAt(0).toUpperCase() : 'U';

  const menuItems = [
    { path: '/dashboard', label: 'Home', icon: homeIcon },
    { path: '/announcements', label: 'Announcements', icon: announceIcon },
    { path: '/profile', label: 'Profile', icon: profileIcon },
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '229px',
        height: '100vh',
        background: '#001947',
        boxShadow: '0px 10px 50px rgba(0, 0, 0, 0.25)',
        borderRadius: '0px 20px 20px 0px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Logo Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '8px' }}>
        <div style={{ width: '40px', height: '40px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 12.5L7.5 18.75L20 25L32.5 18.75L20 12.5Z" stroke="#D9CA81" strokeWidth="2.67" strokeLinejoin="round"/>
            <path d="M32.5 18.75V26.25" stroke="#D9CA81" strokeWidth="2.67" strokeLinecap="round"/>
            <path d="M13.75 21.875V27.5L20 30.625L26.25 27.5V21.875" stroke="#D9CA81" strokeWidth="2.67" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ display: 'flex' }}>
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: '22px', fontWeight: 700, lineHeight: '32px', color: '#FFFFFF' }}>Alumn</span>
          <span style={{ fontFamily: 'Arimo, Arial', fontSize: '22px', fontWeight: 700, lineHeight: '32px', color: '#D9CA81' }}>AI</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.1)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.35)' }} />

      {/* Menu */}
      <div style={{ padding: '20px 9px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{
          fontFamily: 'Montserrat', fontWeight: 600, fontSize: '10px',
          lineHeight: '15px', letterSpacing: '0.5px', textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.4)', padding: '0 16px', margin: '0 0 6px 0',
        }}>MENU</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 13px',
                  background: isActive ? 'rgba(217, 202, 129, 0.12)' : 'transparent',
                  borderRadius: '14px', textDecoration: 'none',
                  transition: 'background 0.2s', margin: '0 6px',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <img src={item.icon} alt={item.label} style={{
                  width: '20px', height: '20px',
                  filter: isActive
                    ? 'brightness(0) saturate(100%) invert(77%) sepia(37%) saturate(466%) hue-rotate(6deg) brightness(95%) contrast(89%)'
                    : 'brightness(0) invert(1) opacity(0.85)',
                }} />
                <span style={{
                  fontFamily: 'Montserrat', fontSize: '15px',
                  fontWeight: isActive ? 700 : 400, lineHeight: '24px',
                  letterSpacing: '0.325px', color: isActive ? '#D9CA81' : '#FFFFFF',
                }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile Bottom */}
      <div style={{ marginTop: 'auto', padding: '0 8px 24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 12px',
          gap: '12px', height: '56px',
          background: 'rgba(255, 255, 255, 0.1)', borderRadius: '30px',
        }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'Arial', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{initials}</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontFamily: 'Arial', fontSize: '13px', lineHeight: '20px', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
            <span style={{ fontFamily: 'Arial', fontSize: '11px', lineHeight: '16px', color: '#D1D5DC' }}>{role}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '28px', height: '28px', background: 'none', border: 'none',
              borderRadius: '4px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0,
            }}
          >
            <img src={logoutIcon} alt="Logout" style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;