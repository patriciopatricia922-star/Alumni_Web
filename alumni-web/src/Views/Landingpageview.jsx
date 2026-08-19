import React from 'react';
import Navbar from '../components/Navbar';
import capBg from '../assets/cap_bg.png';
import mcapBg from '../assets/mcap_bg.png';
import '../styles/Landingpage.css';
import {
HiOutlineCalendarDays,
HiOutlineMapPin,
HiOutlineBuildingOffice2,
HiOutlineTicket,
} from 'react-icons/hi2';
const alumnaiLogo = new URL('../assets/alumnai_logo_new.svg', import.meta.url).href;
const footerLogo = new URL('../assets/footer_logo.png', import.meta.url).href;
const stripHtml = (html) => {
if (!html) return '';
const tmp = document.createElement('DIV');
tmp.innerHTML = html;
return tmp.textContent || tmp.innerText || '';
};
// ── Fallbacks (per-type, matches Discounts feature palette) ──────────────────
const FALLBACKS = {
events:    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
jobs:      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
discounts: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
};
// ── Resolve image URL from raw Supabase row ───────────────────────────────────
// Mirrors the pattern in Discounts.jsx:
//   image: discount.image_url || fallback
// Each table uses image_url as the canonical column name.
const resolveImage = (item, type) =>
item.image_url || item.image || item.cover_image || item.banner_url || FALLBACKS[type] || null;
// ── Content Card ──────────────────────────────────────────────────────────────
const ContentCard = ({ item, type }) => {
const getTypeColor = () => {
switch (type) {
case 'events':    return '#155DFC';
case 'jobs':      return '#10B981';
case 'discounts': return '#F59E0B';
default:          return '#6A7282';
}
};
const imageUrl = resolveImage(item, type);
return (
 <div className="lp-content-card">
 <div className="lp-card-image">
 <img
src={imageUrl}
alt={item.title || type}
loading="lazy"
onError={(e) => {
const fallback = FALLBACKS[type];
if (e.currentTarget.src !== fallback) {
e.currentTarget.src = fallback;
}
}}
style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
/>
 <div className="lp-card-category" style={{ background: getTypeColor() }}>
{type === 'events' && 'Event'}
{type === 'jobs' && 'Job'}
{type === 'discounts' && 'Discount'}
 </div>
 </div>
 <div className="lp-card-body">
 <h3 className="lp-card-title">{item.title}</h3>
 <p className="lp-card-description">
{stripHtml(item.description)?.substring(0, 100)}
{stripHtml(item.description)?.length > 100 ? '...' : ''}
 </p>
{type === 'events' && item.event_date && (
 <div className="lp-card-meta">
 <span><HiOutlineCalendarDays size={13} />{new Date(item.event_date).toLocaleDateString()}</span>
{item.location && <span><HiOutlineMapPin size={13} />{item.location}</span>}
 </div>
)}
{type === 'jobs' && (
 <div className="lp-card-meta">
{item.company && <span><HiOutlineBuildingOffice2 size={13} />{item.company}</span>}
{item.location && <span><HiOutlineMapPin size={13} />{item.location}</span>}
 </div>
)}
{type === 'discounts' && (
 <div className="lp-card-meta">
{item.company && <span><HiOutlineBuildingOffice2 size={13} />{item.company}</span>}
{item.discount_code && <span><HiOutlineTicket size={13} />{item.discount_code}</span>}
 </div>
)}
 </div>
 </div>
);
};
// ── Map a stat's label to a stable key used for mobile-only reordering ──────
// (Mobile pairs Employment Rate with Alumni Statistics, and Asia University
// Ranking with Undergraduate & Postgraduate Programmes — see CSS `order`
// rules inside the max-width: 767px media query.)
const getStatKey = (label = '') => {
const l = label.toLowerCase();
if (l.includes('employment')) return 'employment';
if (l.includes('alumni')) return 'alumni';
if (l.includes('asia') || l.includes('ranking')) return 'ranking';
if (l.includes('undergraduate') || l.includes('postgraduate') || l.includes('program')) return 'programmes';
return 'other';
};
const LandingPageView = ({
isScrolled,
stats,
missionItems,
onViewAll,
onExploreMore,
onOpenLogin,
onOpenRegister,
heroSection,
statsSection,
eventsSection,
jobsSection,
discountsSection,
whyJoinSection,
benefitsSection,
footerSection,
loadingSections,
upcomingEvents,
jobOpportunities,
alumniDiscounts,
loadingEvents,
loadingJobs,
loadingDiscounts,
}) => (
<div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
{/* Pass modal openers to Navbar */}
<Navbar isScrolled={isScrolled} onOpenRegister={onOpenRegister} onOpenLogin={onOpenLogin} />
{/* ══ HERO ══════════════════════════════════════════════════════════════ */}
 <section 
   className="lp-hero" 
   style={{ 
     // 2. Pass both images as CSS variables so CSS can swap them responsively
     '--hero-bg-desktop': `url(${heroSection?.image_url || capBg})`,
     '--hero-bg-mobile': `url(${mcapBg})`,
     backgroundImage: `var(--hero-bg-desktop)` 
   }}
 >
   <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70.71% 70.71% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)' }} />
   <div className="lp-hero-content" style={{ zIndex: 1 }}>
     <div className="lp-hero-title-block">
       <p className="lp-hero-subtitle" style={{ fontFamily: 'myPressuru, Impact, Arial, sans-serif', textTransform: 'uppercase', color: '#FFFFFF', WebkitTextStroke: '0.6px rgba(0,0,0,0.6)', textShadow: '0px 2.5px 4px rgba(0,0,0,0.7)', margin: '0 0 -8px', fontWeight: 400 }}>
         {heroSection?.description || 'OFFICE OF THE'}
       </p>
       <h1 className="lp-hero-title" style={{ fontFamily: 'myPressuru, Impact, Arial, sans-serif', color: '#FFFFFF', WebkitTextStroke: '0.9px rgba(0,0,0,0.7)', textShadow: '0px 4px 4px rgba(0,0,0,0.7)', margin: 0, fontWeight: 400 }}>
         {heroSection?.title || 'ALUMNI AFFAIRS'}
       </h1>
     </div>
     <div className="lp-explore-more" onClick={onExploreMore}>
       <p>{heroSection?.content || 'Explore More'}</p>
       <svg style={{ animation: 'bounceDown 1.4s ease-in-out infinite' }} width="24" height="24" viewBox="0 0 24 24" fill="none">
         <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
       </svg>
     </div>
   </div>
 </section>
 {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
 <section id="stats" style={{ width: '100%', background: '#DAA520', padding: '64px 32px' }}>
   <div className="lp-stats-grid">
     {stats.map((stat, i) => (
       <React.Fragment key={i}>
         <div className="lp-stat-item" data-stat={getStatKey(stat.label)}>
           {/* Text Container */}
           <div className="lp-stat-text">
             <h2 className="lp-stat-number">{stat.number}</h2>
             <p className="lp-stat-label">{stat.label}</p>
           </div>
         </div>
         {/* Divider for Desktop (Vertical) */}
         {i < stats.length - 1 && <div className="lp-stat-divider-desktop" />}
       </React.Fragment>
     ))}
   </div>
 </section>
 {/* ══ EVENTS ═══════════════════════════════════════════════════════════ */}
 <section id="events" style={{ width: '100%', background: '#FFFFFF', padding: '96px 32px 64px' }}>
   <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
     <div style={{ marginBottom: '48px', textAlign: 'center' }}>
       <h2 className="lp-section-title">{eventsSection?.title || 'Upcoming Events'}</h2>
       <p className="lp-section-subtitle">{eventsSection?.description || 'Stay updated with upcoming activities and gatherings designed to keep you engaged with the alumni community.'}</p>
     </div>
     {loadingEvents ? (
       <div className="lp-loading-state">Loading events...</div>
     ) : upcomingEvents.length > 0 ? (
       <div className="lp-cards-grid">
         {upcomingEvents.map((event) => <ContentCard key={event.id} item={event} type="events" />)}
       </div>
     ) : (
       <div className="lp-card" style={{ textAlign: 'center' }}>
         <h3>No upcoming events</h3>
         <p>Check back soon for exciting events and gatherings from the alumni community.</p>
       </div>
     )}
     <div style={{ textAlign: 'center', marginTop: '48px' }}>
       <button className="lp-view-all" onClick={onViewAll}>View more</button>
     </div>
   </div>
 </section>
 {/* ══ JOBS ══════════════════════════════════════════════════════════════ */}
 <section id="jobs" style={{ width: '100%', background: '#F9FAFB', padding: '96px 32px 64px' }}>
   <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
     <div style={{ marginBottom: '48px', textAlign: 'center' }}>
       <h2 className="lp-section-title">{jobsSection?.title || 'Job Opportunities'}</h2>
       <p className="lp-section-subtitle">{jobsSection?.description || 'Browse through our curated list of job opportunities specifically for NU Dasmariñas alumni.'}</p>
     </div>
     {loadingJobs ? (
       <div className="lp-loading-state">Loading jobs...</div>
     ) : jobOpportunities.length > 0 ? (
       <div className="lp-cards-grid">
         {jobOpportunities.map((job) => <ContentCard key={job.id} item={job} type="jobs" />)}
       </div>
     ) : (
       <div className="lp-card" style={{ textAlign: 'center' }}>
         <h3>No job postings available</h3>
         <p>Check back soon for exciting career opportunities from our partner companies.</p>
       </div>
     )}
     <div style={{ textAlign: 'center', marginTop: '48px' }}>
       <button className="lp-view-all" onClick={onViewAll}>View more</button>
     </div>
   </div>
 </section>
 {/* ══ DISCOUNTS ═════════════════════════════════════════════════════════ */}
 <section id="discounts" style={{ width: '100%', background: '#FFFFFF', padding: '96px 32px 64px' }}>
   <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
     <div style={{ marginBottom: '48px', textAlign: 'center' }}>
       <h2 className="lp-section-title">{discountsSection?.title || 'Alumni Discounts'}</h2>
       <p className="lp-section-subtitle">{discountsSection?.description || 'Enjoy exclusive discounts and benefits from our partner establishments.'}</p>
     </div>
     {loadingDiscounts ? (
       <div className="lp-loading-state">Loading discounts...</div>
     ) : alumniDiscounts.length > 0 ? (
       <div className="lp-cards-grid">
         {alumniDiscounts.map((discount) => <ContentCard key={discount.id} item={discount} type="discounts" />)}
       </div>
     ) : (
       <div className="lp-card" style={{ textAlign: 'center' }}>
         <h3>No discounts available</h3>
         <p>Check back soon for exclusive discounts and benefits from our partner establishments.</p>
       </div>
     )}
     <div style={{ textAlign: 'center', marginTop: '48px' }}>
       <button className="lp-view-all" onClick={onViewAll}>View more</button>
     </div>
   </div>
 </section>
 {/* ══ WHY JOIN ══════════════════════════════════════════════════════════ */}
 <section id="about" style={{ width: '100%', background: '#F9FAFB', padding: '96px 32px 80px' }}>
   <div style={{ maxWidth: '860px', margin: '0 auto' }}>
     <div style={{ textAlign: 'center', marginBottom: '64px' }}>
       <h2 className="lp-section-title">
         {whyJoinSection?.title?.split(' ').slice(0, 2).join(' ') || 'Why Join'}{' '}
         <span style={{ color: '#003EA6' }}>
           {whyJoinSection?.title?.split(' ')[2]?.slice(0, 5) || 'Alumn'}
         </span>
         <span style={{ color: '#003EA6' }}>
           {whyJoinSection?.title?.split(' ')[2]?.slice(5) || 'AI'}
         </span>
       </h2>
       <p className="lp-section-subtitle">{whyJoinSection?.description || 'Connecting National University—Dasmariñas alumni through innovative technology and community engagement.'}</p>
     </div>
     <div style={{ marginBottom: '56px' }}>
       <h2 style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '42px', lineHeight: '1.1', color: '#101828', textAlign: 'center', margin: '0 0 16px' }}>Mission</h2>
       <div style={{ width: '100%', height: '2px', background: '#002263', marginBottom: '32px', borderRadius: '2px' }} />
       <p style={{ fontFamily: 'Arial', fontSize: '17px', lineHeight: '28px', color: '#364153', margin: '0 0 16px', textAlign: 'justify' }}>
         {stripHtml(whyJoinSection?.content) || 'Guided by the core values and characterized by our cultural heritage of Dynamic Filipinism, National University is committed to providing relevant, innovative, and accessible quality education and other development programs.'}
       </p>
       <p style={{ fontFamily: 'Arial', fontSize: '17px', lineHeight: '28px', color: '#364153', margin: '0 0 16px', textAlign: 'justify' }}>We are committed to our:</p>
       {missionItems.map((item, i) => (
         <p key={i} style={{ fontFamily: 'Arial', fontSize: '17px', lineHeight: '28px', color: '#364153', margin: '0 0 10px', textAlign: 'justify' }}>
           <span style={{ fontWeight: 700, color: '#003EA6' }}>{item.label}</span>{', '}{item.desc}
         </p>
       ))}
     </div>
     <div>
       <h2 style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '42px', lineHeight: '1.1', color: '#101828', textAlign: 'center', margin: '0 0 16px' }}>Vision</h2>
       <div style={{ width: '100%', height: '2px', background: '#002263', marginBottom: '32px', borderRadius: '2px' }} />
       <p style={{ fontFamily: 'Arial', fontSize: '17px', lineHeight: '28px', color: '#364153', margin: 0, textAlign: 'justify' }}>
         We are National University, a dynamic private institution committed to nation building, recognized internationally in teaching and research.
       </p>
     </div>
   </div>
 </section>
 {/* ══ BENEFITS ══════════════════════════════════════════════════════════ */}
 <section style={{ width: '100%', background: '#F9FAFB', padding: '80px 32px' }}>
   <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
     <div style={{ textAlign: 'center', marginBottom: '48px' }}>
       <h2 style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '36px', lineHeight: '44px', color: '#101828', margin: '0 0 12px' }}>
         {(() => {
           const title = benefitsSection?.title || 'What You Get as an Alumni?';
           const titleWithQuestionMark = title.endsWith('?') ? title : title + '?';
           return titleWithQuestionMark.split(' ').map((word, index, arr) => {
             if (word.toLowerCase() === 'alumni' || word.toLowerCase() === 'alumni?') {
               return <span key={index} style={{ color: '#003EA6' }}>{word}</span>;
             }
             return <React.Fragment key={index}>{word}{index < arr.length - 1 ? ' ' : ''}</React.Fragment>;
           });
         })()}
       </h2>
       <p style={{ fontFamily: 'Arial', fontSize: '17px', lineHeight: '26px', color: '#4A5565', margin: 0 }}>{benefitsSection?.description || 'Membership opens doors to a lifetime of opportunity, connection, and growth.'}</p>
     </div>
     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="lp-why-cards-grid">
       {[
         { icon: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>), title: 'Stay Connected', desc: 'Build lasting relationships with fellow alumni and expand your professional network across industries and borders.' },
         { icon: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>), title: 'Give Back', desc: 'Mentor current students, support scholarship programs, and help shape the next generation of NU Dasmariñas leaders.' },
         { icon: (<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>), title: 'Grow Together', desc: 'Access exclusive job listings, events, partner discounts, and resources designed to fuel your personal and professional growth.' },
       ].map((card, i) => (
         <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default' }}
           onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,34,99,0.14)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
           onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
           <div style={{ width: '100%', height: '8px', background: '#DAA520', flexShrink: 0 }} />
           <div style={{ padding: '36px 28px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
             <div style={{ width: '72px', height: '72px', background: 'rgba(0,34,99,0.07)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', flexShrink: 0 }}>{card.icon}</div>
             <h3 style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '22px', lineHeight: '1.3', color: '#101828', margin: '0 0 10px' }}>{card.title}</h3>
             <div style={{ width: '48px', height: '3px', background: '#DAA520', borderRadius: '2px', marginBottom: '20px', flexShrink: 0 }} />
             <p style={{ fontFamily: 'Arial', fontSize: '15px', lineHeight: '24px', color: '#4A5565', margin: 0 }}>{card.desc}</p>
           </div>
         </div>
       ))}
     </div>
   </div>
 </section>
 {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
 <footer style={{ width: '100%', background: '#002263', marginTop: '0', flex: 1 }}>
   <div className="lp-footer-inner">
     <div className="lp-footer-logo">
       <img src={footerLogo} alt="AlumnAI Logo" style={{ width: '130%', height: '130%', objectFit: 'contain', marginLeft: '39px' }} />
     </div>
     <div className="lp-footer-contact">
       <h3 style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '18px', lineHeight: '26px', letterSpacing: '0.2em', color: '#FFFFFF', margin: '0 0 24px', textTransform: 'uppercase' }}>CONTACT US</h3>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
         {[
           { icon: <path d="M8.5 0C5.87 0 3.75 2.12 3.75 4.75C3.75 8.31 8.5 14 8.5 14C8.5 14 13.25 8.31 13.25 4.75C13.25 2.12 11.13 0 8.5 0ZM8.5 6.5C7.67 6.5 7 5.83 7 5C7 4.17 7.67 3.5 8.5 3.5C9.33 3.5 10 4.17 10 5C10 5.83 9.33 6.5 8.5 6.5Z" fill="#FFFFFF" />, text: "Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114" },
           { icon: <path d="M13.5 10.5C12.9 10.5 12.3 10.4 11.8 10.2C11.6 10.1 11.4 10.1 11.2 10.2L9.8 11.6C7.9 10.6 6.4 9.1 5.4 7.2L6.8 5.8C7 5.6 7 5.3 6.9 5.1C6.7 4.6 6.6 4 6.6 3.4C6.6 3 6.3 2.7 5.9 2.7H3.7C3.3 2.7 3 3 3 3.4C3 8.8 7.3 13 12.6 13C13 13 13.3 12.7 13.3 12.3V10.1C13.3 9.7 13 9.4 12.6 9.4L13.5 10.5Z" fill="#FFFFFF" />, text: '09399151561 (Smart) / 09661381357 (Globe)' },
           { icon: <path d="M14.5 3H2.5C1.95 3 1.5 3.45 1.5 4V12C1.5 12.55 1.95 13 2.5 13H14.5C15.05 13 15.5 12.55 15.5 12V4C15.5 3.45 15.05 3 14.5 3ZM14.5 5.5L8.5 8.5L2.5 5.5V4H14.5V5.5Z" fill="#FFFFFF" />, text: 'nudaao@nu-dasma.edu.ph' },
           { icon: <path d="M8.5 1C4.64 1 1.5 4.14 1.5 8C1.5 11.86 4.64 15 8.5 15C12.36 15 15.5 11.86 15.5 8C15.5 4.14 12.36 1 8.5 1ZM8.5 13.5C5.47 13.5 3 11.03 3 8C3 4.97 5.47 2.5 8.5 2.5C11.53 2.5 14 4.97 14 8C14 11.03 11.53 13.5 8.5 13.5ZM9 5H8V8.5L11.25 10.5L11.75 9.75L9 8.25V5Z" fill="#FFFFFF" />, text: 'Monday to Friday (8:30AM - 5:30PM); Saturday (8:30AM - 12:30PM)' },
         ].map((item, i) => (
           <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
             <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}>{item.icon}</svg>
             <p style={{ fontFamily: 'Arial', fontSize: '18px', lineHeight: '26px', color: '#FFFFFF', margin: 0 }}>{item.text}</p>
           </div>
         ))}
       </div>
     </div>
   </div>
   <div style={{ padding: '0', textAlign: 'center' }}>
     <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', maxWidth: '1200px', margin: '0 auto 16px' }} />
     <p style={{ fontFamily: 'Arial', fontSize: '14px', lineHeight: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>
       © 2026 AlumnAI. All rights reserved.
     </p>
   </div>
 </footer>
</div>
);
export default LandingPageView;