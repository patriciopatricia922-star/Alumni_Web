import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { FaBookBookmark } from 'react-icons/fa6';
import { RiSurveyFill, RiOrganizationChart } from 'react-icons/ri';
import { SiGoogleanalytics } from 'react-icons/si';
import { BsFillPeopleFill } from 'react-icons/bs';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import sidebarLogo from '../assets/sidebar_alumnAI.svg';

const menuItems = [
  { path: '/admin/admin-dashboard',              icon: TbLayoutDashboardFilled, label: 'Dashboard'            },
  { path: '/admin/alumni-management',            icon: BsFillPeopleFill,        label: 'Alumni Management'    },
  { path: '/admin/survey-management',            icon: RiSurveyFill,            label: 'Survey Management'    },
  { path: '/admin/response-and-analytics',       icon: SiGoogleanalytics,       label: 'Response & Analytics' },
  { path: '/admin/predictive-analytics',         icon: RiOrganizationChart,     label: 'Predictive Analytics', marginTop: '16px' },
  { path: '/admin/engagement-alumni',            icon: FaBookBookmark,          label: 'Alumni Engagement',    marginTop: '16px' },
];

function AdminSidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [user,       setUser]       = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 900);
      if (window.innerWidth >= 900) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
  const initials    = 'N';

  const sidebarContent = (
    <aside style={{
      position: 'fixed', left: 0, top: 0,
      width: '229px', height: '100vh',
      background: '#001947',
      boxShadow: '0px 10px 50px rgba(0,0,0,0.25)',
      borderRadius: '0px 20px 20px 0px',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 0.25s ease',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '8px' }}>
        <img
          src={sidebarLogo}
          alt="AlumnAI"
          style={{ width: '100px', height: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', boxShadow: '0px 4px 4px rgba(0,0,0,0.35)' }} />

      {/* Menu */}
      <div style={{ padding: '20px 9px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map(({ path, icon: Icon, label, marginTop }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 13px',
                  background: isActive ? 'rgba(217,202,129,0.1)' : 'transparent',
                  borderRadius: '14px', textDecoration: 'none',
                  transition: 'background 0.2s', margin: '0 6px',
                  marginTop: marginTop || '0px',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon
                  size={21}
                  style={{ color: isActive ? '#D9CA81' : 'rgba(255,255,255,0.85)', flexShrink: 0 }}
                />
                <span style={{
                  fontFamily: 'Arimo', fontSize: '15px',
                  fontWeight: isActive ? 700 : 400, lineHeight: '24px',
                  letterSpacing: '0.325px',
                  color: isActive ? '#D9CA81' : '#FFFFFF',
                }}>{label}</span>
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
          background: 'rgba(255,255,255,0.1)', borderRadius: '30px',
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
            <span style={{ fontFamily: 'Arial', fontSize: '11px', lineHeight: '16px', color: '#D1D5DC' }}>Admin</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '28px', height: '28px', background: 'none', border: 'none',
              borderRadius: '4px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0,
              color: '#D1D5DC',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            title="Logout"
          >
            <FiLogOut size={17} />
          </button>
        </div>
      </div>

    </aside>
  );

  return (
    <>
      {sidebarContent}

      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.45)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* Mobile hamburger toggle */}
      {isMobile && (
        <button
          onClick={() => setMobileOpen(o => !o)}
          style={{
            position: 'fixed', top: '20px', left: '20px', zIndex: 101,
            width: '40px', height: '40px',
            background: '#001947', border: 'none', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}

export default AdminSidebar;