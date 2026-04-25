import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlumnAILogo from '../assets/alumnai_logo_new.svg';
import TargetIcon  from '../assets/target_icn.png';
import MagnifyIcon from '../assets/magnifying_icn.png';
import MessageIcon from '../assets/message_icn.svg';
import PaperIcon   from '../assets/paper_icn.svg';
import ProtectIcon from '../assets/protect_icn.svg';
import RightArrow  from '../assets/right_arrow.svg';

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const T = {
  bg:          '#DAE5F1',
  sidebarW:    228,
  sidebarWtab: 200,
  heroGrad:    'linear-gradient(180deg,#2B72FB -11.25%,#1E2555 100%)',
  mvGrad:      'linear-gradient(180deg,#2B72FB 0%,#1E2555 97.78%)',
  mvIconBg:    'linear-gradient(180deg,rgba(30,37,85,.8) 0%,rgba(15,19,56,.8) 100%)',
};

/* ─────────────────────────────────────────────────────────────
   MODAL DATA
───────────────────────────────────────────────────────────── */
const TOS_SECTIONS = [
  { title: '1. Acceptance of Terms',     body: 'By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.' },
  { title: '2. Purpose of the Platform', body: 'AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.' },
  { title: '3. User Responsibilities',   body: 'Provide accurate and truthful information.\nUse the platform only for lawful and appropriate purposes.\nKeep your login credentials secure and confidential.\nRefrain from activities that may disrupt or harm the platform.' },
  { title: '4. Data Use and Accuracy',   body: 'The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.' },
  { title: '5. Availability and Updates', body: 'The institution may modify, update, or discontinue platform features at any time without prior notice.' },
  { title: '6. Limitation of Liability', body: 'AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.' },
  { title: '7. Changes to the Terms',    body: 'We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.' },
];

const PRIVACY_SECTIONS = [
  { title: '1. Information We Collect',      body: 'We may collect the following types of information:\n• Personal Information: Name, Contact Details, Demographic info.\n• Educational Data: Program, Year Graduated, Academic Records (when applicable).\n• Employment Information: Job Details, Career Progress, and Related Survey Responses.\n• Usage Data: Device Information, Logs, and Interactions with the Platform.' },
  { title: '2. How We Use Your Information', body: 'Information collected through AlumnAI may be used to:\n• Maintain and improve alumni records.\n• Analyze graduate outcomes and employment trends.\n• Provide personalized alumni services, opportunities, and notifications.\n• Enhance the overall alumni engagement experience.' },
  { title: '3. Data Sharing',                body: 'We do not sell personal data. Information may only be shared with:\n• Internal university offices for legitimate academic or administrative purposes.\n• Third-party service providers who help operate the platform (e.g., hosting, analytics) under strict confidentiality agreements.' },
  { title: '4. Data Security',               body: 'We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.' },
  { title: '5. User Rights',                 body: 'You have the right to:\n• Access a copy of your personal data.\n• Update or correct inaccurate information.' },
  { title: '6. Cookies and Tracking',        body: 'The platform may use cookies or similar technologies to improve functionality and user experience.' },
  { title: '7. Data Retention',              body: 'Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.' },
  { title: '8. Third-Party Links',           body: 'AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.' },
  { title: '9. Updates to the Policy',       body: 'We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.' },
  { title: '10. Contact Us',                 body: "For questions or requests regarding your data or privacy:\nEmail: nudaao@nu-dasma.edu.ph\nPhone: 09399151561 (Smart) / 09661381357 (Globe)\nLocation: Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114" },
];

/* ─────────────────────────────────────────────────────────────
   MISSION / VISION DATA
───────────────────────────────────────────────────────────── */
const MISSION_TEXT = `Guided by the core values and characterized by our cultural heritage of Dynamic Filipinism, National University is committed to providing relevant, innovative, and accessible quality education and other development programs.

We are committed to our:

STUDENTS, by molding them into ethical, spiritual and responsible citizens.

FACULTY and EMPLOYEES, by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.

ALUMNI, by instilling in them a sense of pride, commitment, and loyalty to their alma mater.

INDUSTRY PARTNERS and EMPLOYERS, by providing them Nationalians who will contribute to their growth and development.

COMMUNITY by contributing to the improvement of life's conditions`;

const VISION_TEXT = `We are National University, a dynamic private institution committed to nation building, recognized internationally in teaching and research.`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

.ab-root{
  display:flex;
  width:100vw;
  height:100vh;
  overflow:hidden;
  background:${T.bg};
  font-family:'Montserrat',sans-serif;
}

.ab-main{
  margin-left:${T.sidebarW}px;
  flex:1 1 0;
  min-width:0;
  height:100vh;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  padding:
    clamp(14px,2.4vh,37px)
    clamp(14px,3.6vw,51px)
    clamp(14px,2vh,28px)
    clamp(14px,3.6vw,51px);
}

/* ── notification bell ── */
.ab-bell{
  position:fixed;
  top:clamp(14px,2.4vh,37px);
  right:clamp(14px,3.6vw,51px);
  z-index:500;
}
.ab-bell-btn{
  width:46px;height:46px;
  border-radius:14px;
  background:rgba(0,62,166,.92);
  border:1.24px solid rgba(43,114,251,.5);
  box-shadow:0 10px 15px -3px rgba(0,0,0,.18);
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  position:relative;
  transition:background .15s;
}
.ab-bell-btn:hover{background:rgba(43,114,251,.85);}
.ab-badge{
  position:absolute;top:-6px;right:-6px;
  min-width:20px;height:20px;
  background:#FB2C36;border-radius:10px;
  border:2px solid #DAE5F1;
  display:flex;align-items:center;justify-content:center;
  padding:0 4px;pointer-events:none;
}
.ab-badge span{font-size:10px;font-weight:700;color:#fff;line-height:1;}

.ab-ndrop{
  position:absolute;top:54px;right:0;
  width:min(380px,90vw);max-height:520px;
  background:rgba(13,19,56,.97);backdrop-filter:blur(16px);
  border:1px solid rgba(255,255,255,.1);border-radius:16px;
  box-shadow:0 20px 60px rgba(0,0,0,.5);
  display:flex;flex-direction:column;overflow:hidden;z-index:600;
}
.ab-ndrop-list{overflow-y:auto;flex:1;padding:8px 0;}

/* ── back button ── */
.ab-back{
  display:inline-flex;align-items:center;gap:8px;
  background:none;border:none;cursor:pointer;padding:0;
  flex-shrink:0;margin-bottom:clamp(8px,1.2vh,14px);
}
.ab-back span{font-weight:400;font-size:clamp(13px,.95vw,15px);color:#002263;}

/* ── page heading ── */
.ab-hdr{flex-shrink:0;margin-bottom:clamp(10px,1.4vh,16px);}
.ab-title{
  font-weight:700;font-size:clamp(20px,2.8vw,40px);
  line-height:1.2;letter-spacing:-1px;color:#324D87;margin-bottom:3px;
}
.ab-sub{font-weight:400;font-size:clamp(11px,.95vw,15px);color:#545454;}

/* ── HERO CARD ── */
.ab-hero{
  background:${T.heroGrad};
  border-radius:24px;
  box-shadow:0 4px 4px rgba(0,0,0,.5);
  padding:clamp(16px,2vw,30px) clamp(16px,2.4vw,36px) clamp(14px,1.8vw,26px);
  position:relative;overflow:hidden;flex-shrink:0;
  margin-bottom:clamp(10px,1.4vh,18px);
  display:flex;flex-direction:column;gap:clamp(10px,1.4vh,18px);
}
.ab-hero::before{
  content:'';position:absolute;width:256px;height:256px;right:-60px;top:-128px;
  background:#2B72FB;opacity:.1;filter:blur(64px);border-radius:50%;pointer-events:none;
}
.ab-circ{position:absolute;border-radius:50%;background:rgba(217,217,217,.07);pointer-events:none;}
.ab-c1{width:200px;height:200px;left:61px;top:-100px;}
.ab-c2{width:257px;height:257px;right:-30px;top:50px;}
.ab-c3{width:150px;height:150px;left:249px;bottom:-60px;}

/* ── Logo row ── */
/* CHANGE 1: Logo scaled up. Increased clamp ceiling from 60px→90px and min from 40px→56px.
   The scale(1.4) transform adds visual presence while object-fit:contain prevents clipping.
   transform-origin:center ensures it scales symmetrically within the flex row. */
.ab-logo-row{
  display:flex;align-items:center;justify-content:center;
  position:relative;z-index:1;flex-shrink:0;
}
.ab-logo-row img{
  height:clamp(56px,6.4vh,90px);
  width:auto;
  object-fit:contain;
  filter:drop-shadow(0 6px 7px rgba(43,114,251,.7));
  /* Scale up the logo visually without altering surrounding layout */
  transform:scale(1.4);
  transform-origin:center center;
}

/* ── Description ── */
.ab-desc{
  font-weight:400;font-size:clamp(11px,1.15vw,18px);
  line-height:1.6;color:#fff;
  position:relative;z-index:1;flex-shrink:0;
}

/* ── Mission / Vision row ── */
/* CHANGE 2: Refined M/V cards — richer shadow, refined border, icon polish, arrow animation */
.ab-mv{
  display:grid;grid-template-columns:1fr 1fr;
  gap:clamp(8px,1vw,14px);position:relative;z-index:1;flex-shrink:0;
}
.ab-mv-card{
  background:${T.mvGrad};
  border:.889px solid rgba(255,255,255,.25);
  box-shadow:0 4px 16px rgba(0,0,0,.3),0 0 0 1px rgba(255,255,255,.05) inset;
  border-radius:16px;
  padding:clamp(12px,1.4vw,20px) clamp(10px,1.2vw,18px);
  cursor:pointer;
  transition:opacity .15s,transform .2s,box-shadow .2s;
  display:flex;align-items:center;
  gap:clamp(8px,1vw,14px);
}
.ab-mv-card:hover{
  opacity:.92;
  transform:translateY(-3px);
  box-shadow:0 8px 24px rgba(43,114,251,.4),0 0 0 1px rgba(255,255,255,.08) inset;
}

.ab-mv-icon{
  width:clamp(52px,5.6vw,88px);height:clamp(52px,5.6vw,88px);
  flex-shrink:0;
  background:${T.mvIconBg};
  box-shadow:0 10px 15px rgba(97,95,255,.5),0 4px 6px rgba(43,114,251,.15);
  border-radius:14px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
}
.ab-mv-icon img{
  width:90%;height:90%;object-fit:contain;
  filter:drop-shadow(0 4px 4px #2B72FB);
}

.ab-mv-txt{flex:1;min-width:0;}
.ab-mv-lbl{
  font-weight:700;font-size:clamp(13px,1.4vw,20px);
  line-height:1.3;color:#FFED97;margin-bottom:3px;
}
.ab-mv-slbl{
  font-weight:400;font-size:clamp(10px,1vw,15px);
  line-height:1.4;color:rgba(255,255,255,.85);
}
.ab-mv-div{
  width:1px;height:36px;
  background:rgba(255,255,255,.6);
  box-shadow:0 4px 10px rgba(255,255,255,.15);flex-shrink:0;
}
.ab-mv-arrow{
  width:clamp(10px,1.1vw,16px);height:clamp(10px,1.1vw,16px);
  flex-shrink:0;object-fit:contain;
  filter:brightness(0) invert(1);opacity:.9;
  transition:transform .2s ease;
}
.ab-mv-card:hover .ab-mv-arrow{transform:translateX(4px);}

/* ── SUPPORT & LEGAL CARD ── */
.ab-support{
  background:#fff;
  box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);
  border-radius:24px;
  padding:clamp(14px,2vw,28px) clamp(14px,2.2vw,32px) clamp(14px,2vw,28px);
  flex:1 1 0;min-height:0;
  display:flex;flex-direction:column;
}
.ab-s-title{
  font-weight:700;font-size:clamp(14px,1.6vw,22px);
  line-height:1.33;color:#324D87;flex-shrink:0;
  margin-bottom:clamp(10px,1.4vh,18px);
}
.ab-s-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:clamp(8px,1.1vw,16px);flex:1 1 0;min-height:0;align-items:stretch;
}
.ab-tile{
  border-radius:16px;border:none;cursor:pointer;font-family:'Montserrat',sans-serif;
  transition:opacity .15s,transform .15s,box-shadow .15s;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:clamp(6px,.8vh,10px);
  padding:clamp(10px,1.4vh,20px) clamp(8px,1vw,16px);
}
.ab-tile:hover{opacity:.88;transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.1);}
.ab-tile.blue  {background:linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%);}
.ab-tile.yellow{background:linear-gradient(135deg,#FFFCF0 0%,#FFF7D0 100%);}
.ab-tile.red   {background:linear-gradient(135deg,#FFDCDC 0%,#FFD4D4 100%);}

.ab-tile-icon{
  width:clamp(44px,4.8vw,64px);height:clamp(44px,4.8vw,64px);
  border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  transition:transform .15s;
}
.ab-tile:hover .ab-tile-icon{transform:scale(1.07);}
.ab-tile-icon img{width:55%;height:55%;object-fit:contain;}
.ab-tile-icon.blue  {background:linear-gradient(135deg,#2B7FFF 0%,#155DFC 100%);}
.ab-tile-icon.yellow{background:linear-gradient(135deg,#FFD400 0%,#F2D964 100%);}
.ab-tile-icon.red   {background:linear-gradient(135deg,#FB2C36 .31%,#E7000B 100.31%);}

.ab-tile-name{font-weight:700;font-size:clamp(12px,1.15vw,17px);line-height:1.3;color:#2D467C;text-align:center;}
.ab-tile-sub {font-weight:400;font-size:clamp(10px,.9vw,13px);line-height:1.4;color:#4A5565;text-align:center;}

/* ══════════════════════════════════════════
   CHANGE 3 & 4: MODAL STYLES
   - Overlay with backdrop-filter blur
   - Figma-aligned modal design
   - Scrollable body for ToS / Privacy
══════════════════════════════════════════ */
.ab-overlay{
  position:fixed;inset:0;z-index:800;
  display:flex;align-items:center;justify-content:center;
  padding:clamp(16px,3vw,48px);
  /* Background blur when modal is open */
  background:rgba(0,0,0,.45);
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  animation:ab-overlay-in .2s ease;
}
@keyframes ab-overlay-in{from{opacity:0}to{opacity:1}}

.ab-modal{
  background:#fff;
  border-radius:24px;
  box-shadow:0 25px 50px -12px rgba(0,0,0,.35);
  width:100%;
  max-width:min(660px,95vw);
  max-height:min(680px,90vh);
  display:flex;flex-direction:column;overflow:hidden;
  animation:ab-modal-in .22s ease;
}
@keyframes ab-modal-in{
  from{transform:translateY(18px);opacity:0}
  to  {transform:translateY(0);opacity:1}
}

/* Modal header — dark blue strip matching Figma */
.ab-modal-hdr{
  flex-shrink:0;
  background:#003EA6;
  border-radius:24px 24px 0 0;
  padding:clamp(14px,2vh,24px) clamp(18px,2.4vw,28px);
  display:flex;align-items:center;
  gap:clamp(10px,1.2vw,16px);
  position:relative;
}
.ab-modal-hdr-icon{
  width:clamp(38px,3.6vw,48px);height:clamp(38px,3.6vw,48px);
  border-radius:12px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.ab-modal-hdr-icon img{width:56%;height:56%;object-fit:contain;}
.ab-modal-hdr-icon.blue  {background:linear-gradient(135deg,#2B7FFF 0%,#155DFC 100%);}
.ab-modal-hdr-icon.yellow{background:linear-gradient(135deg,#FFD400 0%,#F2D964 100%);}
.ab-modal-hdr-icon.red   {background:linear-gradient(135deg,#FB2C36 .31%,#E7000B 100.31%);}

.ab-modal-hdr-txt{flex:1;min-width:0;}
.ab-modal-hdr-title{
  font-weight:700;font-size:clamp(15px,1.5vw,22px);
  color:#fff;line-height:1.3;
}
.ab-modal-hdr-sub{font-size:clamp(11px,.9vw,14px);color:rgba(255,255,255,.75);margin-top:2px;}

.ab-modal-close{
  position:absolute;
  top:clamp(10px,1.4vh,16px);right:clamp(12px,1.4vw,20px);
  width:34px;height:34px;border-radius:50%;
  background:none;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;
}
.ab-modal-close:hover{background:rgba(255,255,255,.18);}

/* Modal body — scrollable, styled inner box */
.ab-modal-body{
  flex:1 1 0;min-height:0;
  overflow-y:auto;
  padding:clamp(14px,2vh,24px) clamp(18px,2.4vw,32px) clamp(14px,2vh,24px);
  display:flex;flex-direction:column;
}
.ab-modal-body::-webkit-scrollbar{width:6px;}
.ab-modal-body::-webkit-scrollbar-track{background:rgba(21,93,252,.06);border-radius:10px;}
.ab-modal-body::-webkit-scrollbar-thumb{background:rgba(43,114,251,.3);border-radius:10px;}
.ab-modal-body::-webkit-scrollbar-thumb:hover{background:rgba(43,114,251,.55);}

/* Inner card (scrollable content) */
.ab-modal-inner{
  background:rgba(21,93,252,.06);
  border:.8px solid rgba(43,114,251,.15);
  border-radius:16px;
  padding:clamp(14px,2vh,22px) clamp(14px,1.8vw,24px);
  display:flex;flex-direction:column;
  gap:clamp(12px,1.4vh,18px);
  flex:1;
}

/* Section title in ToS / Privacy modal */
.ab-modal-sec-title{
  font-weight:700;font-size:clamp(12px,1.05vw,15px);
  color:#003EA6;margin-bottom:4px;
}
.ab-modal-sec-body{
  font-weight:400;font-size:clamp(12px,.95vw,14px);
  line-height:1.7;color:#1a2a4a;white-space:pre-line;
}

/* Contact modal rows */
.ab-contact-subtitle{
  font-weight:700;font-size:clamp(13px,1.1vw,16px);
  color:#003EA6;margin-bottom:clamp(6px,1vh,10px);
}
.ab-contact-row{
  display:flex;align-items:flex-start;
  gap:clamp(10px,1vw,14px);
  padding:clamp(10px,1.2vh,14px) clamp(12px,1.2vw,16px);
  background:rgba(0,62,166,.07);
  border:.8px solid rgba(43,114,251,.18);
  border-radius:12px;
  transition:background .15s;
}
.ab-contact-row:hover{background:rgba(0,62,166,.11);}
.ab-contact-row-icon{
  width:20px;height:20px;flex-shrink:0;margin-top:3px;
  display:flex;align-items:center;justify-content:center;
}
.ab-contact-row-label{
  font-weight:600;font-size:clamp(13px,1vw,15px);color:#002263;margin-bottom:3px;
}
.ab-contact-row-value{
  font-weight:400;font-size:clamp(12px,.92vw,14px);
  color:#364153;line-height:1.55;word-break:break-word;white-space:pre-line;
}
.ab-contact-row-hint{font-size:clamp(10px,.8vw,12px);color:#6A7282;margin-top:2px;}

/* Vision modal — larger text since content is short */
.ab-vision-body{
  font-weight:400;font-size:clamp(14px,1.3vw,18px);
  line-height:1.7;color:#1a2a4a;
}

/* Mission modal — preserve bold highlights */
.ab-mission-body{
  font-weight:400;font-size:clamp(12px,.98vw,15px);
  line-height:1.75;color:#1a2a4a;white-space:pre-line;
}

/* ══════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
══════════════════════════════════════════ */
@media(max-width:1023px){
  .ab-main{margin-left:${T.sidebarWtab}px;}
}
@media(max-width:767px){
  .ab-main{margin-left:0;padding:12px 12px 10px;}
  .ab-bell{top:12px;right:12px;}
  .ab-mv  {grid-template-columns:1fr;}
}
@media(max-width:479px){
  .ab-mv           {grid-template-columns:1fr;}
  .ab-s-grid       {grid-template-columns:1fr;}
  .ab-tile         {flex-direction:row;justify-content:flex-start;gap:12px;padding:12px 14px;}
  .ab-tile-name,
  .ab-tile-sub     {text-align:left;}
  .ab-overlay      {padding:8px;}
  .ab-modal        {border-radius:16px;}
}
`;

/* ── Notification row ── */
const NItem = ({ n, markOneRead, formatTime }) => (
  <div
    onClick={() => markOneRead(n.id)}
    style={{
      display:'flex',alignItems:'flex-start',gap:'12px',
      padding:'10px 18px',
      background: n.read ? 'transparent' : 'rgba(43,114,251,.07)',
      cursor:'pointer',transition:'background .12s',
      borderLeft: n.read ? '3px solid transparent' : '3px solid #2B72FB',
    }}
    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
    onMouseLeave={e=>e.currentTarget.style.background=n.read?'transparent':'rgba(43,114,251,.07)'}
  >
    <div style={{width:38,height:38,borderRadius:'50%',background:'rgba(43,114,251,.15)',border:'1px solid rgba(43,114,251,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/>
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

/* ── Shared Modal Shell ── */
const Modal = ({ onClose, iconClass, icon, iconAlt, title, subtitle, children }) => (
  <div className="ab-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="ab-modal" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="ab-modal-hdr">
        <div className={`ab-modal-hdr-icon ${iconClass}`}>
          <img src={icon} alt={iconAlt}/>
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
      {/* Body */}
      <div className="ab-modal-body">
        {children}
      </div>
    </div>
  </div>
);

/* ── Contact Support Modal ── */
const ContactModal = ({ onClose, MessageIcon }) => (
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

      {/* Email */}
      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6l-10 7L2 6" stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Phone</p>
          <p className="ab-contact-row-value">0939-915-1561 (Smart) / 0966-138-1357 (Globe)</p>
          <p className="ab-contact-row-hint">Monday–Friday, 8:30 AM – 5:30 PM{'\n'}Saturday, 8:30 AM – 12:30 PM</p>
        </div>
      </div>

      {/* Address */}
      <div className="ab-contact-row">
        <div className="ab-contact-row-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#2B72FB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="#2B72FB" strokeWidth="1.8"/>
          </svg>
        </div>
        <div>
          <p className="ab-contact-row-label">Office Address</p>
          <p className="ab-contact-row-value">Alumni Affairs Office{'\n'}National University – Dasmariñas{'\n'}Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114, Philippines</p>
        </div>
      </div>
    </div>
  </Modal>
);

/* ── Terms of Service Modal ── */
const TosModal = ({ onClose, PaperIcon }) => (
  <Modal
    onClose={onClose}
    iconClass="yellow"
    icon={PaperIcon}
    iconAlt="Terms of Service"
    title="Terms of Service"
    subtitle="Last Updated: February 28, 2026"
  >
    {/* Scrollable inner box — no extra wrapper needed; .ab-modal-body already scrolls */}
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

/* ── Privacy Policy Modal ── */
const PrivacyModal = ({ onClose, ProtectIcon }) => (
  <Modal
    onClose={onClose}
    iconClass="red"
    icon={ProtectIcon}
    iconAlt="Privacy Policy"
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
  </Modal>
);

/* ── Mission Modal ── */
const MissionModal = ({ onClose, TargetIcon }) => (
  <Modal
    onClose={onClose}
    iconClass="blue"
    icon={TargetIcon}
    iconAlt="Mission"
    title="Mission"
    subtitle="Our core purpose"
  >
    <div className="ab-modal-inner">
      <p className="ab-mission-body">{MISSION_TEXT}</p>
    </div>
  </Modal>
);

/* ── Vision Modal ── */
const VisionModal = ({ onClose, MagnifyIcon }) => (
  <Modal
    onClose={onClose}
    iconClass="blue"
    icon={MagnifyIcon}
    iconAlt="Vision"
    title="Vision"
    subtitle="What we aim to achieve"
  >
    <div className="ab-modal-inner">
      <p className="ab-vision-body">{VISION_TEXT}</p>
    </div>
  </Modal>
);

/* ════════════════════════════════════════════════════
   MAIN VIEW COMPONENT
════════════════════════════════════════════════════ */
const AboutView = ({
  isMobile, isTablet,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  // CHANGE 3: Modal state — null = closed, 'contact'|'tos'|'privacy'|'mission'|'vision' = open
  const [activeModal, setActiveModal] = useState(null);
  const openModal  = (name) => setActiveModal(name);
  const closeModal = ()     => setActiveModal(null);

  return (
    <>
      <style>{CSS}</style>

      <div className="ab-root">
        <Sidebar />

        <div className="ab-main">

          {/* ── Bell ─────────────────────────────── */}
          <div ref={bellRef} className="ab-bell">
            <button className="ab-bell-btn" onClick={()=>setShowDropdown(v=>!v)}>
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
                  {unreadCount>0 &&
                    <button onClick={markAllRead} style={{background:'none',border:'none',fontFamily:'Montserrat',fontSize:12,color:'#2B72FB',cursor:'pointer',padding:0}}>
                      Mark all read
                    </button>}
                </div>
                <div style={{display:'flex',padding:'10px 18px 0',gap:4,flexShrink:0}}>
                  {['all','unread'].map(t=>(
                    <button key={t} onClick={()=>setNotifTab(t)} style={{
                      height:32,padding:'0 16px',
                      background:notifTab===t?'#2B72FB':'transparent',
                      border:notifTab===t?'none':'1px solid rgba(255,255,255,.12)',
                      borderRadius:20,cursor:'pointer',
                      fontFamily:'Montserrat',fontSize:13,
                      fontWeight:notifTab===t?700:400,
                      color:'#fff',transition:'all .15s',textTransform:'capitalize',
                    }}>
                      {t==='all'?'All':`Unread${unreadCount>0?` (${unreadCount})`:''}`}
                    </button>
                  ))}
                </div>
                <div className="ab-ndrop-list">
                  {(()=>{
                    const list = notifTab==='unread' ? notifs.filter(n=>!n.read) : notifs;
                    if(!list.length) return (
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:10}}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                          <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <p style={{fontFamily:'Montserrat',fontSize:13,color:'rgba(255,255,255,.3)',margin:0}}>
                          {notifTab==='unread'?'No unread notifications':'No notifications yet'}
                        </p>
                      </div>
                    );
                    return Object.entries(groupByDate(list)).map(([label,items])=>{
                      if(!items.length) return null;
                      return (
                        <div key={label}>
                          <p style={{fontFamily:'Montserrat',fontWeight:700,fontSize:11,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.8px',margin:'10px 18px 4px'}}>{label}</p>
                          {items.map(n=><NItem key={n.id} n={n} markOneRead={markOneRead} formatTime={formatTime}/>)}
                        </div>
                      );
                    });
                  })()}
                </div>
                <div style={{padding:'10px 18px',borderTop:'1px solid rgba(255,255,255,.07)',flexShrink:0}}>
                  <button
                    onClick={()=>{setShowDropdown(false);navigate('/notifications');}}
                    style={{width:'100%',height:36,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,fontFamily:'Montserrat',fontSize:13,color:'rgba(255,255,255,.7)',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.05)'}
                  >
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Back ─────────────────────────────── */}
          <button className="ab-back" onClick={()=>navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 17 17" fill="none">
              <path d="M13 8.5H2M2 8.5L7 3.5M2 7.5L7 13.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

            {/* CHANGE 1: Logo scaled up via CSS (.ab-logo-row img uses scale(1.4) + larger clamp) */}
            <div className="ab-logo-row">
              <img src={AlumnAILogo} alt="AlumnAI"/>
            </div>

            <p className="ab-desc">
              Connecting National University – Dasmariñas alumni through innovative technology and
              meaningful community engagement, fostering stronger relationships, continuous
              collaboration, and long-term professional growth within a dynamic and supportive
              alumni network.
            </p>

            {/* CHANGE 2: Refined M/V cards + click opens modal */}
            <div className="ab-mv">
              <button className="ab-mv-card" onClick={() => openModal('mission')} style={{width:'100%',textAlign:'left'}}>
                <div className="ab-mv-icon">
                  <img src={TargetIcon} alt="Mission"/>
                </div>
                <div className="ab-mv-txt">
                  <p className="ab-mv-lbl">Mission</p>
                  <p className="ab-mv-slbl">Our core purpose</p>
                </div>
                <div className="ab-mv-div"/>
                <img src={RightArrow} alt="" className="ab-mv-arrow"/>
              </button>

              <button className="ab-mv-card" onClick={() => openModal('vision')} style={{width:'100%',textAlign:'left'}}>
                <div className="ab-mv-icon">
                  <img src={MagnifyIcon} alt="Vision"/>
                </div>
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
              {/* CHANGE 3: Each tile now opens its own modal instead of navigating */}
              <button className="ab-tile blue" onClick={() => openModal('contact')}>
                <div className="ab-tile-icon blue"><img src={MessageIcon} alt="Contact Support"/></div>
                <p className="ab-tile-name">Contact Support</p>
                <p className="ab-tile-sub">Get help from our team</p>
              </button>

              <button className="ab-tile yellow" onClick={() => openModal('tos')}>
                <div className="ab-tile-icon yellow"><img src={PaperIcon} alt="Terms of Service"/></div>
                <p className="ab-tile-name">Terms of Service</p>
                <p className="ab-tile-sub">Read our guidelines</p>
              </button>

              <button className="ab-tile red" onClick={() => openModal('privacy')}>
                <div className="ab-tile-icon red"><img src={ProtectIcon} alt="Privacy Policy"/></div>
                <p className="ab-tile-name">Privacy Policy</p>
                <p className="ab-tile-sub">Your data protection</p>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── MODALS ── rendered at root level so they overlay everything correctly */}
      {activeModal === 'contact' && <ContactModal  onClose={closeModal} MessageIcon={MessageIcon}/>}
      {activeModal === 'tos'     && <TosModal      onClose={closeModal} PaperIcon={PaperIcon}/>}
      {activeModal === 'privacy' && <PrivacyModal  onClose={closeModal} ProtectIcon={ProtectIcon}/>}
      {activeModal === 'mission' && <MissionModal  onClose={closeModal} TargetIcon={TargetIcon}/>}
      {activeModal === 'vision'  && <VisionModal   onClose={closeModal} MagnifyIcon={MagnifyIcon}/>}
    </>
  );
};

export default AboutView;