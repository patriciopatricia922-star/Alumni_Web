/**
 * SkillsAndCompetenciesViewSHS.jsx — View / Presentational Layer
 * Location: src/surveyshs/views/SkillsAndCompetenciesViewSHS.jsx
 *
 * Pure render component — zero state, all data via props.
 * Imports its own scoped CSS (SkillsAndCompetenciesSHS.css).
 *
 * Key UI element: StarRating — an accessible, controlled 1–5 star widget.
 *   • Gold (#EFC600) fill when selected, outline when empty
 *   • Hover preview: stars light up up to the hovered position
 *   • Error state: outline turns red when the field is required and empty
 *   • Keyboard accessible (Enter/Space to select)
 *
 * Questions rendered:
 *   Q20 — communication_skills       StarRating
 *   Q21 — technical_knowledge        StarRating
 *   Q22 — leadership_skills          StarRating
 *   Q23 — critical_thinking          StarRating
 *   Q24 — work_ethics                StarRating
 *   ── divider ──
 *   Q25 — other_skills_suggestion    Textarea
 *
 * Footer: Previous | [toast] Save | Next
 */

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import '../styles/SkillsAndCompetenciesSHS.css';

// ─────────────────────────────────────────────────────────────────────────────
// Star Rating widget
// Fully controlled — value (0–5) and onChange are passed from parent.
// Uses internal hover state only for the visual preview; no form state needed.
// ─────────────────────────────────────────────────────────────────────────────
const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const StarIcon = ({ filled, hovered, hasError }) => {
  const color = filled || hovered ? '#EFC600' : 'none';
  const stroke = hasError && !filled ? '#F87171' : filled || hovered ? '#EFC600' : '#D1D5DC';

  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 2.5L20.8 12.3H31.2L22.7 18.5L25.9 28.3L17 22.1L8.1 28.3L11.3 18.5L2.8 12.3H13.2L17 2.5Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StarRating = ({ fieldKey, value, onChange, hasError }) => {
  const [hoverIndex, setHoverIndex] = useState(0);

  return (
    <div
      className={`sc-shs-star-row${hasError ? ' error' : ''}`}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="sc-shs-star"
          aria-label={`${star} star${star > 1 ? 's' : ''} — ${STAR_LABELS[star]}`}
          aria-pressed={value === star}
          onClick={() => onChange(fieldKey, value === star ? 0 : star)}
          onMouseEnter={() => setHoverIndex(star)}
          onMouseLeave={() => setHoverIndex(0)}
        >
          <StarIcon
            filled={star <= value}
            hovered={hoverIndex > 0 && star <= hoverIndex && star > value}
            hasError={hasError}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="sc-shs-star-value-label">
          {STAR_LABELS[value]}
        </span>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Notification dropdown — self-contained, stateless
// ─────────────────────────────────────────────────────────────────────────────
const NotifDropdown = ({
  notifs, unreadCount, notifTab, setNotifTab,
  markAllRead, markOneRead, groupByDate, formatTime,
  navigate, setShowDropdown,
}) => {
  const list    = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const grouped = groupByDate(list);

  return (
    <div className="sc-shs-notif-dropdown">
      <div className="sc-shs-notif-header">
        <span className="sc-shs-notif-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="sc-shs-notif-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="sc-shs-notif-tabs">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            className={`sc-shs-notif-tab ${notifTab === t ? 'active' : 'inactive'}`}
            onClick={() => setNotifTab(t)}
          >
            {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="sc-shs-notif-list">
        {!list.length ? (
          <div className="sc-shs-notif-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>
            <p className="sc-shs-notif-empty-text">
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([label, items]) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="sc-shs-notif-group-label">{label}</p>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`sc-shs-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                    onMouseLeave={(e) => (
                      e.currentTarget.style.background = n.read
                        ? 'transparent'
                        : 'rgba(0,62,166,0.05)'
                    )}
                  >
                    <div className="sc-shs-notif-avatar">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                          stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="sc-shs-notif-body">
                      <p className={`sc-shs-notif-item-title ${n.read ? 'read' : 'unread'}`}>
                        {n.title}
                      </p>
                      <p className="sc-shs-notif-item-body">{n.body}</p>
                      <span className="sc-shs-notif-time">{formatTime(n.time)}</span>
                    </div>
                    {!n.read && <div className="sc-shs-notif-dot" />}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="sc-shs-notif-footer">
        <button
          className="sc-shs-notif-see-all"
          onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
        >
          See all notifications
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main view
// ─────────────────────────────────────────────────────────────────────────────
const SkillsAndCompetenciesViewSHS = ({
  // form
  form,
  set,
  setRating,
  errors,
  saveToast,
  cardRef,
  // static config
  ratingFields,
  // progress
  formPct,
  currentSection,
  totalSections,
  // actions
  handleSave,
  handleNext,
  // notifications
  bellRef,
  notifs,
  unreadCount,
  showDropdown,
  setShowDropdown,
  notifTab,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  // routing
  navigate,
  prevRoute,
}) => (
  <div className="sc-shs-root">
    <Sidebar />

    <div className="sc-shs-content">

      {/* ── Sticky header ────────────────────────────────────────────────── */}
      <div className="sc-shs-header">
        <div className="sc-shs-topbar">

          {/* Back button */}
          <button className="sc-shs-back-btn" onClick={() => navigate(prevRoute)}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                stroke="#002263" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          {/* Badge */}
          <div className="sc-shs-badge">ALUMNI STATUS</div>

          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              className={`sc-shs-bell${showDropdown ? ' active' : ''}`}
              onClick={() => setShowDropdown((v) => !v)}
              aria-label="Notifications"
            >
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path
                  d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
                  stroke="#FFFFFF" strokeWidth="1.67"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              {unreadCount > 0 && (
                <>
                  <div className="sc-shs-bell-dot" />
                  <div className="sc-shs-bell-count">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                </>
              )}
            </button>

            {showDropdown && (
              <NotifDropdown
                notifs={notifs}
                unreadCount={unreadCount}
                notifTab={notifTab}
                setNotifTab={setNotifTab}
                markAllRead={markAllRead}
                markOneRead={markOneRead}
                groupByDate={groupByDate}
                formatTime={formatTime}
                navigate={navigate}
                setShowDropdown={setShowDropdown}
              />
            )}
          </div>
        </div>

        {/* Page title */}
        <h1 className="sc-shs-title">Alumni Tracer Survey</h1>
        <p className="sc-shs-subtitle">
          Please complete all sections to update your alumni status.
        </p>

        {/* Progress */}
        <div className="sc-shs-progress">
          <div className="sc-shs-progress-row">
            <span>Section {currentSection} of {totalSections}</span>
            <span className="sc-shs-progress-pct">{formPct}% Complete</span>
          </div>
          <div className="sc-shs-progress-track">
            <div className="sc-shs-progress-fill" style={{ width: `${formPct}%` }} />
          </div>
          <span className="sc-shs-progress-label">Skills and Competencies</span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="sc-shs-body">
        <div className="sc-shs-card" ref={cardRef}>

          {/* Card heading */}
          <div>
            <h2 className="sc-shs-section-title">Skills and Competencies</h2>
            <p className="sc-shs-section-sub">
              Rate how well the university prepared you in the following areas
            </p>
          </div>

          {/* Rating legend */}
          <div className="sc-shs-rating-legend">
            <svg width="16" height="16" viewBox="0 0 34 34" fill="#EFC600" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 2.5L20.8 12.3H31.2L22.7 18.5L25.9 28.3L17 22.1L8.1 28.3L11.3 18.5L2.8 12.3H13.2L17 2.5Z" stroke="#EFC600" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span>
              <strong>5 stars</strong> = Highest &nbsp;·&nbsp; <strong>1 star</strong> = Lowest
            </span>
          </div>

          <div className="sc-shs-questions">

            {/* ── Q20–Q24: Star rating fields ──────────────────────────── */}
            {ratingFields.map(({ key, label }) => (
              <div key={key} className="sc-shs-field sc-shs-rating-row">
                <span className="sc-shs-label">
                  {label}
                  <span className="sc-shs-req">*</span>
                  {errors.has(key) && (
                    <span className="sc-shs-field-error">Please select a rating</span>
                  )}
                </span>
                <StarRating
                  fieldKey={key}
                  value={form[key]}
                  onChange={setRating}
                  hasError={errors.has(key)}
                />
              </div>
            ))}

            {/* Divider */}
            <div className="sc-shs-divider" />

            {/* ── Q25: Free-text suggestion ─────────────────────────────── */}
            <div className="sc-shs-field">
              <span className="sc-shs-label">
                25. What other skills should NU Dasma develop in students to make them more employable?
                <span className="sc-shs-req">*</span>
                {errors.has('other_skills_suggestion') && (
                  <span className="sc-shs-field-error">This field is required</span>
                )}
              </span>
              <textarea
                className={`sc-shs-textarea${errors.has('other_skills_suggestion') ? ' error' : ''}`}
                placeholder="Enter your answer"
                value={form.other_skills_suggestion}
                onChange={(e) => set('other_skills_suggestion', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#003EA6')}
                onBlur={(e) => (
                  e.target.style.borderColor = errors.has('other_skills_suggestion')
                    ? '#F87171'
                    : '#D1D5DC'
                )}
              />
            </div>

          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div className="sc-shs-footer">
            <button className="sc-shs-btn-prev" onClick={() => navigate(prevRoute)}>
              Previous
            </button>

            <div className="sc-shs-footer-right">
              {saveToast && (
                <span className="sc-shs-save-toast">✓ Progress saved</span>
              )}
              <button className="sc-shs-btn-save" onClick={handleSave}>
                Save
              </button>
              <button className="sc-shs-btn-next" onClick={handleNext}>
                Next
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
);

export default SkillsAndCompetenciesViewSHS;