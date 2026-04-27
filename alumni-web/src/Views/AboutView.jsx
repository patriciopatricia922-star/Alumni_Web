import React, { useState } from 'react';
import '../styles/About.css';           // ← standalone stylesheet (no more inline CSS string)
import Sidebar    from '../components/Sidebar';
import AlumnAILogo from '../assets/alumnai_logo_new.svg';
import TargetIcon  from '../assets/target_icn.png';
import MagnifyIcon from '../assets/magnifying_icn.png';
import MessageIcon from '../assets/message_icn.svg';
import PaperIcon   from '../assets/paper_icn.svg';
import ProtectIcon from '../assets/protect_icn.svg';
import RightArrow  from '../assets/right_arrow.svg';
import Missionicon from '../assets/mission_icn.svg';

/* ─────────────────────────────────────────────────────────────
   STATIC CONTENT  (migrated from the former separate-page routes)
───────────────────────────────────────────────────────────── */
const MISSION_TEXT =
`Guided by the core values and characterized by our cultural heritage of Dynamic Filipinism, National University is committed to providing relevant, innovative, and accessible quality education and other development programs.

We are committed to our:

STUDENTS, by molding them into ethical, spiritual and responsible citizens.

FACULTY and EMPLOYEES, by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.

ALUMNI, by instilling in them a sense of pride, commitment, and loyalty to their alma mater.

INDUSTRY PARTNERS and EMPLOYERS, by providing them Nationalians who will contribute to their growth and development.

COMMUNITY by contributing to the improvement of life's conditions`;

const VISION_TEXT =
  'We are National University, a dynamic private institution committed to nation building, recognized internationally in teaching and research.';

const TOS_SECTIONS = [
  { title: '1. Acceptance of Terms',
    body:  'By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.' },
  { title: '2. Purpose of the Platform',
    body:  'AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.' },
  { title: '3. User Responsibilities',
    body:  'Provide accurate and truthful information.\nUse the platform only for lawful and appropriate purposes.\nKeep your login credentials secure and confidential.\nRefrain from activities that may disrupt or harm the platform.' },
  { title: '4. Data Use and Accuracy',
    body:  'The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.' },
  { title: '5. Availability and Updates',
    body:  'The institution may modify, update, or discontinue platform features at any time without prior notice.' },
  { title: '6. Limitation of Liability',
    body:  'AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.' },
  { title: '7. Changes to the Terms',
    body:  'We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.' },
];

const PRIVACY_SECTIONS = [
  { title: '1. Information We Collect',
    body:  'We may collect the following types of information:\n• Personal Information: Name, Contact Details, Demographic info.\n• Educational Data: Program, Year Graduated, Academic Records (when applicable).\n• Employment Information: Job Details, Career Progress, and Related Survey Responses.\n• Usage Data: Device Information, Logs, and Interactions with the Platform.' },
  { title: '2. How We Use Your Information',
    body:  'Information collected through AlumnAI may be used to:\n• Maintain and improve alumni records.\n• Analyze graduate outcomes and employment trends.\n• Provide personalized alumni services, opportunities, and notifications.\n• Enhance the overall alumni engagement experience.' },
  { title: '3. Data Sharing',
    body:  'We do not sell personal data. Information may only be shared with:\n• Internal university offices for legitimate academic or administrative purposes.\n• Third-party service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements.' },
  { title: '4. Data Security',
    body:  'We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.' },
  { title: '5. User Rights',
    body:  'You have the right to:\n• Access a copy of your personal data.\n• Update or correct inaccurate information.' },
  { title: '6. Cookies and Tracking',
    body:  'The platform may use cookies or similar technologies to improve functionality and user experience.' },
  { title: '7. Data Retention',
    body:  'Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.' },
  { title: '8. Third-Party Links',
    body:  'AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.' },
  { title: '9. Updates to the Policy',
    body:  'We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.' },
  { title: '10. Contact Us',
    body:  "For questions or requests regarding your data or privacy:\nEmail: nudaao@nu-dasma.edu.ph\nPhone: 09399151561 (Smart) / 09661381357 (Globe)\nLocation: Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114" },
];

/* ─────────────────────────────────────────────────────────────
   SHARED MODAL SHELL
───────────────────────────────────────────────────────────── */
const Modal = ({ onClose, iconClass, icon, iconAlt, title, subtitle, children }) => (
  <div className="ab-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="ab-modal" role="dialog" aria-modal="true">

      {/* ── Header ─────────────────────────────── */}
      <div className="ab-modal-hdr">
        <div className={`ab-modal-hdr-icon ${iconClass}`}>
          <img src={icon} alt={iconAlt} />
        </div>
        <div className="ab-modal-hdr-txt">
          <p className="ab-modal-hdr-title">{title}</p>
          {subtitle && <p className="ab-modal-hdr-sub">{subtitle}</p>}
        </div>
        <button className="ab-modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14 4L4 14M4 4L14 14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Body (scrolls) ─────────────────────── */}
      <div className="ab-modal-body">
        {children}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MISSION MODAL
───────────────────────────────────────────────────────────── */
const MISSION_KEYWORDS = [
  'STUDENTS,',
  'FACULTY and EMPLOYEES,',
  'ALUMNI,',
  'INDUSTRY PARTNERS and EMPLOYERS,',
  'COMMUNITY',
];

const MissionModal = ({ onClose }) => {
  const colorized = MISSION_TEXT.split('\n').map((line, i) => {
    const matched = MISSION_KEYWORDS.find(k => line.trim().startsWith(k));
    if (matched) {
      const rest = line.slice(line.indexOf(matched) + matched.length);
      return (
        <span key={i} style={{ display: 'block' }}>
          <span style={{ color: '#003EA6', fontWeight: 700 }}>{matched}</span>
          <span style={{ color: '#1a2a4a', fontWeight: 400 }}>{rest}</span>
        </span>
      );
    }
    return <span key={i} style={{ display: 'block' }}>{line}</span>;
  });

  return (
    <Modal onClose={onClose} iconClass="blue" icon={Missionicon}
      iconAlt="Mission" title="Mission" subtitle="Our core purpose">
      <div className="ab-modal-inner">
        <p className="ab-mission-body">{colorized}</p>
      </div>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────
   VISION MODAL
───────────────────────────────────────────────────────────── */
const VisionModal = ({ onClose }) => (
  <Modal onClose={onClose} iconClass="blue" icon={MagnifyIcon}
    iconAlt="Vision" title="Vision" subtitle="What we aim to achieve">
    <div className="ab-modal-inner">
      <p className="ab-vision-body">{VISION_TEXT}</p>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   CONTACT SUPPORT MODAL
   Content source: ContactSupport.jsx (former standalone route)
───────────────────────────────────────────────────────────── */
const ContactModal = ({ onClose }) => (
  <Modal onClose={onClose} iconClass="blue" icon={MessageIcon}
    iconAlt="Contact Support" title="Contact Support" subtitle="We're here to help">
    <div className="ab-modal-inner">

      <p className="ab-contact-subtitle">Your Ways to Reach Us:</p>

      {/* Email */}
      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6l-10 7L2 6"
              stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Email</p>
          <p className="ab-contact-row-value">nudaao@nu-dasma.edu.ph</p>
          <p className="ab-contact-row-hint">Response Time: Within 24–48 hours</p>
        </div>
      </div>

      {/* Phone */}
      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.02 2.1 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
              stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Phone</p>
          <p className="ab-contact-row-value">0939-915-1561 (Smart) / 0966-138-1357 (Globe)</p>
          <p className="ab-contact-row-hint">{'Monday–Friday, 8:30 AM – 5:30 PM\nSaturday, 8:30 AM – 12:30 PM'}</p>
        </div>
      </div>

      {/* Office Address */}
      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
              stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="#2B72FB" strokeWidth="1.8"/>
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Office Address</p>
          <p className="ab-contact-row-value">
            {'Alumni Affairs Office\nNational University – Dasmariñas\nGovernor\'s Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114, Philippines'}
          </p>
        </div>
      </div>

    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   TERMS OF SERVICE MODAL
   Content source: TermsOfServiceAbout.jsx (former standalone route)
   Body is scrollable via .ab-modal-body overflow-y:auto
───────────────────────────────────────────────────────────── */
const TosModal = ({ onClose }) => (
  <Modal onClose={onClose} iconClass="yellow" icon={PaperIcon}
    iconAlt="Terms of Service" title="Terms of Service"
    subtitle="Last Updated: February 28, 2026">
    <div className="ab-modal-inner">
      {TOS_SECTIONS.map((sec, i) => (
        <div key={i}>
          <p className="ab-modal-sec-title">{sec.title}</p>
          <p className="ab-modal-sec-body">{sec.body}</p>
        </div>
      ))}
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   PRIVACY POLICY MODAL
   Content source: PrivacyPolicyAbout.jsx (former standalone route)
   Body is scrollable via .ab-modal-body overflow-y:auto
───────────────────────────────────────────────────────────── */
const PrivacyModal = ({ onClose }) => (
  <Modal onClose={onClose} iconClass="red" icon={ProtectIcon}
    iconAlt="Privacy Policy" title="Privacy Policy"
    subtitle="Last Updated: February 28, 2026">
    <div className="ab-modal-inner">
      {PRIVACY_SECTIONS.map((sec, i) => (
        <div key={i}>
          <p className="ab-modal-sec-title">{sec.title}</p>
          <p className="ab-modal-sec-body">{sec.body}</p>
        </div>
      ))}
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION ROW
───────────────────────────────────────────────────────────── */
const NItem = ({ n, markOneRead, formatTime }) => (
  <div
    onClick={() => markOneRead(n.id)}
    style={{
      display:'flex', alignItems:'flex-start', gap:'12px',
      padding:'10px 18px',
      background: n.read ? 'transparent' : 'rgba(43,114,251,.07)',
      cursor:'pointer', transition:'background .12s',
      borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(43,114,251,.07)'}
  >
    <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(43,114,251,.15)',border:'1px solid rgba(43,114,251,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
          stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/>
      </svg>
    </div>
    <div style={{flex:1,minWidth:0}}>
      <p style={{fontFamily:'Montserrat',fontWeight:n.read?400:700,fontSize:13,color:'#fff',margin:'0 0 2px',lineHeight:1.4}}>{n.title}</p>
      <p style={{fontFamily:'Montserrat',fontSize:12,color:'rgba(255,255,255,.45)',margin:'0 0 4px',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{n.body}</p>
      <span style={{fontFamily:'Montserrat',fontSize:11,color:'rgba(255,255,255,.25)'}}>{formatTime(n.time)}</span>
    </div>
    {!n.read && <div style={{width:8,height:8,borderRadius:'50%',background:'#2B72FB',flexShrink:0,marginTop:6}}/>}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN VIEW
═══════════════════════════════════════════════════════════ */
const AboutView = ({
  isMobile, isTablet,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  const [activeModal, setActiveModal] = useState(null);
  const openModal  = name => setActiveModal(name);
  const closeModal = ()   => setActiveModal(null);

  return (
    <>
      <div className="ab-root">
        <Sidebar />

        <div className="ab-main">

          {/* ── Bell ─────────────────────────────── */}
          <div ref={bellRef} className="ab-bell">
            <button className="ab-bell-btn" onClick={() => setShowDropdown(v => !v)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                  stroke="#fff" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {unreadCount > 0 && (
                <div className="ab-badge">
                  <span>{unreadCount > 99 ? '99+' : unreadCount}</span>
                </div>
              )}
            </button>

            {showDropdown && (
              <div className="ab-ndrop">
                <div style={{padding:'16px 18px 12px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                  <span style={{fontFamily:'Montserrat',fontWeight:700,fontSize:16,color:'#fff'}}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{background:'none',border:'none',fontFamily:'Montserrat',fontSize:12,color:'#2B72FB',cursor:'pointer',padding:0}}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{display:'flex',padding:'10px 18px 0',gap:4,flexShrink:0}}>
                  {['all','unread'].map(t => (
                    <button key={t} onClick={() => setNotifTab(t)} style={{
                      height:32, padding:'0 16px',
                      background: notifTab===t ? '#2B72FB' : 'transparent',
                      border: notifTab===t ? 'none' : '1px solid rgba(255,255,255,.12)',
                      borderRadius:20, cursor:'pointer',
                      fontFamily:'Montserrat', fontSize:13,
                      fontWeight: notifTab===t ? 700 : 400,
                      color:'#fff', transition:'all .15s', textTransform:'capitalize',
                    }}>
                      {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                    </button>
                  ))}
                </div>
                <div className="ab-ndrop-list">
                  {(() => {
                    const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                    if (!list.length) return (
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:10}}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                            stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <p style={{fontFamily:'Montserrat',fontSize:13,color:'rgba(255,255,255,.3)',margin:0}}>
                          {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                        </p>
                      </div>
                    );
                    return Object.entries(groupByDate(list)).map(([label, items]) => {
                      if (!items.length) return null;
                      return (
                        <div key={label}>
                          <p style={{fontFamily:'Montserrat',fontWeight:700,fontSize:11,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.8px',margin:'10px 18px 4px'}}>{label}</p>
                          {items.map(n => <NItem key={n.id} n={n} markOneRead={markOneRead} formatTime={formatTime}/>)}
                        </div>
                      );
                    });
                  })()}
                </div>
                <div style={{padding:'10px 18px',borderTop:'1px solid rgba(255,255,255,.07)',flexShrink:0}}>
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                    style={{width:'100%',height:36,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,fontFamily:'Montserrat',fontSize:13,color:'rgba(255,255,255,.7)',cursor:'pointer'}}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
                  >
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Back ─────────────────────────────── */}
          <button className="ab-back" onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 17 17" fill="none">
              <path d="M13 8.5H2M2 8.5L7 3.5M2 7.5L7 13.5"
                stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>

          {/* ── Page heading ─────────────────────── */}
          <div className="ab-hdr">
            <h1 className="ab-title">About</h1>
            <p className="ab-sub">Support and assistance for your alumni needs.</p>
          </div>

          {/* ── HERO CARD ────────────────────────── */}
          <div className="ab-hero">
            <div className="ab-circ ab-c1"/>
            <div className="ab-circ ab-c2"/>
            <div className="ab-circ ab-c3"/>

            {/* Logo — scale(1.4) applied via CSS */}
            <div className="ab-logo-row">
              <img src={AlumnAILogo} alt="AlumnAI"/>
            </div>

            <p className="ab-desc">
              Connecting National University – Dasmariñas alumni through innovative technology and
              meaningful community engagement, fostering stronger relationships, continuous
              collaboration, and long-term professional growth within a dynamic and supportive
              alumni network.
            </p>

            {/* Mission / Vision cards */}
            <div className="ab-mv">
              <button className="ab-mv-card" onClick={() => openModal('mission')}>
                <div className="ab-mv-icon"><img src={TargetIcon} alt="Mission"/></div>
                <div className="ab-mv-txt">
                  <p className="ab-mv-lbl">Mission</p>
                  <p className="ab-mv-slbl">Our core purpose</p>
                </div>
                <div className="ab-mv-div"/>
                <img src={RightArrow} alt="" className="ab-mv-arrow"/>
              </button>

              <button className="ab-mv-card" onClick={() => openModal('vision')}>
                <div className="ab-mv-icon"><img src={MagnifyIcon} alt="Vision"/></div>
                <div className="ab-mv-txt">
                  <p className="ab-mv-lbl">Vision</p>
                  <p className="ab-mv-slbl">What we aim to achieve</p>
                </div>
                <div className="ab-mv-div"/>
                <img src={RightArrow} alt="" className="ab-mv-arrow"/>
              </button>
            </div>
          </div>

          {/* ── SUPPORT & LEGAL ──────────────────── */}
          <div className="ab-support">
            <h2 className="ab-s-title">Support &amp; Legal</h2>
            <div className="ab-s-grid">
              <button className="ab-tile blue" onClick={() => openModal('contact')}>
                <div className="ab-tile-icon blue"><img src={MessageIcon} alt=""/></div>
                <p className="ab-tile-name">Contact Support</p>
                <p className="ab-tile-sub">Get help from our team</p>
              </button>

              <button className="ab-tile yellow" onClick={() => openModal('tos')}>
                <div className="ab-tile-icon yellow"><img src={PaperIcon} alt=""/></div>
                <p className="ab-tile-name">Terms of Service</p>
                <p className="ab-tile-sub">Read our guidelines</p>
              </button>

              <button className="ab-tile red" onClick={() => openModal('privacy')}>
                <div className="ab-tile-icon red"><img src={ProtectIcon} alt=""/></div>
                <p className="ab-tile-name">Privacy Policy</p>
                <p className="ab-tile-sub">Your data protection</p>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────── */}
      {activeModal === 'mission' && <MissionModal  onClose={closeModal}/>}
      {activeModal === 'vision'  && <VisionModal   onClose={closeModal}/>}
      {activeModal === 'contact' && <ContactModal  onClose={closeModal}/>}
      {activeModal === 'tos'     && <TosModal      onClose={closeModal}/>}
      {activeModal === 'privacy' && <PrivacyModal  onClose={closeModal}/>}
    </>
  );
};

export default AboutView;