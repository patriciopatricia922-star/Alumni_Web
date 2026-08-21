import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import {
  FaArrowLeft,
  FaFilter,
  FaBell,
  FaChevronUp,
  FaStar,
} from 'react-icons/fa';
import { HiOutlineLocationMarker, HiOutlineClock, HiOutlineBriefcase } from 'react-icons/hi';
import { truncateHtml, stripHtml } from '../utils/textHelpers';
import '../styles/Jobs.css';
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';

// ── Clock SVG ────────────────────────────────────────────────────────────────
const ClockSVG = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" />
    <path d="M6.5 3.5V6.5L8.5 8" stroke="rgba(74,85,101,0.45)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// ── Category / Recommended badge ──────────────────────────────────────────────
const CategoryBadge = ({ isRecommended }) => (
  <div className={`category-badge ${isRecommended ? 'recommended' : 'job'}`}>
    {isRecommended
      ? <FaStar size={10} className="badge-icon recommended" />
      : <HiOutlineBriefcase size={11} className="badge-icon job" />}
    <span className="badge-text">
      {isRecommended ? 'Recommended' : 'Job Opening'}
    </span>
  </div>
);

// ── Meta item ─────────────────────────────────────────────────────────────────
const MetaItem = ({ icon, text }) => (
  <div className="meta-item">
    <span className="meta-icon">{icon}</span>
    <span className="meta-text">{text}</span>
  </div>
);

// ── Job Card ──────────────────────────────────────────────────────────────────
const JobCard = ({ job, isRecommended = false, isMobile, isTarget }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(isTarget); // Auto-expand if target
  const [imgIndex, setImgIndex] = useState(0);
  const images = job.images?.length ? job.images : job.image ? [job.image] : [];
  const hasMultiple = images.length > 1;
  const prevImg = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + images.length) % images.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % images.length); };
  
  const relativeTime = (dateStr) => {
    if (!dateStr) return '2 hours ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'just now';
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const previewText = stripHtml
    ? stripHtml(job.description || '')
    : (job.description || '').replace(/<[^>]+>/g, '');
  const needsTrunc = previewText.length > 120;
  const hasDetails = job.website || job.date || job.category;

  // Scroll into view if it's the target
  const cardRef = useRef(null);
  useEffect(() => {
    if (isTarget && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTarget]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`job-card ${hovered || expanded ? 'hovered' : ''} ${isTarget ? 'target-highlight' : ''}`}
      style={isTarget ? { boxShadow: '0 0 0 2px #003ea6, 0px 12px 32px rgba(0,62,166,0.15)' } : {}}
    >
      {/* ── Photo with arrows ── */}
      {images.length > 0 && (
        <div className={`job-card-image-wrapper ${isMobile ? 'mobile' : ''}`} style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={images[imgIndex]}
            alt={job.company || job.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.35s ease',
            }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          {/* Left arrow */}
          <button onClick={prevImg} style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          >
            <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
              <path d="M7 1L3 5L7 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Right arrow */}
          <button onClick={nextImg} style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          >
            <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
              <path d="M3 1L7 5L3 9" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Dot indicators */}
          <div style={{
            position: 'absolute', bottom: '7.5px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '5px', zIndex: 10,
          }}>
            {images.map((_, i) => (
              <div key={i} onClick={(e) => { e.stopPropagation(); setImgIndex(i); }} style={{
                width: i === imgIndex ? '18px' : '6px', height: '6px',
                borderRadius: '3px', background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', transition: 'all 0.2s',
              }} />
            ))}
          </div>
        </div>
      )}
      <div className={`job-card-body ${isMobile ? 'mobile' : ''}`}>
        {/* Icon box / company image */}
        {job.image ? (
          <div className={`job-icon-box ${hovered ? 'hovered' : ''} job-icon-box--img`}>
            <img
              src={job.image}
              alt={job.company || job.title}
              className="job-card-img"
              onError={e => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.classList.add('job-icon-box--fallback');
              }}
            />
          </div>
        ) : (
          <div className={`job-icon-box ${hovered ? 'hovered' : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M2 12h20" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6"/>
            </svg>
          </div>
        )}
        {/* Content */}
        <div className="job-content">
          {/* Top row: badge + timestamp */}
          <div className="job-header-row">
            <CategoryBadge isRecommended={isRecommended} />
            <div className="job-timestamp">
              <ClockSVG />
              <span className="timestamp-text">
                {relativeTime(job.posted_at)}
              </span>
            </div>
          </div>
          {/* Title */}
          <p className={`job-title ${isMobile ? 'mobile' : ''}`}>
            {job.title}
          </p>
          {/* Company */}
          {job.company && (
            <p className={`job-company ${isMobile ? 'mobile' : ''}`}>
              {job.company}
            </p>
          )}
          {/* Description with inline See more */}
          <p className={`job-description ${isMobile ? 'mobile' : ''}`}>
            {expanded
              ? previewText
              : needsTrunc
                ? previewText.substring(0, 120) + '… '
                : previewText}
            {!expanded && needsTrunc && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className={`see-more-btn ${isMobile ? 'mobile' : ''}`}
              >
                See more
              </button>
            )}
          </p>
          {/* Compact meta (always visible when not expanded) */}
          {!expanded && hasDetails && (
            <div className="compact-meta">
              {job.website && (
                <MetaItem
                  icon={<HiOutlineLocationMarker size={13} />}
                  text={job.website}
                />
              )}
              {job.category && (
                <MetaItem
                  icon={<HiOutlineBriefcase size={13} />}
                  text={job.category}
                />
              )}
              {job.date && (
                <MetaItem
                  icon={<HiOutlineClock size={13} />}
                  text={`Expires: ${job.date}`}
                />
              )}
            </div>
          )}
          {/* Expanded: full meta + tags + See less */}
          {expanded && (
            <div className="expanded-meta">
              <div className="meta-divider" />
              {job.website && (
                <MetaItem
                  icon={<HiOutlineLocationMarker size={13} />}
                  text={job.website}
                />
              )}
              {job.category && (
                <MetaItem
                  icon={<HiOutlineBriefcase size={13} />}
                  text={job.category}
                />
              )}
              {job.date && (
                <MetaItem
                  icon={<HiOutlineClock size={13} />}
                  text={`Expires: ${job.date}`}
                />
              )}
              {/* Tags */}
              {job.tags && job.tags.length > 0 && (
                <div className="job-tags">
                  {job.tags.map((tag, i) => (
                    <span key={i} className="job-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                className={`see-less-btn ${isMobile ? 'mobile' : ''}`}
              >
                See less <FaChevronUp size={9} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────
const JobsView = ({
  isMobile, isTablet,
  categories, activeCategory, setActiveCategory,
  showFilter, setShowFilter, filterRef, categoryCounts, filtered,
  recommended, navigate,
  targetJobId, // NEW PROP
}) => {
  const recommendedIds = new Set(recommended.map(r => r.job.id));
  const recommendedJobs = recommended.map(r => ({ ...r.job, _isRecommended: true }));
  const regularJobs = filtered.filter(j => !recommendedIds.has(j.id)).map(j => ({ ...j, _isRecommended: false }));
  const mergedList = activeCategory === 'All Jobs'
    ? [...recommendedJobs, ...regularJobs]
    : filtered.map(j => ({ ...j, _isRecommended: recommendedIds.has(j.id) }));

  return (
    <div className="jobs-view-container">
      <Sidebar />
      <div className={`jobs-main-content ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
        <NotificationBell
          onSeeAll={() => navigate('/notifications')}
          className={isMobile ? 'mobile' : ''}
        />
        {/* ── Back Button ── */}
        <button
          className={isMobile ? 'back-button mobile' : 'back-button'}
          onClick={() => navigate(-1)}
          style={{ position: 'relative', top: '-0.5px', marginLeft: isMobile ? 0 : '-27px' }}
        >
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none" style={{ marginLeft: '7.5px' }}>
            <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>
        {/* ── Header ── */}
        <div className={`jobs-header ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          <h1 className={`jobs-title ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            Jobs
          </h1>
          <p className={`jobs-subtitle ${isMobile ? 'mobile' : ''}`}>
            Discover career opportunities tailored for alumni, advance your professional journey, and achieve your career goals.
          </p>
        </div>
        {/* ── Filter Bar ── */}
        <div
          className={isMobile ? 'jobs-filter-bar mobile' : 'jobs-filter-bar'}
          style={{
            display:        'flex',
            justifyContent: 'flex-end',
            alignItems:     'center',
            marginBottom:   isMobile ? '16px' : '24px',
            marginRight:    isMobile ? undefined : '34.5px',
            gap:            '12px',
          }}
        >
          <div
            ref={filterRef}
            className={isMobile ? 'jobs-filter-container mobile' : 'jobs-filter-container'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
          >
            <div style={{ position: 'relative' }} className={isMobile ? 'jobs-filter-trigger-wrap mobile' : undefined}>
              <div
                className={isMobile ? 'jobs-filter-display mobile' : 'jobs-filter-display'}
                style={{
                  height:      '40px',
                  display:     'flex',
                  alignItems:  'center',
                  padding:     '0 14px',
                  gap:         '10px',
                  background:  '#ffffff',
                  border:      '1px solid rgba(0,62,166,0.15)',
                  borderRadius:'10px',
                  boxShadow:   '0px 2px 8px rgba(0,0,0,0.06)',
                  minWidth:    isMobile ? undefined : '240px',
                  flex:        isMobile ? 1 : 'none',
                }}
              >
                <span style={{
                  fontFamily:   'Montserrat, Arial, sans-serif',
                  fontWeight:   600,
                  fontSize:     '13.5px',
                  color:        '#1e3a5f',
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  flex:         1,
                }}>
                  {activeCategory}
                </span>
                <div style={{
                  background:     '#003ea6',
                  borderRadius:   '6px',
                  minWidth:       '24px',
                  height:         '20px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  padding:        '0 6px',
                  flexShrink:     0,
                }}>
                  <span style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: '12px', color: '#ffffff' }}>
                    {filtered.length}
                  </span>
                </div>
              </div>
              {showFilter && (
                <div
                  className={isMobile ? 'jobs-filter-dropdown mobile' : 'jobs-filter-dropdown'}
                  style={{
                    position:     'absolute',
                    top:          'calc(100% + 8px)',
                    left:         0,
                    background:   '#FFFFFF',
                    border:       '1px solid rgba(0,62,166,0.15)',
                    borderRadius: '12px',
                    overflow:     'hidden',
                    zIndex:       300,
                    minWidth:     '100%',
                    width:        '100%',
                    boxShadow:    '0px 10px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  {categories.map((cat, i) => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                      style={{
                        width:          '100%',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'space-between',
                        padding:        '12px 14px 12px 14.5px',
                        background:     activeCategory === cat ? 'rgba(43,114,251,0.08)' : 'transparent',
                        border:         'none',
                        borderTop:      i > 0 ? '1px solid rgba(0,62,166,0.08)' : 'none',
                        cursor:         'pointer',
                        transition:     'background 0.15s',
                      }}
                      onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(0,62,166,0.05)'; }}
                      onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{
                        fontFamily:  'Montserrat, Arial, sans-serif',
                        fontSize:    '13.5px',
                        color:       activeCategory === cat ? '#1e3a5f' : '#545454',
                        fontWeight:  activeCategory === cat ? 700 : 400,
                        whiteSpace:  'nowrap',
                      }}>
                        {cat}
                      </span>
                      <div style={{
                        background:     activeCategory === cat ? '#003ea6' : 'rgba(43,114,251,0.15)',
                        borderRadius:   '6px',
                        minWidth:       '24px',
                        height:         '20px',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        padding:        '0 6px',
                        flexShrink:     0,
                      }}>
                        <span style={{
                          fontFamily: 'Montserrat, Arial, sans-serif',
                          fontWeight: 700,
                          fontSize:   '11px',
                          color:      activeCategory === cat ? '#FFFFFF' : '#1e3a5f',
                        }}>
                          {categoryCounts[cat]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowFilter(f => !f)}
              className={isMobile ? 'jobs-filter-button mobile' : 'jobs-filter-button'}
              style={{
                height:         '40px',
                padding:        '0 18px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            '8px',
                background:     '#003ea6',
                border:         'none',
                borderRadius:   '10px',
                cursor:         'pointer',
                flexShrink:     0,
                boxShadow:      '0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                transition:     'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                FILTER
              </span>
            </button>
          </div>
        </div>
        {/* ── Jobs List (stacked, full-width cards) ── */}
        <div className={`jobs-list ${isMobile ? 'mobile' : ''}`}>
          {mergedList.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isRecommended={job._isRecommended}
              isMobile={isMobile}
              isTarget={targetJobId && String(job.id) === String(targetJobId)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-jobs">
            No jobs found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsView;