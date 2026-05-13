// modals/TermsModal.jsx
// ============================================================================
// Change log
// [disclosure-sync]  Added `updatedAt` prop.
//                    formatUpdatedAt() renders a human-readable date when the
//                    admin has saved a disclosure row, otherwise falls back to
//                    the original static string so nothing breaks on first run.
// ============================================================================

import React from 'react';

/* ─────────────────────────────────────────────────────────────
   STATIC CONTENT
───────────────────────────────────────────────────────────── */
const TOS_SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.',
  },
  {
    title: '2. Purpose of the Platform',
    body: 'AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.',
  },
  {
    title: '3. User Responsibilities',
    body: 'Provide accurate and truthful information.\nUse the platform only for lawful and appropriate purposes.\nKeep your login credentials secure and confidential.\nRefrain from activities that may disrupt or harm the platform.',
  },
  {
    title: '4. Data Use and Accuracy',
    body: 'The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.',
  },
  {
    title: '5. Availability and Updates',
    body: 'The institution may modify, update, or discontinue platform features at any time without prior notice.',
  },
  {
    title: '6. Limitation of Liability',
    body: 'AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.',
  },
  {
    title: '7. Changes to the Terms',
    body: 'We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.',
  },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

// Formats an ISO timestamp into "Month DD, YYYY".
// Falls back to the original static date string when no timestamp is present
// (first-run state before the admin has saved the disclosure row).
const FALLBACK_DATE = 'February 28, 2026';

const formatUpdatedAt = (iso) => {
  if (!iso) return FALLBACK_DATE;
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year:  'numeric',
      month: 'long',
      day:   'numeric',
    });
  } catch {
    return FALLBACK_DATE;
  }
};

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
   TERMS OF SERVICE MODAL

   Props
   ─────
   onClose    () => void   — closes the modal
   updatedAt  string|null  — ISO timestamp from disclosures.updated_at
                             (pass disclosure?.updated_at from the parent).
                             When null/undefined the fallback date is shown.
───────────────────────────────────────────────────────────── */
const TermsModal = ({ onClose, updatedAt }) => (
  <ModalShell
    onClose={onClose}
    iconClass="yellow"
    iconSvg={
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
          stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    }
    title="Terms of Service"
    subtitle={`Last Updated: ${formatUpdatedAt(updatedAt)}`}
  >
    <div className="ab-modal-inner">
      {TOS_SECTIONS.map((sec, i) => (
        <div key={i}>
          <p className="ab-modal-sec-title">{sec.title}</p>
          <p className="ab-modal-sec-body">{sec.body}</p>
        </div>
      ))}
    </div>
  </ModalShell>
);

export default TermsModal;