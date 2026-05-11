import React, { useState } from 'react';
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
const JobCard = ({ job, isRecommended = false, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`job-card ${hovered || expanded ? 'hovered' : ''}`}
    >
      <div className={`job-card-body ${isMobile ? 'mobile' : ''}`}>
        {/* Icon box */}
        <div className={`job-icon-box ${hovered ? 'hovered' : ''}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="14" rx="2.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M2 12h20" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6"/>
          </svg>
        </div>

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
  recommended,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  // Build the merged list: recommended IDs first (deduplicated), then the rest
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
        {/* ── Notification Bell ── */}
        <div ref={bellRef} className={`notification-bell-wrapper ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            className={`notification-bell-btn ${showDropdown ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
          >
            <FaBell size={22} color="#FFFFFF" />
            {unreadCount > 0 && (
              <div className="notification-badge-outer">
                <div className="notification-badge-inner">
                  <span className="notification-badge-text">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              </div>
            )}
          </button>

          {/* Notification dropdown */}
          {showDropdown && (
            <div className={`notification-dropdown ${isMobile ? 'mobile' : ''}`}>
              <div className="dropdown-header">
                <span className="dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="mark-all-read-btn">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="dropdown-tabs">
                {['all', 'unread'].map(t => (
                  <button
                    key={t}
                    onClick={() => setNotifTab(t)}
                    className={`dropdown-tab ${notifTab === t ? 'active' : ''}`}
                  >
                    {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                  </button>
                ))}
              </div>
              <div className="dropdown-body">
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div className="empty-notifications">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <p className="empty-text">
                        {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                      </p>
                    </div>
                  );
                  return Object.entries(groupByDate(list)).map(([label, items]) => {
                    if (!items.length) return null;
                    return (
                      <div key={label}>
                        <p className="notification-date-label">{label}</p>
                        {items.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markOneRead(n.id)}
                            className={`notification-item ${n.read ? 'read' : 'unread'}`}
                          >
                            <div className="notification-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div className="notification-content">
                              <p className="notification-title">{n.title}</p>
                              <p className="notification-body">{n.body}</p>
                              <span className="notification-time">{formatTime(n.time)}</span>
                            </div>
                            {!n.read && <div className="notification-unread-dot" />}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="dropdown-footer">
                <button
                  onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
                  className="see-all-btn"
                >
                  See all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Back Button ── */}
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <FaArrowLeft size={14} color="#003EA6" />
          <span className="back-button-text">Back</span>
        </button>

        {/* ── Header ── */}
        <div className={`jobs-header ${isMobile ? 'mobile' : ''}`}>
          <h1 className={`jobs-title ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            Jobs
          </h1>
          <p className={`jobs-subtitle ${isMobile ? 'mobile' : ''}`}>
            Discover career opportunities tailored for alumni, advance your professional journey, and achieve your career goals.
          </p>
        </div>

        {/* ── Filter Bar ── */}
        <div className={`filter-bar ${isMobile ? 'mobile' : ''}`}>
          <div ref={filterRef} className="filter-container">
            <div className={`filter-display ${isMobile ? 'mobile' : ''}`}>
              <span className="filter-active-category">
                {activeCategory}
              </span>
              <div className="filter-count-badge">
                <span className="filter-count-text">
                  {filtered.length}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowFilter(f => !f)}
              className="filter-button"
            >
              <FaFilter size={12} color="#FFFFFF" />
              <span className="filter-button-text">FILTER</span>
            </button>

            {showFilter && (
              <div className="filter-dropdown">
                {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    className={`filter-option ${activeCategory === cat ? 'active' : ''}`}
                  >
                    <span className={`filter-option-text ${activeCategory === cat ? 'active' : ''}`}>
                      {cat}
                    </span>
                    <div className={`filter-option-count ${activeCategory === cat ? 'active' : ''}`}>
                      <span className="filter-option-count-text">
                        {categoryCounts[cat]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Jobs List (stacked, full-width cards) ── */}
        <div className="jobs-list">
          {mergedList.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isRecommended={job._isRecommended}
              isMobile={isMobile}
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