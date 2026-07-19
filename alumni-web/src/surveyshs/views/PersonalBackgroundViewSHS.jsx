/**
 * PersonalBackgroundViewSHS.jsx — Rendering Layer (v4, locked pre-fill fields)
 * Location: src/surveyshs/views/PersonalBackgroundViewSHS.jsx
 */

import React from 'react';
import Sidebar from '../../components/Sidebar';
import '../styles/PersonalBackgroundSHS.css';

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
    <path
      d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
      stroke="#FFFFFF"
      strokeWidth="1.67"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotifIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
      stroke="#003EA6"
      strokeWidth="1.67"
      strokeLinecap="round"
    />
  </svg>
);

const BackArrow = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
      stroke="#002263"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotificationDropdown = ({
  notifs,
  unreadCount,
  notifTab,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  navigate,
  setShowDropdown,
}) => {
  const list = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;

  return (
    <div className="shs-pb-notif-dropdown">
      <div className="shs-pb-notif-header">
        <span className="shs-pb-notif-header-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="shs-pb-notif-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="shs-pb-notif-tabs">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            className={`shs-pb-notif-tab ${notifTab === t ? 'active' : 'inactive'}`}
            onClick={() => setNotifTab(t)}
          >
            {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="shs-pb-notif-list">
        {!list.length ? (
          <div className="shs-pb-notif-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="shs-pb-notif-empty-text">
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          Object.entries(groupByDate(list)).map(([label, items]) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="shs-pb-notif-group-label">{label}</p>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`shs-pb-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = n.read
                        ? 'transparent'
                        : 'rgba(0,62,166,0.05)')
                    }
                  >
                    <div className="shs-pb-notif-icon">
                      <NotifIcon />
                    </div>
                    <div className="shs-pb-notif-body">
                      <p
                        className={`shs-pb-notif-item-title ${
                          n.read ? 'read' : 'unread'
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="shs-pb-notif-item-body">{n.body}</p>
                      <span className="shs-pb-notif-item-time">
                        {formatTime(n.time)}
                      </span>
                    </div>
                    {!n.read && <div className="shs-pb-notif-unread-dot" />}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="shs-pb-notif-footer">
        <button
          className="shs-pb-notif-see-all"
          onClick={() => {
            setShowDropdown(false);
            navigate('/notifications');
          }}
        >
          See all notifications
        </button>
      </div>
    </div>
  );
};

const PersonalBackgroundViewSHS = ({
  form,
  set,
  setRadio,
  setCountry,
  errors,
  saveToast,
  cardRef,
  formPct,
  currentSection,
  totalSections,
  handleSave,
  handleNext,
  onBack,
  getLabel,
  getPlaceholder,
  questionOptions,
  lockedFields,
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
  navigate,
}) => {
  const isLocked = (key) => !!lockedFields && lockedFields.has(key);

  return (
  <div className="shs-pb-root">
    <Sidebar />
    <div className="shs-pb-content">

      <div className="shs-pb-header">
        <div className="shs-pb-topbar">

          <button
            className="shs-pb-back-btn"
            onClick={onBack}
          >
            <BackArrow />
            Back
          </button>

          <div className="shs-pb-badge">ALUMNI STATUS</div>

          <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              className={`shs-pb-bell${showDropdown ? ' active' : ''}`}
              onClick={() => setShowDropdown((v) => !v)}
            >
              <BellIcon />
              {unreadCount > 0 && (
                <>
                  <div className="shs-pb-bell-dot" />
                  <div className="shs-pb-bell-count">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                </>
              )}
            </button>

            {showDropdown && (
              <NotificationDropdown
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

        <h1 className="shs-pb-title">Alumni Tracer Survey</h1>
        <p className="shs-pb-subtitle">
          Please complete all sections to update your alumni status.
        </p>

        <div className="shs-pb-progress">
          <div className="shs-pb-progress-row">
            <span>
              Section {currentSection} of {totalSections}
            </span>
            <span style={{ color: '#003EA6', fontWeight: 700 }}>
              {formPct}% Complete
            </span>
          </div>
          <div className="shs-pb-progress-track">
            <div
              className="shs-pb-progress-fill"
              style={{ width: `${formPct}%` }}
            />
          </div>
          <span className="shs-pb-progress-label">Personal Background</span>
        </div>
      </div>

      <div className="shs-pb-body">
        <div className="shs-pb-card" ref={cardRef}>

          <div>
            <h2 className="shs-pb-section-title">Personal Information</h2>
            <p className="shs-pb-section-sub">Basic information about you</p>
          </div>

          <div className="shs-pb-fields">

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('last_name')} <span className="shs-pb-req">*</span>
                {errors.has('last_name') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                className="shs-pb-input"
                placeholder={getPlaceholder('last_name')}
                value={form.last_name}
                onChange={set('last_name')}
                readOnly={isLocked('last_name')}
                style={isLocked('last_name') ? { cursor: 'default' } : undefined}
              />
            </div>

            <div className="shs-pb-row">
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('first_name')} <span className="shs-pb-req">*</span>
                  {errors.has('first_name') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('first_name')}
                  value={form.first_name}
                  onChange={set('first_name')}
                  readOnly={isLocked('first_name')}
                  style={isLocked('first_name') ? { cursor: 'default' } : undefined}
                />
              </div>
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('middle_name')}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('middle_name')}
                  value={form.middle_name}
                  onChange={set('middle_name')}
                  readOnly={isLocked('middle_name')}
                  style={isLocked('middle_name') ? { cursor: 'default' } : undefined}
                />
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('gender')} <span className="shs-pb-req">*</span>
                {errors.has('gender') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-radio-group">
                {(
                  questionOptions['gender'] || ['Male', 'Female', 'Other']
                ).map((opt) => (
                  <label key={opt} className="shs-pb-radio-label">
                    <input
                      type="radio"
                      name="shs_gender"
                      value={opt}
                      checked={form.gender === opt}
                      onChange={() => setRadio('gender')(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('birthday')} <span className="shs-pb-req">*</span>
                {errors.has('birthday') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                type="date"
                className="shs-pb-input"
                value={form.birthday}
                onChange={set('birthday')}
                style={{ colorScheme: 'light' }}
              />
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('street_address')} <span className="shs-pb-req">*</span>
                {errors.has('street_address') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                className="shs-pb-input"
                placeholder={getPlaceholder('street_address')}
                value={form.street_address}
                onChange={set('street_address')}
              />
            </div>

            <div className="shs-pb-row">
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('city')} <span className="shs-pb-req">*</span>
                  {errors.has('city') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('city')}
                  value={form.city}
                  onChange={set('city')}
                />
              </div>
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('province')} <span className="shs-pb-req">*</span>
                  {errors.has('province') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('province')}
                  value={form.province}
                  onChange={set('province')}
                />
              </div>
            </div>

            <div className="shs-pb-row">
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('zip_code')} <span className="shs-pb-req">*</span>
                  {errors.has('zip_code') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <input
                  className="shs-pb-input"
                  placeholder={getPlaceholder('zip_code')}
                  value={form.zip_code}
                  onChange={set('zip_code')}
                />
              </div>
              <div className="shs-pb-field">
                <label className="shs-pb-label">
                  {getLabel('country')} <span className="shs-pb-req">*</span>
                  {errors.has('country') && (
                    <span className="shs-pb-field-error">Required</span>
                  )}
                </label>
                <select
                  className="shs-pb-input shs-pb-input-select"
                  value={form.country}
                  onChange={setCountry}
                >
                  <option value="" disabled>Select</option>
                  {(questionOptions['country'] || ['Philippines', 'United States', 'Other']).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('contact_number')} <span className="shs-pb-req">*</span>
                {errors.has('contact_number') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-phone-row">
                {form.country === 'Other' ? (
                  <input
                    className="shs-pb-input"
                    style={{ width: '68px', flexShrink: 0, padding: '12px 8px', textAlign: 'center' }}
                    value={form.phone_prefix}
                    onChange={set('phone_prefix')}
                    placeholder="+"
                    maxLength={5}
                  />
                ) : (
                  <div className="shs-pb-phone-prefix">{form.phone_prefix || '+63'}</div>
                )}
                <input
                  type="tel"
                  className="shs-pb-input shs-pb-phone-input"
                  placeholder={getPlaceholder('contact_number')}
                  value={form.contact_number}
                  onChange={set('contact_number')}
                />
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('email')} <span className="shs-pb-req">*</span>
                {errors.has('email') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <input
                type="email"
                className="shs-pb-input"
                placeholder={getPlaceholder('email')}
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('track_strand')} <span className="shs-pb-req">*</span>
                {errors.has('track_strand') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-radio-group">
                {(
                  questionOptions['track_strand'] || ['STEM', 'HUMSS', 'ABM']
                ).map((opt) => {
                  const locked = isLocked('track_strand');
                  return (
                    <label key={opt} className="shs-pb-radio-label">
                      <input
                        type="radio"
                        name="shs_track_strand"
                        value={opt}
                        checked={form.track_strand === opt}
                        disabled={locked}
                        onChange={() => !locked && setRadio('track_strand')(opt)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="shs-pb-field">
              <label className="shs-pb-label">
                {getLabel('year_graduated')} <span className="shs-pb-req">*</span>
                {errors.has('year_graduated') && (
                  <span className="shs-pb-field-error">Required</span>
                )}
              </label>
              <div className="shs-pb-radio-group">
                {(
                  questionOptions['year_graduated'] || [
                    'Batch 2022',
                    'Batch 2023',
                    'Batch 2024',
                    'Batch 2025',
                    'Batch 2026',
                    'Batch 2027',
                  ]
                ).map((opt) => {
                  const locked = isLocked('year_graduated');
                  return (
                    <label key={opt} className="shs-pb-radio-label">
                      <input
                        type="radio"
                        name="shs_year_graduated"
                        value={opt}
                        checked={form.year_graduated === opt}
                        disabled={locked}
                        onChange={() => !locked && setRadio('year_graduated')(opt)}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="shs-pb-footer">
            {saveToast && (
              <span className="shs-pb-save-toast">Progress saved</span>
            )}
            <button className="shs-pb-btn-next" onClick={handleNext}>
              Next
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
  );
};

export default PersonalBackgroundViewSHS;