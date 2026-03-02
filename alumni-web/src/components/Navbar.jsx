import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlumnAIHorizontal from '../assets/alumnAI.png';


const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '64px',
        zIndex: 1000,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        backgroundColor: scrolled ? '#002263' : 'transparent',
        boxShadow: scrolled ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 51px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
                src={AlumnAIHorizontal}
                alt="AlumnAI"
                style={{
                height: '30px',
                width: '30',
                objectFit: 'contain',
                }}
            />
            </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { to: '/', label: 'Home' },
            { to: '/events', label: 'Events' },
            { to: '/jobs', label: 'Jobs' },
            { to: '/discounts', label: 'Discounts' },
            { to: '/about', label: 'About' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#FFFFFF',
                textDecoration: 'none',
                letterSpacing: '0.4px',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 16px',
                background: scrolled ? '#002263' : 'rgba(0, 34, 99, 0.6)',
                border: '0.8px solid rgba(255, 255, 255, 0.55)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
                lineHeight: '20px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 400,
                cursor: 'pointer',
                letterSpacing: '0.35px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#001845')}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = scrolled ? '#002263' : 'rgba(0, 34, 99, 0.6)')
              }
            >
              Log in
            </button>
          </Link>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 16px',
                background: '#DAA520',
                border: 'none',
                borderRadius: '8px',
                color: '#00072D',
                fontSize: '14px',
                lineHeight: '20px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 400,
                cursor: 'pointer',
                letterSpacing: '0.35px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#C89600')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#DAA520')}
            >
              Register
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;