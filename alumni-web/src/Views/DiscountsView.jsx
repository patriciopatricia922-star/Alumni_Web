import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { truncateHtml } from '../utils/textHelpers';
import '../styles/Discounts.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PriceTagIcon = () => (
  <svg width="14" height="11" viewBox="0 0 24 20" fill="none">
    <path d="M1 1h8l10 9-8 9L1 10V1z" stroke="#003ea6" strokeWidth="2" strokeLinejoin="round"/>
    <circle cx="6" cy="6" r="1.5" fill="#003ea6"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"
      stroke="#4a5565" strokeWidth="1.2" fill="none"/>
    <circle cx="8" cy="6" r="1.5" stroke="#4a5565" strokeWidth="1.2"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
    <rect x="2" y="3" width="18" height="17" rx="2" stroke="#4a5565" strokeWidth="1.5"/>
    <path d="M2 8h18" stroke="#4a5565" strokeWidth="1.5"/>
    <path d="M7 1.5v3M15 1.5v3" stroke="#4a5565" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="5.5" y="11" width="3" height="3" rx="0.5" fill="#4a5565" opacity="0.6"/>
    <rect x="9.5" y="11" width="3" height="3" rx="0.5" fill="#4a5565" opacity="0.6"/>
    <rect x="13.5" y="11" width="3" height="3" rx="0.5" fill="#4a5565" opacity="0.6"/>
  </svg>
);

// ── Discount Card ─────────────────────────────────────────────────────────────
const DiscountCard = ({ item }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasDetails = item.location || item.validUntil;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`discount-card ${hovered ? 'hovered' : ''}`}
    >
      {/* ── Photo with discount badge + category tag ── */}
      <div className="discount-card-image-wrapper">
        <img
          src={item.image}
          alt={item.name}
          className={`discount-card-image ${hovered ? 'hovered' : ''}`}
          onError={e => { e.target.style.background = '#dbeafe'; e.target.style.display = 'none'; }}
        />

        {/* Discount % badge — top-right, red pill */}
        {item.discountPercent && (
          <div className="discount-badge">
            <span className="discount-badge-text">
              {item.discountPercent}
            </span>
          </div>
        )}

        {/* Category tag — bottom-left, white pill */}
        {item.category && (
          <div className="discount-category-tag">
            <span className="discount-category-text">
              {item.category}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="discount-card-body">
        {/* Title row */}
        <div className="discount-card-title-row">
          <div className="discount-card-icon"><PriceTagIcon /></div>
          <p className="discount-card-title">
            {item.name}
          </p>
        </div>

        {/* Discount description */}
        <p className="discount-card-description">
          {truncateHtml(item.discount, expanded ? 500 : 80)}
        </p>

        {/* Divider */}
        <div className="discount-card-divider" />

        {/* ── Expandable details ── */}
        <div className={`discount-card-details ${expanded ? 'expanded' : ''}`}>
          <div className="discount-card-details-content">
            {item.location && (
              <div className="discount-card-detail-item">
                <div className="detail-icon"><LocationIcon /></div>
                <p className="detail-text">
                  {item.location}
                </p>
              </div>
            )}
            {item.validUntil && (
              <div className="discount-card-detail-item">
                <div className="detail-icon"><CalendarIcon /></div>
                <p className="detail-text">
                  {item.validUntil}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toggle button ── */}
      {hasDetails && (
        <div className="discount-card-button-wrapper">
          <button
            onClick={() => setExpanded(v => !v)}
            className={`discount-card-toggle-btn ${expanded ? 'expanded' : ''}`}
          >
            {expanded ? (
              <>See Less <FaChevronUp size={10} /></>
            ) : (
              <>See More <FaChevronDown size={10} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main View ─────────────────────────────────────────────────────────────────
const DiscountsView = ({
  isMobile, isTablet,
  categories, activeCategory, setActiveCategory,
  showFilter, setShowFilter, filterRef, categoryCounts, filtered,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate,
}) => {
  return (
    <div className="discounts-view-container">
      <Sidebar />

      <div className={`discounts-main-content ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
        {/* ── Notification Bell ─────────────────────────────────────────────── */}
        <div ref={bellRef} className={`notification-bell-wrapper ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          {/* Bell button — solid primary blue, matches Profile page */}
          <button
            onClick={() => setShowDropdown(v => !v)}
            className={`notification-bell-btn ${showDropdown ? 'active' : ''}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
                stroke="#FFFFFF"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {unreadCount > 0 && (
              <div className="notification-badge">
                <span className="notification-badge-text">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}
          </button>

          {/* Notification dropdown — dark panel */}
          {showDropdown && (
            <div className={`notification-dropdown ${isMobile ? 'mobile' : ''}`}>
              {/* Header */}
              <div className="dropdown-header">
                <span className="dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="mark-all-read-btn">
                    Mark all read
                  </button>
                )}
              </div>

              {/* Tabs */}
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

              {/* Body */}
              <div className="dropdown-body">
                {(() => {
                  const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
                  if (!list.length) return (
                    <div className="empty-notifications">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="rgba(0,0,0,0.2)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
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
                                <path
                                  d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                                  stroke="#003EA6"
                                  strokeWidth="1.67"
                                  strokeLinecap="round"
                                />
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

              {/* Footer */}
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

        {/* ── Back Button ───────────────────────────────────────────────────── */}
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path
              d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
              stroke="#003EA6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="back-button-text">Back</span>
        </button>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className={`discounts-header ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
          <h1 className={`discounts-title ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            Discounts
          </h1>
          <p className={`discounts-subtitle ${isMobile ? 'mobile' : ''}`}>
            Avail discounts on participating accommodations, dining, shopping, leisure, and health and wellness establishments.
          </p>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────────── */}
        <div className={`filter-bar ${isMobile ? 'mobile' : ''}`}>
          <div ref={filterRef} className="filter-container">
            {/* Active filter display pill */}
            <div className={`filter-display ${isMobile ? 'mobile' : ''}`}>
              <span className="filter-active-text">
                {activeCategory === 'All' ? 'All Discounts' : activeCategory}
              </span>
              {/* Count badge */}
              <div className="filter-count-badge">
                <span className="filter-count-text">
                  {categoryCounts[activeCategory]}
                </span>
              </div>
            </div>

            {/* Filter button */}
            <button
              onClick={() => setShowFilter(f => !f)}
              className="filter-button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className="filter-button-text">FILTER</span>
            </button>

            {/* Filter dropdown */}
            {showFilter && (
              <div className="filter-dropdown">
                {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    className={`filter-option ${activeCategory === cat ? 'active' : ''}`}
                    style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
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

        {/* ── Cards grid ────────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className={`discounts-grid ${isMobile ? 'mobile' : isTablet ? 'tablet' : ''}`}>
            {filtered.map(item => (
              <DiscountCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="empty-discounts">
            No discounts found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountsView;