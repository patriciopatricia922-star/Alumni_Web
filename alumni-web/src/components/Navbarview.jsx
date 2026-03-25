import React from 'react';
import { Link } from 'react-router-dom';
import AlumnAIHorizontal from '../assets/new_lg.svg';
import './Navbar.css';

const NavbarView = ({ scrolled, menuOpen, setMenuOpen, navLinks }) => (
  <>
    {/* ── Nav bar ── */}
    <nav style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%',
      height: '64px',
      zIndex: 1000,
      transition: 'background-color 0.6s ease, box-shadow 0.6s ease',
      backgroundColor: menuOpen ? '#002263' : (scrolled ? '#002263' : 'transparent'),
      boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
    }}>
      <div
        className="nb-inner"
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
            style={{ height: '69px', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop nav links */}
        <div className="nb-links">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#FFFFFF',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.4px',
                padding: 0,
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="nb-actions">
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

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button
              style={{
                padding: '8px 16px',
                background: scrolled ? '#002263' : 'rgba(0,34,99,0.6)',
                border: '0.8px solid rgba(255,255,255,0.55)',
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
                (e.target.style.backgroundColor = scrolled ? '#002263' : 'rgba(0,34,99,0.6)')
              }
            >
              Log in
            </button>
          </Link>
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className={`nb-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>

    {/* ── Mobile dropdown ── */}
    <div className={`nb-mobile-menu${menuOpen ? ' open' : ''}`}>
      {navLinks.map((link) => (
        <button
          key={link.label}
          onClick={link.action}
          className="nb-mobile-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
        >
          {link.label}
        </button>
      ))}

      <div className="nb-mobile-actions">
        <Link
          to="/register"
          style={{ textDecoration: 'none', flex: 1 }}
          onClick={() => setMenuOpen(false)}
        >
          <button style={{
            width: '100%',
            padding: '10px 16px',
            background: '#DAA520',
            border: 'none',
            borderRadius: '8px',
            color: '#00072D',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.35px',
          }}>
            Register
          </button>
        </Link>

        <Link
          to="/login"
          style={{ textDecoration: 'none', flex: 1 }}
          onClick={() => setMenuOpen(false)}
        >
          <button style={{
            width: '100%',
            padding: '10px 16px',
            background: 'transparent',
            border: '0.8px solid rgba(255,255,255,0.55)',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 400,
            cursor: 'pointer',
            letterSpacing: '0.35px',
          }}>
            Log in
          </button>
        </Link>
      </div>
    </div>
  </>
);

export default NavbarView;