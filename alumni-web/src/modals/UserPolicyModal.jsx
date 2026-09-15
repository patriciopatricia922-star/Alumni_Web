// modals/UserPolicyModal.jsx
// ============================================================================
// [policy-modal-extract] Single reusable user-side Terms of Service / Privacy
// Policy modal, replacing three previously-duplicated implementations:
//   - AboutView.jsx's inline `TosModal` / `PrivacyModal`
//   - the standalone `modals/Termsmodal.jsx` / `modals/Privacypolicymodal.jsx`
//     (used by IDRegistrationview.jsx)
//
// Root-cause fix: all three previous implementations rendered a hardcoded
// TOS_SECTIONS/PRIVACY_SECTIONS array for the body, while only the
// "Last Updated" subtitle actually read from the live `disclosure` row
// (via useDisclosure()). That's why the date updated but the content never
// did. This component renders `disclosure.tos_content` / `pp_content`
// directly — the same rich-text HTML the admin's policy editor
// (admin/modals/DisclosureModal.jsx) writes to the `disclosures` table —
// so body and date always come from the same source going forward.
//
// `disclosure.tos_content`/`pp_content` is HTML authored by an admin-only
// rich-text editor (contentEditable in DisclosureModal.jsx), not arbitrary
// user input, so rendering it via dangerouslySetInnerHTML carries the same
// trust boundary the admin editor already relies on elsewhere in the app.
//
// Placement/positioning ownership is intentionally NOT this component's
// job: it only owns the modal's own UI (shell, content, Last Updated,
// close). The parent (About / AlumnAI ID Registration) still fully
// controls when/whether it renders — same principle already used for
// NotificationBell.
//
// Visual fidelity: the two previous implementations differed slightly in
// header icon (image asset in About vs. inline SVG in ID Registration) and
// close-button icon size (25px in About vs. 14px in ID Registration/shared
// modals). Rather than force one look onto the other, both are exposed as
// props with defaults that match the more common (ID Registration/shared)
// version, so About can override to stay pixel-identical to what it
// already rendered.
// ============================================================================

import React from 'react';

/* ─────────────────────────────────────────────────────────────
   FALLBACK CONTENT — first-run only (before an admin has ever saved the
   `disclosures` row, i.e. `disclosure` is null). Mirrors the same
   DEFAULT_TOS/DEFAULT_PP text already used as the admin editor's own
   fallback (admin/modals/DisclosureModal.jsx), redeclared locally here so
   this user-facing component doesn't reach across into admin-only code
   for it. Once an admin saves the row even once, this is never used again.
───────────────────────────────────────────────────────────── */
const FALLBACK_TOS_HTML = `<h3>TERMS OF SERVICE</h3>
<p><strong>1. Acceptance of Terms</strong><br/>By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.</p>
<p><strong>2. Purpose of the Platform</strong><br/>AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.</p>
<p><strong>3. User Responsibilities</strong><br/>Provide accurate and truthful information. Use the platform only for lawful and appropriate purposes. Keep your login credentials secure and confidential. Refrain from activities that may disrupt or harm the platform.</p>
<p><strong>4. Data Use and Accuracy</strong><br/>The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.</p>
<p><strong>5. Availability and Updates</strong><br/>The institution may modify, update, or discontinue platform features at any time without prior notice.</p>
<p><strong>6. Limitation of Liability</strong><br/>AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.</p>
<p><strong>7. Changes to the Terms</strong><br/>We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.</p>`;

const FALLBACK_PP_HTML = `<h3>PRIVACY POLICY</h3>
<p><strong>1. Information We Collect</strong><br/>We may collect: Personal Information (Name, Contact Details, Demographic info), Educational Data (Program, Year Graduated, Academic Records), Employment Information (Job Details, Career Progress), and Usage Data (Device Information, Logs, Interactions).</p>
<p><strong>2. How We Use Your Information</strong><br/>Information may be used to maintain and improve alumni records, analyze graduate outcomes, provide personalized alumni services, and enhance alumni engagement.</p>
<p><strong>3. Data Sharing</strong><br/>We do not sell personal data. Information may only be shared with internal university offices for legitimate purposes, or third-party service providers under strict confidentiality agreements.</p>
<p><strong>4. Data Security</strong><br/>We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.</p>
<p><strong>5. User Rights</strong><br/>You have the right to access a copy of your personal data and update or correct inaccurate information.</p>
<p><strong>6. Cookies and Tracking</strong><br/>The platform may use cookies or similar technologies to improve functionality and user experience.</p>
<p><strong>7. Data Retention</strong><br/>Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.</p>
<p><strong>8. Third-Party Links</strong><br/>AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.</p>
<p><strong>9. Updates to the Policy</strong><br/>We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.</p>`;

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const FALLBACK_DATE = 'February 28, 2026';

const formatUpdatedAt = (iso) => {
  if (!iso) return FALLBACK_DATE;
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return FALLBACK_DATE;
  }
};

// Default close (X) icon — matches the icon previously used by the shared
// modals/Termsmodal.jsx & modals/Privacypolicymodal.jsx (ID Registration).
const DefaultCloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   USER POLICY MODAL

   Props
   ─────
   type        'tos' | 'privacy'          — which document to render
   disclosure  { tos_content, pp_content, updated_at } | null | undefined
               — pass straight through from useDisclosure(); null/undefined
               is treated as "no admin save yet" and falls back to the
               static defaults above.
   onClose     () => void                 — closes the modal
   headerIcon  ReactNode                  — required. The icon rendered
               inside the header's colored circle. Kept as a prop (rather
               than owned by this component) so each existing caller can
               pass its own exact pre-existing markup (an <img> in About,
               inline <svg> paths in ID Registration) with zero visual
               change.
   closeIcon   ReactNode                  — optional override for the
               close-button icon; defaults to the 14px X used previously
               by the shared modals/ implementation.
───────────────────────────────────────────────────────────── */
const UserPolicyModal = ({ type, disclosure, onClose, headerIcon, closeIcon }) => {
  const isTos = type === 'tos';
  const iconClass = isTos ? 'yellow' : 'red';
  const title = isTos ? 'Terms of Service' : 'Privacy Policy';

  const rawContent = isTos ? disclosure?.tos_content : disclosure?.pp_content;
  const hasContent = rawContent !== null && rawContent !== undefined && String(rawContent).trim() !== '';
  const html = hasContent ? rawContent : (isTos ? FALLBACK_TOS_HTML : FALLBACK_PP_HTML);

  return (
    <div
      className="ab-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ab-modal" role="dialog" aria-modal="true">
        <div className="ab-modal-hdr">
          <div className={`ab-modal-hdr-icon ${iconClass}`}>{headerIcon}</div>
          <div className="ab-modal-hdr-txt">
            <p className="ab-modal-hdr-title">{title}</p>
            <p className="ab-modal-hdr-sub">{`Last Updated: ${formatUpdatedAt(disclosure?.updated_at)}`}</p>
          </div>
          <button className="ab-modal-close" onClick={onClose} aria-label="Close">
            {closeIcon || <DefaultCloseIcon />}
          </button>
        </div>
        <div className="ab-modal-body">
          {/* [policy-html] Renders the admin-authored rich-text HTML
             directly (h3/p/strong/br), styled via the additive
             .ab-policy-html rules in About.css so it visually matches the
             previous hardcoded section-title/section-body layout. */}
          <div
            className="ab-modal-inner ab-policy-html"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserPolicyModal;