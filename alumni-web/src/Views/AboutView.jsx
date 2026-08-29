import React, { useState } from "react";
import "../styles/About.css";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/notifications/NotificationBell";
import "../styles/NotificationBell.css";
import FooterLogo from "../assets/footer_logo.png";
import TargetIcon from "../assets/target_icn.png";
import MagnifyIcon from "../assets/magnifying_icn.png";
import MessageIcon from "../assets/message_icn.svg";
import PaperIcon from "../assets/paper_icn.svg";
import ProtectIcon from "../assets/protect_icn.svg";
import Missionicon from "../assets/mission_icn.svg";
import useDisclosure from "../hooks/Usedisclosure";

/* ─────────────────────────────────────────────────────────────
   MISSION / VISION MODAL ICONS
   [mv-redesign] Inline SVG icons used only inside the redesigned
   Mission/Vision modal bodies below. No new asset files or
   dependencies are introduced.
───────────────────────────────────────────────────────────── */
const IconGradCap = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M6 10.5V16c0 1.3 2.7 3 6 3s6-1.7 6-3v-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IconBriefcase = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="3" y="7.5" width="18" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 7.5V6a2 2 0 012-2h4a2 2 0 012 2v1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12.5h18" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);
const IconRibbon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M9 13l-2 8 5-3 5 3-2-8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);
const IconHandshake = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M2 12l4-4 4 3 3-2 2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11l3-2 5 4-3.5 3.5a2 2 0 01-2.8 0L11 13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 14.5L11 17a1.7 1.7 0 002.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCommunity = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="8.5" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="16" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M2.5 19c.5-3.3 2.9-5.3 6-5.3s5.5 2 6 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M14.7 14.2c2.4.2 4.2 2 4.6 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const IconQuote = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7.5 6C4.5 7.6 3 10 3 12.8c0 2.3 1.4 3.9 3.4 3.9 1.7 0 3-1.3 3-3 0-1.6-1.1-2.8-2.6-2.9.4-1.6 1.6-3 3.3-3.9L7.5 6zm9 0c-3 1.6-4.5 4-4.5 6.8 0 2.3 1.4 3.9 3.4 3.9 1.7 0 3-1.3 3-3 0-1.6-1.1-2.8-2.6-2.9.4-1.6 1.6-3 3.3-3.9L16.5 6z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   STATIC CONTENT (migrated from the former separate-page routes)
───────────────────────────────────────────────────────────── */
const MISSION_TEXT = `Guided by the core values and characterized by our cultural heritage of Dynamic Filipinism, National University is committed to providing relevant, innovative, and accessible quality education and other development programs.

We are committed to our:

STUDENTS, by molding them into ethical, spiritual, and responsible citizens.

FACULTY and EMPLOYEES, by enhancing their competencies, cultivating their commitment, and providing a just and fulfilling work environment.

ALUMNI, by instilling in them a sense of pride, commitment, and loyalty to their alma mater.

INDUSTRY PARTNERS and EMPLOYERS, by providing them Nationalians who will contribute to their growth and development.

COMMUNITY by contributing to the improvement of life's conditions`;

const VISION_TEXT =
  "We are National University, a dynamic private institution committed to nation building, recognized internationally in teaching and research.";

const TOS_SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.",
  },
  {
    title: "2. Purpose of the Platform",
    body: "AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.",
  },
  {
    title: "3. User Responsibilities",
    body: "• Provide accurate and truthful information.\n• Use the platform only for lawful and appropriate purposes.\n• Keep your login credentials secure and confidential.\n• Refrain from activities that may disrupt or harm the platform.",
  },
  {
    title: "4. Data Use and Accuracy",
    body: "The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.",
  },
  {
    title: "5. Availability and Updates",
    body: "The institution may modify, update, or discontinue platform features at any time without prior notice.",
  },
  {
    title: "6. Limitation of Liability",
    body: 'AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.',
  },
  {
    title: "7. Changes to the Terms",
    body: "We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes via platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.",
  },
];

const PRIVACY_SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We may collect the following types of information:\n• Personal Information: Name, Contact Details, Demographic info.\n• Educational Data: Program, Year Graduated, Academic Records (when applicable).\n• Employment Information: Job Details, Career Progress, and Related Survey Responses.\n• Usage Data: Device Information, Logs, and Interactions with the platform.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Information collected through AlumnAI may be used to:\n• Maintain and improve alumni records.\n• Analyze graduate outcomes and employment trends.\n• Provide personalized alumni services, opportunities, and notifications.\n• Enhance the overall alumni engagement experience.",
  },
  {
    title: "3. Data Sharing",
    body: "We do not sell personal data. Information may only be shared with:\n• Internal university offices for legitimate academic or administrative purposes.\n• Third-party service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements.",
  },
  {
    title: "4. Data Security",
    body: "We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.",
  },
  {
    title: "5. User Rights",
    body: "You have the right to:\n• Access a copy of your personal data.\n• Update or correct inaccurate information.",
  },
  {
    title: "6. Cookies and Tracking",
    body: "The platform may use cookies or similar technologies to improve functionality and user experience.",
  },
  {
    title: "7. Data Retention",
    body: "Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.",
  },
  {
    title: "8. Third-Party Links",
    body: "AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.",
  },
  {
    title: "9. Updates to the Policy",
    body: "We reserve the right to modify these Privacy Policy at any time. We will notify users of any material changes via platform notification. Continued use of the platform after changes constitutes acceptance of the new policy.",
  },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
   [disclosure-sync] Shared date formatter used by TosModal and PrivacyModal.
───────────────────────────────────────────────────────────── */
const FALLBACK_DATE = "February 28, 2026";

const formatUpdatedAt = (iso) => {
  if (!iso) return FALLBACK_DATE;
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return FALLBACK_DATE;
  }
};

/* ─────────────────────────────────────────────────────────────
   SHARED MODAL SHELL (Dashboard-aligned)
───────────────────────────────────────────────────────────── */
const Modal = ({
  onClose,
  modalClass,
  iconClass,
  icon,
  iconAlt,
  title,
  subtitle,
  children,
}) => (
  <div
    className="ab-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
  >
    <div className={`ab-modal${modalClass ? ` ${modalClass}` : ""}`} role="dialog" aria-modal="true">
      <div className="ab-modal-hdr">
        <div className={`ab-modal-hdr-icon ${iconClass}`}>
          <img src={icon} alt={iconAlt} />
        </div>
        <div className="ab-modal-hdr-txt">
          <p className="ab-modal-hdr-title">{title}</p>
          {subtitle && <p className="ab-modal-hdr-sub">{subtitle}</p>}
        </div>
        <button className="ab-modal-close" onClick={onClose} aria-label="Close">
          <svg width="25" height="25" viewBox="0 0 18 18" fill="none">
            <path
              d="M14 4L4 14M4 4L14 14"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="ab-modal-body">{children}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MISSION MODAL
───────────────────────────────────────────────────────────── */
const MISSION_KEYWORDS = [
  "STUDENTS,",
  "FACULTY and EMPLOYEES,",
  "ALUMNI,",
  "INDUSTRY PARTNERS and EMPLOYERS,",
  "COMMUNITY",
];

/* [mv-redesign] Intro paragraph = the text before "We are committed to our:" */
const MISSION_INTRO = MISSION_TEXT.split("\n\n")[0];

/* [mv-redesign] Maps each existing MISSION_KEYWORDS entry to an icon for the redesigned list */
const MISSION_ICONS = {
  "STUDENTS,": IconGradCap,
  "FACULTY and EMPLOYEES,": IconBriefcase,
  "ALUMNI,": IconRibbon,
  "INDUSTRY PARTNERS and EMPLOYERS,": IconHandshake,
  "COMMUNITY": IconCommunity,
};

/* [mv-redesign] Derived from MISSION_TEXT + MISSION_KEYWORDS (both unchanged above) —
   builds the structured { label, text, icon } list for the redesigned rows */
const MISSION_COMMITMENTS = MISSION_TEXT.split("\n").reduce((acc, line) => {
  const matched = MISSION_KEYWORDS.find((k) => line.trim().startsWith(k));
  if (matched) {
    const rest = line.slice(line.indexOf(matched) + matched.length).trim();
    acc.push({
      label: matched.replace(/,$/, ""),
      text: rest,
      icon: MISSION_ICONS[matched],
    });
  }
  return acc;
}, []);

const MissionModal = ({ onClose }) => {
  return (
    <Modal
      onClose={onClose}
      modalClass="ab-modal--mv ab-modal--mission"
      iconClass="blue"
      icon={TargetIcon}
      iconAlt="Mission"
      title="Mission"
      subtitle="Our core purpose"
    >
      <div className="ab-mission-new">
        <p className="ab-mission-lead">{MISSION_INTRO}</p>

        <p className="ab-mission-eyebrow">We are committed to our</p>

        <div className="ab-commit-list">
          {MISSION_COMMITMENTS.map(({ label, text, icon: Icon }) => (
            <div className="ab-commit-row" key={label}>
              <div className="ab-commit-icon">
                <Icon />
              </div>
              <div className="ab-commit-txt">
                <p className="ab-commit-title">{label}</p>
                <p className="ab-commit-desc">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────
   VISION MODAL
───────────────────────────────────────────────────────────── */
const VisionModal = ({ onClose }) => (
  <Modal
    onClose={onClose}
    modalClass="ab-modal--mv"
    iconClass="blue"
    icon={MagnifyIcon}
    iconAlt="Vision"
    title="Vision"
    subtitle="What we aim to achieve"
  >
    <div className="ab-vision-quote">
      <IconQuote className="ab-vision-mark" />
      <p className="ab-vision-text">{VISION_TEXT}</p>
      <div className="ab-vision-rule" />
      <p className="ab-vision-attrib">National University — Dasmariñas</p>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   CONTACT SUPPORT MODAL
───────────────────────────────────────────────────────────── */
const ContactModal = ({ onClose }) => (
  <Modal
    onClose={onClose}
    iconClass="blue"
    icon={MessageIcon}
    iconAlt="Contact Support"
    title="Contact Support"
    subtitle="We're here to help"
  >
    <div className="ab-modal-inner">
      <p className="ab-contact-subtitle">Your Ways to Reach Us:</p>

      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="#2B72FB"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 6l-10 7L2 6"
              stroke="#2B72FB"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Email</p>
          <p className="ab-contact-row-value">nudaao@nu-dasma.edu.ph</p>
          <p className="ab-contact-row-hint">
            Response Time: Within 24–48 hours
          </p>
        </div>
      </div>

      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.02 2.1 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"
              stroke="#2B72FB"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Phone</p>
          <p className="ab-contact-row-value">(+63) 949-918-8036</p>
          <p className="ab-contact-row-hint">
            {"Monday–Friday, 8:30 AM – 5:30 PM\nSaturday, 8:30 AM – 12:30 PM"}
          </p>
        </div>
      </div>

      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
              stroke="#2B72FB"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="10" r="3" stroke="#2B72FB" strokeWidth="1.8" />
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Office Address</p>
          <p className="ab-contact-row-value">
            {
              "Alumni Affairs Office\nNational University – Dasmariñas\nGovernor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114, Philippines"
            }
          </p>
        </div>
      </div>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   TERMS OF SERVICE MODAL
   [disclosure-sync] Accepts updatedAt prop; subtitle rendered dynamically.
───────────────────────────────────────────────────────────── */
const TosModal = ({ onClose, updatedAt }) => (
  <Modal
    onClose={onClose}
    iconClass="yellow"
    icon={PaperIcon}
    iconAlt="Terms of Service"
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
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   PRIVACY POLICY MODAL
   [disclosure-sync] Accepts updatedAt prop; subtitle rendered dynamically.
───────────────────────────────────────────────────────────── */
const PrivacyModal = ({ onClose, updatedAt }) => (
  <Modal
    onClose={onClose}
    iconClass="red"
    icon={ProtectIcon}
    iconAlt="Privacy Policy"
    title="Privacy Policy"
    subtitle={`Last Updated: ${formatUpdatedAt(updatedAt)}`}
  >
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

/* ═══════════════════════════════════════════════════════════
MAIN VIEW (Dashboard-aligned layout)
[disclosure-sync] useDisclosure() fetched here; updatedAt flows to both TosModal and PrivacyModal via prop.
════════════════════════════════════════════════════════════ */
const AboutView = ({ isMobile, isTablet, links, navigate }) => {
  const [activeModal, setActiveModal] = useState(null);
  const openModal = (name) => setActiveModal(name);
  const closeModal = () => setActiveModal(null);

  const { disclosure } = useDisclosure();

  return (
    <>
      <div className="ab-root">
        <Sidebar />
        <div className="ab-main">
          {/* Reusable Notification Bell - Positioned via CSS override in About.css */}
          <NotificationBell
            onSeeAll={() => navigate("/notifications")}
            className={isMobile ? "mobile" : ""}
          />

          {/* Back Button */}
          <button className="ab-back" onClick={() => navigate(-1)}>
            <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
              <path
                d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
                stroke="#002263"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>

          {/* Page Header */}
          <div className="ab-hdr">
            <h1 className="ab-title">About</h1>
            <p className="ab-sub">
              Support and assistance for your alumni needs.
            </p>
          </div>

          {/* Hero Card */}
          <div className="ab-hero">
            <div className="ab-circ ab-c1" />
            <div className="ab-circ ab-c2" />
            <div className="ab-circ ab-c3" />
            <div className="ab-logo-row">
              <img src={FooterLogo} alt="AlumnAI" className="ab-logo" />
            </div>
            <p className="ab-desc">
              Connecting National University – Dasmariñas alumni through
              innovative technology and meaningful community engagement,
              fostering stronger relationships, continuous collaboration, and
              long-term professional growth within a dynamic and supportive
              alumni network.
            </p>
            <div className="ab-mv">
              <button
                className="ab-mv-card"
                onClick={() => openModal("mission")}
              >
                <div className="ab-mv-icon">
                  <img src={TargetIcon} alt="Mission" />
                </div>
                <div className="ab-mv-txt">
                  <p className="ab-mv-lbl">Mission</p>
                  <p className="ab-mv-slbl">Our core purpose</p>
                </div>
              </button>
              <button
                className="ab-mv-card"
                onClick={() => openModal("vision")}
              >
                <div className="ab-mv-icon">
                  <img src={MagnifyIcon} alt="Vision" />
                </div>
                <div className="ab-mv-txt">
                  <p className="ab-mv-lbl">Vision</p>
                  <p className="ab-mv-slbl">What we aim to achieve</p>
                </div>
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="ab-support">
            <h2 className="ab-s-title">Support &amp; Legal</h2>
            <div className="ab-s-grid">
              <button
                className="ab-tile blue"
                onClick={() => openModal("contact")}
              >
                <div className="ab-tile-icon blue">
                  <img src={MessageIcon} alt="" />
                </div>
                <div className="ab-tile-text">
                  <p className="ab-tile-name">Contact Support</p>
                  <p className="ab-tile-sub">Get help from our team</p>
                </div>
              </button>
              <button
                className="ab-tile yellow"
                onClick={() => openModal("tos")}
              >
                <div className="ab-tile-icon yellow">
                  <img src={PaperIcon} alt="" />
                </div>
                <div className="ab-tile-text">
                  <p className="ab-tile-name">Terms of Service</p>
                  <p className="ab-tile-sub">Read our guidelines</p>
                </div>
              </button>
              <button
                className="ab-tile red"
                onClick={() => openModal("privacy")}
              >
                <div className="ab-tile-icon red">
                  <img src={ProtectIcon} alt="" />
                </div>
                <div className="ab-tile-text">
                  <p className="ab-tile-name">Privacy Policy</p>
                  <p className="ab-tile-sub">Your data protection</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === "mission" && <MissionModal onClose={closeModal} />}
      {activeModal === "vision" && <VisionModal onClose={closeModal} />}
      {activeModal === "contact" && <ContactModal onClose={closeModal} />}
      {activeModal === "tos" && (
        <TosModal onClose={closeModal} updatedAt={disclosure?.updated_at} />
      )}
      {activeModal === "privacy" && (
        <PrivacyModal onClose={closeModal} updatedAt={disclosure?.updated_at} />
      )}
    </>
  );
};

export default AboutView;