import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import capBg from '../assets/cap_bg.png';
import { supabase } from '../lib/supabase';
const alumnaiLogo = new URL('../assets/horizon_logo.svg', import.meta.url).href;

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [alumniCount, setAlumniCount] = useState('...');
  const [employmentRate, setEmploymentRate] = useState('...');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count users with role = 'alumni'
        const { count: alumni, error: alumniError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'alumni');

        if (alumniError) console.error('Alumni count error:', alumniError.message);

        // Count alumni who fully completed the survey (percentage = 100)
        const { count: completed, error: completedError } = await supabase
          .from('survey_progress')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true);

        if (completedError) console.error('Completed count error:', completedError.message);

        const alumniTotal = alumni ?? 0;
        const completedTotal = completed ?? 0;

        setAlumniCount(alumniTotal > 0 ? alumniTotal.toLocaleString() : '0');

        if (alumniTotal > 0) {
          const rate = ((completedTotal / alumniTotal) * 100).toFixed(1);
          setEmploymentRate(`${rate}%`);
        } else {
          setEmploymentRate('0%');
        }
      } catch (err) {
        console.error('fetchStats error:', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { number: alumniCount,    label: 'Alumni' },
    { number: '44',           label: 'Undergraduate and Postgraduate Programmes' },
    { number: employmentRate, label: 'Employment Rate' },
    { number: '#1201-1300',   label: 'Asia University Ranking' },
  ];

  const events = [
    { title: '[Event Name]', desc: '[Description]', date: '[Date]' },
    { title: '[Event Name]', desc: '[Description]', date: '[Date]' },
    { title: '[Event Name]', desc: '[Description]', date: '[Date]' },
  ];

  const discounts = [
    { title: '[Partner Establishments]', desc: '[Description]' },
    { title: '[Partner Establishments]', desc: '[Description]' },
    { title: '[Partner Establishments]', desc: '[Description]' },
  ];

  const whyCards = [
    { title: 'Stay Connected',  desc: 'Build lasting relationships with fellow alumni and expand your professional network.' },
    { title: 'Give Back',       desc: 'Mentor current students and support the next generation of leaders.' },
    { title: 'Grow Together',   desc: 'Access exclusive resources and opportunities for personal and professional growth.' },
  ];

  const missionItems = [
    { label: 'STUDENTS',                       desc: 'by molding them into ethical, spiritual and responsible citizens.' },
    { label: 'FACULTY and EMPLOYEES',          desc: 'by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.' },
    { label: 'ALUMNI',                         desc: 'by instilling in them a sense of pride, commitment, and loyalty to their alma mater.' },
    { label: 'INDUSTRY PARTNERS and EMPLOYERS',desc: 'by providing them Nationalians who will contribute to their growth and development.' },
    { label: 'COMMUNITY',                      desc: "by contributing to the improvement of life's conditions." },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&family=Arimo:wght@400;700&display=swap');

        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(8px); }
        }

        /* ── Navbar scroll effect ── */
        .lp-nav {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          z-index: 50;
          transition: background 0.3s, border-color 0.3s;
        }
        .lp-nav.scrolled  { background: #002263; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .lp-nav.top       { background: transparent; border-bottom: 1px solid transparent; }

        .lp-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 43px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .lp-logo { display: flex; align-items: center; gap: 8px; }
        .lp-logo-text { display: flex; align-items: baseline; }
        .lp-logo-text .white { font-family: 'Arial'; font-weight: 700; font-size: 24px; color: #FFFFFF; }
        .lp-logo-text .gold  { font-family: 'Arial'; font-weight: 700; font-size: 24px; color: #D9CA81; }

        /* Nav links */
        .lp-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .lp-nav-links button {
          background: none; border: none; cursor: pointer;
          font-family: 'Arial'; font-size: 16px; font-weight: 400;
          letter-spacing: 0.4px; color: #FFFFFF;
          transition: color 0.2s;
          padding: 0;
        }
        .lp-nav-links button:hover { color: #D9CA81; }

        /* Nav action buttons */
        .lp-nav-actions { display: flex; align-items: center; gap: 16px; }
        .lp-btn-login {
          padding: 8px 16px;
          background: #002263;
          border: 0.8px solid rgba(255,255,255,0.55);
          border-radius: 8px;
          font-family: 'Arial'; font-size: 14px; font-weight: 400;
          letter-spacing: 0.35px; color: #FFFFFF;
          cursor: pointer; transition: background 0.2s;
        }
        .lp-btn-login:hover  { background: #001a4d; }
        .lp-btn-register {
          padding: 8px 16px;
          background: #DAA520;
          border: none;
          border-radius: 8px;
          font-family: 'Arial'; font-size: 14px; font-weight: 400;
          letter-spacing: 0.35px; color: #00072D;
          cursor: pointer; transition: background 0.2s;
        }
        .lp-btn-register:hover { background: #C4911A; }

        /* Hamburger (mobile) */
        .lp-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }
        .lp-hamburger span {
          display: block; width: 24px; height: 2px;
          background: #FFFFFF; border-radius: 2px;
          transition: all 0.3s;
        }

        /* Mobile menu */
        .lp-mobile-menu {
          display: none;
          flex-direction: column;
          background: #002263;
          padding: 16px 43px 24px;
          gap: 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .lp-mobile-menu.open { display: flex; }
        .lp-mobile-menu button {
          background: none; border: none; cursor: pointer;
          font-family: 'Arial'; font-size: 16px; color: #FFFFFF;
          text-align: left; padding: 4px 0;
        }
        .lp-mobile-menu .lp-mobile-actions {
          display: flex; gap: 12px; padding-top: 8px;
        }

        /* Section titles */
        .lp-section-title {
          font-family: 'Arial'; font-weight: 700; font-size: 48px;
          line-height: 48px; color: #101828; margin: 0 0 16px;
          text-align: center;
        }
        .lp-section-subtitle {
          font-family: 'Arial'; font-size: 20px; line-height: 28px;
          color: #4A5565; margin: 0 auto;
          text-align: center; max-width: 768px;
        }

        /* Cards */
        .lp-card {
          background: #FFFFFF;
          border: 0.8px solid rgba(0,0,0,0.1);
          border-radius: 14px;
          padding: 24px;
          transition: box-shadow 0.2s;
        }
        .lp-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .lp-card h3 {
          font-family: 'Arial'; font-weight: 700; font-size: 20px;
          line-height: 28px; color: #0A0A0A; margin: 0 0 8px;
        }
        .lp-card p {
          font-family: 'Arial'; font-size: 16px;
          line-height: 24px; color: #4A5565; margin: 0;
        }
        .lp-card .date {
          font-family: 'Arial'; font-size: 14px;
          line-height: 20px; color: #35408E; margin: 8px 0 0;
        }

        /* View All Button */
        .lp-view-all {
          padding: 8px 32px;
          height: 48px;
          background: #002263;
          border: none;
          border-radius: 8px;
          color: #FFFFFF;
          font-family: 'Lexend', Arial; font-size: 16px; font-weight: 400;
          cursor: pointer; transition: background 0.2s;
        }
        .lp-view-all:hover { background: #001a4d; }

        /* ── Cards Grid ── */
        .lp-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        /* ── Stats grid ── */
        .lp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          max-width: 1216px;
          margin: 0 auto;
        }

        /* ── Why Join 2-col ── */
        .lp-why-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }

        /* ── Footer contact ── */
        .lp-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 48px 64px 32px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 80px;
        }
        .lp-footer-logo {
          flex-shrink: 0;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-footer-contact {
          flex: 0 1 auto;
        }

        /* ── Responsive Breakpoints ── */

        /* Tablet: ≤ 1024px */
        @media (max-width: 1024px) {
          .lp-nav-inner  { padding: 0 24px; }
          .lp-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
          .lp-why-grid   { grid-template-columns: 1fr; gap: 32px; }
          .lp-footer-inner { padding: 32px 32px; gap: 48px; }
        }

        /* Only stack footer on small mobile */
        @media (max-width: 600px) {
          .lp-footer-inner { flex-direction: column; align-items: flex-start; gap: 32px; }
        }

        /* ── Hero fluid styles ── */
        .lp-hero {
          width: 100%;
          height: 100vh;
          min-height: 500px;
          position: relative;
          background-size: cover;
          background-position: center;
        }
        .lp-hero-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 130px 5vw 40px;
          box-sizing: border-box;
          text-align: center;
        }
        .lp-hero-title-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .lp-hero-subtitle {
          font-size: clamp(14px, 1.8vw, 24px) !important;
          line-height: 1.4 !important;
          letter-spacing: 0.1em !important;
        }
        .lp-hero-title {
          font-size: clamp(36px, 7vw, 96px) !important;
          line-height: 1.2 !important;
          letter-spacing: 0.05em !important;
          white-space: nowrap;
        }
        .lp-explore-more {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          gap: 4px;
          margin-top: auto;
          margin-bottom: 16px;
        }
        .lp-explore-more p {
          font-family: Arial;
          font-size: clamp(13px, 1.2vw, 16px);
          color: #FFFFFF;
          margin: 0;
          letter-spacing: 0.4px;
        }

        /* Mobile landscape / small tablet: ≤ 768px */
        @media (max-width: 768px) {
          .lp-nav-links   { display: none; }
          .lp-nav-actions { display: none; }
          .lp-hamburger   { display: flex; }

          .lp-section-title   { font-size: 36px; line-height: 40px; }
          .lp-section-subtitle { font-size: 16px; }

          .lp-cards-grid { grid-template-columns: 1fr; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
          .lp-why-cards-grid { grid-template-columns: 1fr !important; }

          .lp-hero-title { white-space: normal !important; }
        }

        /* Mobile portrait: ≤ 480px */
        @media (max-width: 480px) {
          .lp-nav-inner  { padding: 0 16px; }

          .lp-section-title   { font-size: 28px; line-height: 32px; }
          .lp-section-subtitle { font-size: 15px; }

          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .lp-stat-number { font-size: 28px !important; }
          .lp-stat-label  { font-size: 13px !important; }

          .lp-footer-inner { padding: 0 16px; }
          section { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <Navbar />

      {/* ══ HERO SECTION ════════════════════════════════════════════════════ */}
      <section
        className="lp-hero"
        style={{
          backgroundImage: `url(${capBg})`,
        }}
      >
        {/* Vignette overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(70.71% 70.71% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Hero content */}
        <div className="lp-hero-content" style={{ zIndex: 1 }}>

          {/* Title block */}
          <div className="lp-hero-title-block">
            <p
              className="lp-hero-subtitle"
              style={{
                fontFamily: 'myPressuru, Impact, Arial, sans-serif',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                WebkitTextStroke: '0.6px rgba(0,0,0,0.6)',
                textShadow: '0px 2.5px 4px rgba(0,0,0,0.7)',
                margin: '0 0 -8px',
                fontWeight: 400,
              }}
            >
              OFFICE OF THE
            </p>
            <h1
              className="lp-hero-title"
              style={{
                fontFamily: 'myPressuru, Impact, Arial, sans-serif',
                color: '#FFFFFF',
                WebkitTextStroke: '0.9px rgba(0,0,0,0.7)',
                textShadow: '0px 4px 4px rgba(0,0,0,0.7)',
                margin: 0,
                fontWeight: 400,
              }}
            >
              ALUMNI AFFAIRS
            </h1>
          </div>

          {/* Explore More */}
          <div
            className="lp-explore-more"
            onClick={() => document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <p>Explore More</p>
            <svg
              style={{ animation: 'bounceDown 1.4s ease-in-out infinite' }}
              width="24" height="24" viewBox="0 0 24 24" fill="none"
            >
              <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ══ STATS SECTION ════════════════════════════════════════════════ */}
      <section
        id="stats"
        style={{ width: '100%', background: '#DAA520', padding: '64px 32px' }}
      >
        <div className="lp-stats-grid">
          {stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <h2
                className="lp-stat-number"
                style={{
                  fontFamily: 'Arial', fontWeight: 700, fontSize: '45px',
                  lineHeight: '48px', color: '#002263', margin: '0 0 8px',
                }}
              >
                {stat.number}
              </h2>
              <p
                className="lp-stat-label"
                style={{
                  fontFamily: 'Arial', fontSize: '16px',
                  lineHeight: '24px', color: '#0B3D91', margin: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ UPCOMING EVENTS ══════════════════════════════════════════════ */}
      <section
        id="events"
        style={{ width: '100%', background: '#FFFFFF', padding: '96px 32px 64px' }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 className="lp-section-title">Upcoming Events</h2>
            <p className="lp-section-subtitle">
              Stay updated with upcoming activities and gatherings designed to keep you engaged with the alumni community.
            </p>
          </div>
          <div className="lp-card" style={{ marginBottom: '48px' }}>
            <h3>No upcoming events</h3>
            <p>Check back soon for exciting events and gatherings from the alumni community.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="lp-view-all">View All</button>
          </div>
        </div>
      </section>

      {/* ══ JOB OPPORTUNITIES ════════════════════════════════════════════ */}
      <section
        id="jobs"
        style={{ width: '100%', background: '#F9FAFB', padding: '96px 32px 64px' }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 className="lp-section-title">Job Opportunities</h2>
            <p className="lp-section-subtitle">
              Browse through our curated list of job opportunities specifically for NU Dasmariñas alumni.
            </p>
          </div>
          <div className="lp-card" style={{ marginBottom: '48px' }}>
            <h3>No job postings available</h3>
            <p>Check back soon for exciting career opportunities from our partner companies.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="lp-view-all">View All</button>
          </div>
        </div>
      </section>

      {/* ══ ALUMNI DISCOUNTS ═════════════════════════════════════════════ */}
      <section
        id="discounts"
        style={{ width: '100%', background: '#FFFFFF', padding: '96px 32px 64px' }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 className="lp-section-title">Alumni Discounts</h2>
            <p className="lp-section-subtitle">
              Enjoy exclusive discounts and benefits from our partner establishments.
            </p>
          </div>
          <div className="lp-card" style={{ marginBottom: '48px' }}>
            <h3>No discounts available</h3>
            <p>Check back soon for exclusive discounts and benefits from our partner establishments.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="lp-view-all">View All</button>
          </div>
        </div>
      </section>

      {/* ══ MISSION & VISION ═════════════════════════════════════════════ */}
      <section
        id="about"
        style={{ width: '100%', background: '#F9FAFB', padding: '96px 32px 80px' }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* Section intro */}
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 className="lp-section-title">
              Why Join{' '}
              <span style={{ color: '#002263' }}>Alumn</span>
              <span style={{ color: 'rgba(201,167,0,0.85)' }}>AI</span>?
            </h2>
            <p className="lp-section-subtitle">
              Connecting National University—Dasmariñas alumni through innovative technology and community engagement.
            </p>
          </div>

          {/* Mission */}
          <div style={{ marginBottom: '56px' }}>
            <h2 style={{
              fontFamily: 'Arial', fontWeight: 700, fontSize: '42px',
              lineHeight: '1.1', color: '#002263',
              textAlign: 'center', margin: '0 0 16px',
            }}>
              Mission
            </h2>
            <div style={{
              width: '100%', height: '2px',
              background: '#002263',
              marginBottom: '32px',
              borderRadius: '2px',
            }} />
            <p style={{
              fontFamily: 'Arial', fontSize: '19px', lineHeight: '28px',
              color: '#364153', margin: '0 0 16px', textAlign: 'justify',
            }}>
              Guided by the core values and characterized by our cultural heritage of Dynamic Filipinism,
              National University is committed to providing relevant, innovative, and accessible quality
              education and other development programs.
            </p>
            <p style={{
              fontFamily: 'Arial', fontSize: '19px', lineHeight: '28px',
              color: '#364153', margin: '0 0 16px', textAlign: 'justify',
            }}>
              We are committed to our:
            </p>
            {missionItems.map((item, i) => (
              <p key={i} style={{
                fontFamily: 'Arial', fontSize: '19px', lineHeight: '28px',
                color: '#364153', margin: '0 0 10px', textAlign: 'justify',
              }}>
                <span style={{ fontWeight: 700, color: '#DAA520' }}>{item.label}</span>
                {', '}{item.desc}
              </p>
            ))}
          </div>

          {/* Vision */}
          <div style={{ marginBottom: '0' }}>
            <h2 style={{
              fontFamily: 'Arial', fontWeight: 700, fontSize: '42px',
              lineHeight: '1.1', color: '#002263',
              textAlign: 'center', margin: '0 0 16px',
            }}>
              Vision
            </h2>
            <div style={{
              width: '100%', height: '2px',
              background: '#002263',
              marginBottom: '32px',
              borderRadius: '2px',
            }} />
            <p style={{
              fontFamily: 'Arial', fontSize: '19px', lineHeight: '28px',
              color: '#364153', margin: 0, textAlign: 'justify',
            }}>
              We are National University, a dynamic private institution committed to nation building,
              recognized internationally in teaching and research.
            </p>
          </div>
        </div>
      </section>

      {/* ══ WHY JOIN — BENEFIT CARDS ══════════════════════════════════════ */}
      <section style={{ width: '100%', background: '#F9FAFB', padding: '80px 32px' }}>
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontFamily: 'Arial', fontWeight: 700, fontSize: '36px',
              lineHeight: '44px', color: '#101828', margin: '0 0 12px',
            }}>
              Benefits
            </h2>
            <p style={{
              fontFamily: 'Arial', fontSize: '17px', lineHeight: '26px',
              color: '#4A5565', margin: 0,
            }}>
              Membership opens doors to a lifetime of opportunity, connection, and growth.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
            className="lp-why-cards-grid"
          >
            {[
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'Stay Connected',
                desc: 'Build lasting relationships with fellow alumni and expand your professional network across industries and borders.',
              },
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'Give Back',
                desc: 'Mentor current students, support scholarship programs, and help shape the next generation of NU Dasmariñas leaders.',
              },
              {
                icon: (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'Grow Together',
                desc: 'Access exclusive job listings, events, partner discounts, and resources designed to fuel your personal and professional growth.',
              },
            ].map((card, i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,34,99,0.14)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top accent bar — gold */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#DAA520',
                  flexShrink: 0,
                }} />

                {/* Card body */}
                <div style={{
                  padding: '36px 28px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  width: '100%',
                  boxSizing: 'border-box',
                }}>
                  {/* Icon in circle */}
                  <div style={{
                    width: '72px', height: '72px',
                    background: 'rgba(0,34,99,0.07)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '20px',
                    flexShrink: 0,
                  }}>
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: 'Arial', fontWeight: 700, fontSize: '22px',
                    lineHeight: '1.3', color: '#101828', margin: '0 0 10px',
                  }}>
                    {card.title}
                  </h3>

                  {/* Gold underline beneath title */}
                  <div style={{
                    width: '48px', height: '3px',
                    background: '#DAA520',
                    borderRadius: '2px',
                    marginBottom: '20px',
                    flexShrink: 0,
                  }} />

                  {/* Description */}
                  <p style={{
                    fontFamily: 'Arial', fontSize: '15px', lineHeight: '24px',
                    color: '#4A5565', margin: 0,
                  }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={{ width: '100%', background: '#002263', marginTop: '0', flex: 1 }}>
        <div className="lp-footer-inner">
          {/* Logo card */}
          <div className="lp-footer-logo">
            <img
              src={alumnaiLogo}
              alt="AlumnAI Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Contact info */}
          <div className="lp-footer-contact">
            <h3 style={{
              fontFamily: 'Arial', fontWeight: 700, fontSize: '16px',
              lineHeight: '24px', letterSpacing: '0.2em',
              color: '#FFFFFF', margin: '0 0 24px', textTransform: 'uppercase',
            }}>
              CONTACT US
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  icon: <path d="M8.5 0C5.87 0 3.75 2.12 3.75 4.75C3.75 8.31 8.5 14 8.5 14C8.5 14 13.25 8.31 13.25 4.75C13.25 2.12 11.13 0 8.5 0ZM8.5 6.5C7.67 6.5 7 5.83 7 5C7 4.17 7.67 3.5 8.5 3.5C9.33 3.5 10 4.17 10 5C10 5.83 9.33 6.5 8.5 6.5Z" fill="#FFFFFF" />,
                  text: "Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114",
                },
                {
                  icon: <path d="M13.5 10.5C12.9 10.5 12.3 10.4 11.8 10.2C11.6 10.1 11.4 10.1 11.2 10.2L9.8 11.6C7.9 10.6 6.4 9.1 5.4 7.2L6.8 5.8C7 5.6 7 5.3 6.9 5.1C6.7 4.6 6.6 4 6.6 3.4C6.6 3 6.3 2.7 5.9 2.7H3.7C3.3 2.7 3 3 3 3.4C3 8.8 7.3 13 12.6 13C13 13 13.3 12.7 13.3 12.3V10.1C13.3 9.7 13 9.4 12.6 9.4L13.5 10.5Z" fill="#FFFFFF" />,
                  text: '0912-345-6789',
                },
                {
                  icon: <path d="M14.5 3H2.5C1.95 3 1.5 3.45 1.5 4V12C1.5 12.55 1.95 13 2.5 13H14.5C15.05 13 15.5 12.55 15.5 12V4C15.5 3.45 15.05 3 14.5 3ZM14.5 5.5L8.5 8.5L2.5 5.5V4H14.5V5.5Z" fill="#FFFFFF" />,
                  text: 'nudaao@nu-dasma.edu.ph',
                },
                {
                  icon: <path d="M8.5 1C4.64 1 1.5 4.14 1.5 8C1.5 11.86 4.64 15 8.5 15C12.36 15 15.5 11.86 15.5 8C15.5 4.14 12.36 1 8.5 1ZM8.5 13.5C5.47 13.5 3 11.03 3 8C3 4.97 5.47 2.5 8.5 2.5C11.53 2.5 14 4.97 14 8C14 11.03 11.53 13.5 8.5 13.5ZM9 5H8V8.5L11.25 10.5L11.75 9.75L9 8.25V5Z" fill="#FFFFFF" />,
                  text: 'Monday to Friday (8:30AM - 5:30PM); Saturday (8:30AM - 12:30PM)',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}>
                    {item.icon}
                  </svg>
                  <p style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider + copyright */}
        <div style={{ padding: '0', textAlign: 'center' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '16px' }} />
          <p style={{
            fontFamily: 'Arial', fontSize: '14px', lineHeight: '24px',
            textAlign: 'center', color: 'rgba(255,255,255,0.5)',
            margin: '0 0 16px',
          }}>
            © 2026 AlumnAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;