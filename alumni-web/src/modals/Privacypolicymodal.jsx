import React from 'react';

/* ─────────────────────────────────────────────────────────────
   STATIC CONTENT
───────────────────────────────────────────────────────────── */
const PRIVACY_SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We may collect the following types of information:\n• Personal Information: Name, Contact Details, Demographic info.\n• Educational Data: Program, Year Graduated, Academic Records (when applicable).\n• Employment Information: Job Details, Career Progress, and Related Survey Responses.\n• Usage Data: Device Information, Logs, and Interactions with the Platform.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Information collected through AlumnAI may be used to:\n• Maintain and improve alumni records.\n• Analyze graduate outcomes and employment trends.\n• Provide personalized alumni services, opportunities, and notifications.\n• Enhance the overall alumni engagement experience.',
  },
  {
    title: '3. Data Sharing',
    body: 'We do not sell personal data. Information may only be shared with:\n• Internal university offices for legitimate academic or administrative purposes.\n• Third-party service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements.',
  },
  {
    title: '4. Data Security',
    body: 'We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.',
  },
  {
    title: '5. User Rights',
    body: 'You have the right to:\n• Access a copy of your personal data.\n• Update or correct inaccurate information.',
  },
  {
    title: '6. Cookies and Tracking',
    body: 'The platform may use cookies or similar technologies to improve functionality and user experience.',
  },
  {
    title: '7. Data Retention',
    body: 'Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.',
  },
  {
    title: '8. Third-Party Links',
    body: 'AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.',
  },
  {
    title: '9. Updates to the Policy',
    body: 'We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.',
  },
  {
    title: '10. Contact Us',
    body: "For questions or requests regarding your data or privacy:\nEmail: nudaao@nu-dasma.edu.ph\nPhone: 09399151561 (Smart) / 09661381357 (Globe)\nLocation: Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114",
  },
];

/* ─────────────────────────────────────────────────────────────
   SHARED MODAL SHELL  (mirrors About.jsx's <Modal> component)
───────────────────────────────────────────────────────────── */
const ModalShell = ({ onClose, iconClass, iconSvg, title, subtitle, children }) => (
  <div
    className="ab-overlay"
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="ab-modal" role="dialog" aria-modal="true">

      {/* ── Header ── */}
      <div className="ab-modal-hdr">
        <div className={`ab-modal-hdr-icon ${iconClass}`}>
          {iconSvg}
        </div>
        <div className="ab-modal-hdr-txt">
          <p className="ab-modal-hdr-title">{title}</p>
          {subtitle && <p className="ab-modal-hdr-sub">{subtitle}</p>}
        </div>
        <button className="ab-modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M14 4L4 14M4 4L14 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="ab-modal-body">
        {children}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   PRIVACY POLICY MODAL
───────────────────────────────────────────────────────────── */
const PrivacyPolicyModal = ({ onClose }) => (
  <ModalShell
    onClose={onClose}
    iconClass="red"
    iconSvg={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    }
    title="Privacy Policy"
    subtitle="Last Updated: February 28, 2026"
  >
    <div className="ab-modal-inner">
      {PRIVACY_SECTIONS.map((sec, i) => (
        <div key={i}>
          <p className="ab-modal-sec-title">{sec.title}</p>
          <p className="ab-modal-sec-body">{sec.body}</p>
        </div>
      ))}
    </div>
  </ModalShell>
);

export default PrivacyPolicyModal;