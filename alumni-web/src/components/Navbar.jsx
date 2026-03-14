import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AlumnAIHorizontal from '../assets/alumnAI.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when resizing back to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const smoothScrollTo = (targetY, duration = 600) => {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let startTime = null;

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
      smoothScrollTo(top, 700);
    } else {
      window.location.href = `/#${id}`;
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home',      action: () => { smoothScrollTo(0, 700); setMenuOpen(false); } },
    { label: 'Events',    action: () => scrollTo('events')    },
    { label: 'Jobs',      action: () => scrollTo('jobs')      },
    { label: 'Discounts', action: () => scrollTo('discounts') },
    { label: 'About',     action: () => scrollTo('about')     },
  ];

  return (
    <>
      <style>{`
        /* ── Hamburger ── */
        .nb-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          z-index: 1100;
        }
        .nb-hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: #FFFFFF;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .nb-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nb-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Desktop elements ── */
        .nb-links   { display: flex; align-items: center; gap: 32px; }
        .nb-actions { display: flex; align-items: center; gap: 16px; }

        /* ── Mobile dropdown ── */
        .nb-mobile-menu {
          display: none;
          position: fixed;
          top: 64px;
          left: 0;
          width: 100%;
          background: #002263;
          border-top: 1px solid rgba(255,255,255,0.1);
          flex-direction: column;
          padding: 8px 24px 24px;
          z-index: 999;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          box-sizing: border-box;
        }
        .nb-mobile-menu.open { display: flex; }

        .nb-mobile-link {
          font-family: Arial, sans-serif;
          font-size: 16px;
          color: #FFFFFF;
          text-decoration: none;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          letter-spacing: 0.4px;
          transition: color 0.2s;
        }
        .nb-mobile-link:hover { color: #D9CA81; }

        .nb-mobile-actions {
          display: flex;
          gap: 12px;
          padding-top: 20px;
        }

        /* ── Tablet: 769px–1024px — tighten spacing ── */
        @media (max-width: 1024px) and (min-width: 769px) {
          .nb-inner   { padding: 0 24px !important; }
          .nb-links   { gap: 20px !important; }
        }

        /* ── Mobile: ≤ 768px — hamburger only ── */
        @media (max-width: 768px) {
          .nb-inner   { padding: 0 20px !important; }
          .nb-links   { display: none !important; }
          .nb-actions { display: none !important; }
          .nb-hamburger { display: flex !important; }
        }
      `}</style>

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
              style={{ height: '30px', objectFit: 'contain' }}
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
};

export default Navbar;