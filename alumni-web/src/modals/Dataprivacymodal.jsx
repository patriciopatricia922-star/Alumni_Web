/**
DataPrivacyModal.jsx
Standalone, reusable Data Privacy Act acknowledgment component.
Shown once per user before their first tracer survey submission.
Props:
onAccept  — () => void   Called when the user clicks "I Agree & Continue"
onDecline — () => void   Called when the user clicks "Cancel" (optional)
isLoading — boolean      Show skeleton state while parent resolves auth/survey state
*/
import React, { useState, useEffect } from 'react';
/* ─── Google Fonts: Montserrat ──────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.querySelector('#montserrat-font')) {
const link = document.createElement('link');
link.id   = 'montserrat-font';
link.rel  = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap';
document.head.appendChild(link);
}
/* ─── Injected global styles (media queries, scrollbar, keyframes) ───────────
We inject once so the component stays self-contained without a CSS file.    */
const STYLE_ID = 'dpa-modal-styles';
if (typeof document !== 'undefined' && !document.querySelector(`#${STYLE_ID}`)) {
const style = document.createElement('style');
style.id = STYLE_ID;
style.textContent = `
@keyframes dpa-fadeIn {
from { opacity: 0; transform: translateY(18px) scale(0.985); }
to   { opacity: 1; transform: translateY(0)    scale(1);     }
}
@keyframes dpa-overlayIn {
from { opacity: 0; }
to   { opacity: 1; }
}
@keyframes dpa-shimmer {
0%   { background-position: -700px 0; }
100% { background-position:  700px 0; }
}
@keyframes dpa-pulse {
0%, 100% { opacity: 1; }
50%       { opacity: 0.55; }
}
.dpa-overlay {
   position: fixed;
   inset: 0;
   z-index: 9000;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: clamp(16px, 4vw, 40px);
   background: rgba(10, 20, 60, 0.55);
   backdrop-filter: blur(6px);
   -webkit-backdrop-filter: blur(6px);
   animation: dpa-overlayIn 0.25s ease both;
   box-sizing: border-box;
 }
 .dpa-card {
   background: #ffffff;
   border-radius: 20px;
   box-shadow: 0px 8px 40px rgba(0, 0, 0, 0.14), 0px 2px 8px rgba(0, 0, 0, 0.06);
   width: 100%;
   max-width: 560px;
   max-height: 90vh;
   display: flex;
   flex-direction: column;
   animation: dpa-fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
   overflow: hidden;
   font-family: 'Montserrat', Helvetica, Arial, sans-serif;
 }
 /* Card header */
 .dpa-header {
   padding: clamp(24px, 4vw, 36px) clamp(24px, 5vw, 40px) 0;
   flex-shrink: 0;
   /* Added alignment properties to center header content */
   display: flex;
   flex-direction: column;
   align-items: center;
   text-align: center;
 }
 .dpa-icon-wrap {
   width: 64px;
   height: 64px;
   border-radius: 50%;
   background: #dbeafe;
   display: flex;
   align-items: center;
   justify-content: center;
   margin-bottom: 18px;
 }
 .dpa-title {
   font-size: clamp(20px, 3vw, 26px);
   font-weight: 800;
   color: #1e3a5f;
   letter-spacing: -0.5px;
   margin: 0 0 6px 0;
   line-height: 1.2;
 }
 .dpa-subtitle {
   font-size: clamp(12px, 1.5vw, 13px);
   color: #64748b;
   margin: 0;
   font-weight: 500;
 }
 /* Scrollable body */
 .dpa-body {
   padding: 20px clamp(24px, 5vw, 40px);
   overflow-y: auto;
   flex: 1;
   -webkit-overflow-scrolling: touch;
 }
 .dpa-body::-webkit-scrollbar {
   width: 4px;
 }
 .dpa-body::-webkit-scrollbar-track {
   background: #f1f5f9;
   border-radius: 4px;
 }
 .dpa-body::-webkit-scrollbar-thumb {
   background: #cbd5e1;
   border-radius: 4px;
 }
 .dpa-divider {
   height: 1px;
   background: #e2e8f0;
   margin: 0 0 16px 0;
   flex-shrink: 0;
 }
 .dpa-body p {
   font-size: clamp(12.5px, 1.6vw, 13.5px);
   color: #4a5565;
   line-height: 1.75;
   margin: 0 0 14px 0;
 }
 .dpa-body ul {
   margin: 0 0 14px 0;
   padding-left: 0;
   list-style: none;
   display: flex;
   flex-direction: column;
   gap: 8px;
 }
 .dpa-body ul li {
   font-size: clamp(12.5px, 1.6vw, 13.5px);
   color: #4a5565;
   line-height: 1.65;
   display: flex;
   align-items: flex-start;
   gap: 10px;
 }
 .dpa-bullet-dot {
   width: 7px;
   height: 7px;
   border-radius: 50%;
   background: #003ea6;
   flex-shrink: 0;
   margin-top: 7px;
 }
 .dpa-email-link {
   color: #003ea6;
   font-weight: 600;
   text-decoration: none;
 }
 .dpa-email-link:hover {
   text-decoration: underline;
 }
 /* Checkbox row */
 .dpa-checkbox-row {
   display: flex;
   align-items: flex-start;
   gap: 10px;
   padding: 14px clamp(24px, 5vw, 40px);
   background: #f8faff;
   border-top: 1px solid #e2e8f0;
   flex-shrink: 0;
 }
 .dpa-checkbox {
   width: 18px;
   height: 18px;
   border: 2px solid #003ea6;
   border-radius: 5px;
   flex-shrink: 0;
   cursor: pointer;
   accent-color: #003ea6;
   margin-top: 1px;
 }
 .dpa-checkbox-label {
   font-size: clamp(12px, 1.5vw, 13px);
   color: #334155;
   font-weight: 500;
   cursor: pointer;
   line-height: 1.5;
   user-select: none;
 }
 /* Footer buttons */
 .dpa-footer {
   padding: 16px clamp(24px, 5vw, 40px) clamp(24px, 4vw, 32px);
   display: flex;
   flex-direction: column;
   gap: 10px;
   flex-shrink: 0;
 }
 .dpa-btn-primary {
   width: 100%;
   padding: 14px;
   background: #003ea6;
   border: none;
   border-radius: 10px;
   color: #ffffff;
   font-family: 'Montserrat', Helvetica, Arial, sans-serif;
   font-size: clamp(13px, 1.6vw, 15px);
   font-weight: 700;
   cursor: pointer;
   transition: opacity 0.15s, background 0.15s;
   box-shadow: 0px 4px 6px -4px rgba(0,0,0,0.12), 0px 10px 15px -3px rgba(0,0,0,0.08);
 }
 .dpa-btn-primary:disabled {
   background: #a5b4d1;
   cursor: not-allowed;
   box-shadow: none;
 }
 .dpa-btn-primary:not(:disabled):hover {
   opacity: 0.88;
 }
 .dpa-btn-secondary {
   width: 100%;
   padding: 14px;
   background: transparent;
   border: 1.5px solid #003ea6;
   border-radius: 10px;
   color: #003ea6;
   font-family: 'Montserrat', Helvetica, Arial, sans-serif;
   font-size: clamp(13px, 1.6vw, 15px);
   font-weight: 700;
   cursor: pointer;
   transition: background 0.15s, color 0.15s;
 }
 .dpa-btn-secondary:hover {
   background: #003ea6;
   color: #ffffff;
 }
 /* ── Skeleton ───────────────────────────────────────────────────────── */
 .dpa-skeleton-line {
   border-radius: 6px;
   background: linear-gradient(90deg, #e8edf5 25%, #d1d9ea 50%, #e8edf5 75%);
   background-size: 700px 100%;
   animation: dpa-shimmer 1.4s infinite linear;
 }
 /* ── Small mobile adjustments ───────────────────────────────────────── */
 @media (max-width: 400px) {
   .dpa-card {
     border-radius: 16px;
     max-height: 95vh;
   }
   .dpa-icon-wrap {
     width: 52px;
     height: 52px;
   }
 }
 /* ── 4K / large screens ─────────────────────────────────────────────── */
 @media (min-width: 2560px) {
   .dpa-card {
     max-width: 680px;
     border-radius: 24px;
   }
 }
`;
document.head.appendChild(style);
}
/* ─── Skeleton placeholder ───────────────────────────────────────────────── */
const SkeletonCard = () => (
<div className="dpa-overlay">
 <div className="dpa-card" style={{ animation: 'none' }}>
 <div className="dpa-header">
{/* icon */}
 <div className="dpa-skeleton-line" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 18 }} />
{/* title */}
 <div className="dpa-skeleton-line" style={{ height: 28, width: '55%', marginBottom: 10 }} />
{/* subtitle */}
 <div className="dpa-skeleton-line" style={{ height: 14, width: '75%', marginBottom: 20 }} />
 </div>
 <div className="dpa-divider" />
 <div className="dpa-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
{[100, 92, 85, 95, 78, 88, 70].map((w, i) => (
 <div key={i} className="dpa-skeleton-line" style={{ height: 13, width: `${w}%` }} />
))}
 </div>
 <div className="dpa-footer" style={{ paddingTop: 16 }}>
 <div className="dpa-skeleton-line" style={{ height: 48, borderRadius: 10 }} />
 <div className="dpa-skeleton-line" style={{ height: 48, borderRadius: 10, opacity: 0.6 }} />
 </div>
 </div>
</div>
);
/* ─── Main component ─────────────────────────────────────────────────────── */
const DataPrivacyModal = ({ onAccept, onDecline, isLoading = false }) => {
const [checked, setChecked] = useState(false);
// Prevent background scroll while modal is open
useEffect(() => {
const prev = document.body.style.overflow;
document.body.style.overflow = 'hidden';
return () => { document.body.style.overflow = prev; };
}, []);
if (isLoading) return <SkeletonCard />;
const bulletItems = [
'Evaluating and improving our academic programs and services',
'Fulfilling reporting and compliance requirements',
'Strengthening alumni engagement and linkages with industries',
'Supporting institutional research and documentation',
];
return (
<div className="dpa-overlay" role="dialog" aria-modal="true" aria-labelledby="dpa-title">
  <div className="dpa-card">
     {/* ── Header ─────────────────────────────────────────────────── */}
     <div className="dpa-header">
       <div className="dpa-icon-wrap" aria-hidden="true">
         {/* Shield / privacy icon - Fixed geometry and centering */}
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           {/* Symmetrical Shield Path */}
           <path 
             d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z" 
             stroke="#003ea6" 
             strokeWidth="1.5" 
             strokeLinecap="round" 
             strokeLinejoin="round"
           />
           {/* Perfectly Centered Checkmark */}
           <path 
             d="M9 12L11 14L15 10" 
             stroke="#003ea6" 
             strokeWidth="1.5" 
             strokeLinecap="round" 
             strokeLinejoin="round"
           />
         </svg>
       </div>
       <h2 className="dpa-title" id="dpa-title">Data Privacy Act</h2>
       <p className="dpa-subtitle">Please read carefully before proceeding</p>
     </div>
     <div className="dpa-divider" style={{ margin: '16px 0 0 0' }} />
     {/* ── Scrollable body ────────────────────────────────────────── */}
     <div className="dpa-body">
       <p>
         We value your privacy and are committed to protecting your personal data.
         In conducting this Alumni Tracer Study, we may collect basic information
         such as your name, contact details, graduation details, and employment status.
         This information will be used solely for the purposes of:
       </p>
       <ul>
         {bulletItems.map((item, i) => (
           <li key={i}>
             <span className="dpa-bullet-dot" aria-hidden="true" />
             <span>{item}</span>
           </li>
         ))}
       </ul>
       <p>
         We will take all reasonable precautions to safeguard your personal data from
         loss, misuse, and unauthorized processing, ensuring its confidentiality and
         security. Your information will not be disclosed, shared, or transferred to
         any third party without your consent.
       </p>
       <p>
         Unless you agree to allow us to retain your personal data for ongoing alumni
         engagement purposes, your data will be used for research, analysis, reporting,
         and documentation. We respect your rights under applicable data protection laws.
       </p>
       <p>
         Should you wish to exercise your rights or raise any concerns regarding the
         processing of your personal data, you may contact us at{' '}
         <a
           className="dpa-email-link"
           href="mailto:nudaao@nu-dasma.edu.ph"
           target="_blank"
           rel="noreferrer"
         >
           nudaao@nu-dasma.edu.ph
         </a>.
         Thank you for your trust and participation.
       </p>
     </div>
     {/* ── Checkbox acknowledgment ────────────────────────────────── */}
     <div className="dpa-checkbox-row">
       <input
         id="dpa-agree-checkbox"
         type="checkbox"
         className="dpa-checkbox"
         checked={checked}
         onChange={e => setChecked(e.target.checked)}
         aria-required="true"
       />
       <label htmlFor="dpa-agree-checkbox" className="dpa-checkbox-label">
         I have read and understood the Data Privacy Notice above and consent
         to the collection and processing of my personal data.
       </label>
     </div>
     {/* ── Footer buttons ─────────────────────────────────────────── */}
     <div className="dpa-footer">
       <button
         className="dpa-btn-primary"
         onClick={onAccept}
         disabled={!checked}
         aria-disabled={!checked}
       >
         I Agree &amp; Continue
       </button>
       {onDecline && (
         <button className="dpa-btn-secondary" onClick={onDecline}>
           Cancel
         </button>
       )}
     </div>
   </div>
 </div>
);
};
export default DataPrivacyModal;