/**
 * PersonalInformationView.jsx — Presentation Layer
 * Location: src/views/PersonalInformationView.jsx
 *
 * Responsibilities:
 *  - Pure UI rendering — zero business logic
 *  - Translates Flutter Scaffold/Widget hierarchy into React containers
 *  - All event handlers received as props
 *  - Imports styles from PersonalInformation.css
 */

import React, { memo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/PersonalInformation.css';

// ─────────────────────────────────────────────────────────────────────────────
// Atomic field components
// ─────────────────────────────────────────────────────────────────────────────

const FieldLabel = memo(({ children }) => (
  <label className="pi-label">{children}</label>
));

const FieldError = memo(({ message }) =>
  message ? <span className="pi-field-error">{message}</span> : null
);

/**
 * TextInput — mirrors Flutter's _buildInput
 */
const TextInput = memo(({
  value, onChange, placeholder, type = 'text',
  maxLength, disabled = false, hasError = false,
}) => (
  <input
    className={`pi-input${hasError ? ' pi-input--error' : ''}${disabled ? ' pi-input--disabled' : ''}`}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    maxLength={maxLength}
    disabled={disabled}
    autoComplete="off"
  />
));

/**
 * SelectInput — mirrors Flutter's _buildDropdown
 */
const SelectInput = memo(({ value, onChange, options, placeholder, hasError = false }) => (
  <select
    className={`pi-select${hasError ? ' pi-input--error' : ''}`}
    value={value}
    onChange={onChange}
  >
    <option value="" disabled hidden>{placeholder}</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
));

/**
 * DateInput — mirrors Flutter's GestureDetector date picker
 */
const DateInput = memo(({ value, onChange, hasError = false }) => (
  <input
    className={`pi-input pi-input--date${hasError ? ' pi-input--error' : ''}`}
    type="date"
    value={value}
    onChange={onChange}
    max={new Date().toISOString().split('T')[0]}
  />
));

/**
 * Field wrapper — label + input + optional error
 */
const Field = memo(({ label, error, className = '', children }) => (
  <div className={`pi-field ${className}`}>
    <FieldLabel>{label}</FieldLabel>
    {children}
    <FieldError message={error} />
  </div>
));

/**
 * SectionTitle — mirrors Flutter's bold section headers
 */
const SectionTitle = memo(({ children }) => (
  <h3 className="pi-section-title">{children}</h3>
));

/**
 * Divider
 */
const Divider = memo(() => <div className="pi-divider" />);

// ─────────────────────────────────────────────────────────────────────────────
// Notification Bell + Dropdown
// Mirrors Flutter's bell widget in PersonalInfoHeader
// ─────────────────────────────────────────────────────────────────────────────

const NotificationBell = memo(({
  bellRef, notifs, allNotifs, unreadCount,
  showDropdown, setShowDropdown,
  notifTab, setNotifTab,
  markAllRead, markOneRead,
  groupByDate, formatTime,
  navigate, isMobile,
}) => {
  const toggleDropdown = useCallback(
    () => setShowDropdown((v) => !v),
    [setShowDropdown]
  );

  return (
    <div ref={bellRef} className="pi-bell-wrapper">
      {/* Bell button */}
      <button
        className={`pi-bell-btn${showDropdown ? ' pi-bell-btn--active' : ''}`}
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-expanded={showDropdown}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
            stroke="currentColor" strokeWidth="1.67"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="pi-bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {showDropdown && (
        <div className={`pi-notif-panel${isMobile ? ' pi-notif-panel--mobile' : ''}`}
          role="dialog" aria-label="Notifications panel"
        >
          {/* Panel header */}
          <div className="pi-notif-header">
            <span className="pi-notif-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="pi-notif-mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="pi-notif-tabs" role="tablist">
            {['all', 'unread'].map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={notifTab === tab}
                className={`pi-notif-tab${notifTab === tab ? ' pi-notif-tab--active' : ''}`}
                onClick={() => setNotifTab(tab)}
              >
                {tab === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="pi-notif-list" role="tabpanel">
            {notifs.length === 0 ? (
              <div className="pi-notif-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"
                  />
                </svg>
                <p>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
              </div>
            ) : (
              Object.entries(groupByDate(notifs)).map(([group, items]) => {
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <p className="pi-notif-group-label">{group}</p>
                    {items.map((n) => (
                      <div
                        key={n.id}
                        className={`pi-notif-item${n.read ? '' : ' pi-notif-item--unread'}`}
                        onClick={() => markOneRead(n.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && markOneRead(n.id)}
                      >
                        <div className="pi-notif-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                              stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <div className="pi-notif-content">
                          <p className={`pi-notif-item-title${n.read ? '' : ' pi-notif-item-title--unread'}`}>
                            {n.title}
                          </p>
                          <p className="pi-notif-item-body">{n.body}</p>
                          <span className="pi-notif-time">{formatTime(n.time)}</span>
                        </div>
                        {!n.read && <div className="pi-notif-dot" aria-label="Unread" />}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pi-notif-footer">
            <button
              className="pi-notif-see-all"
              onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton loader — shown while profile fetches
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonLoader = memo(() => (
  <div className="pi-skeleton-wrapper" aria-busy="true" aria-label="Loading profile">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="pi-skeleton-row">
        <div className="pi-skeleton pi-skeleton--label" />
        <div className="pi-skeleton pi-skeleton--input" />
      </div>
    ))}
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// Main View component
// ─────────────────────────────────────────────────────────────────────────────
const PersonalInformationView = ({
  isMobile, isTablet,
  form, setField, fieldErrors,
  loading, saving, saveSuccess, saveError, handleSave,
  bellRef, notifs, allNotifs, unreadCount,
  showDropdown, setShowDropdown, notifTab, setNotifTab,
  markAllRead, markOneRead, groupByDate, formatTime,
  navigate,
}) => {
  return (
    <div className="pi-root">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      {!isMobile && <Sidebar />}

      {/* ── Main content area ───────────────────────────────────────────── */}
      <main
        className={`pi-main${isMobile ? ' pi-main--mobile' : isTablet ? ' pi-main--tablet' : ''}`}
        id="main-content"
      >
        {/* ── Notification Bell (fixed, top-right) ──────────────────────── */}
        <NotificationBell
          bellRef={bellRef}
          notifs={notifs}
          allNotifs={allNotifs}
          unreadCount={unreadCount}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          notifTab={notifTab}
          setNotifTab={setNotifTab}
          markAllRead={markAllRead}
          markOneRead={markOneRead}
          groupByDate={groupByDate}
          formatTime={formatTime}
          navigate={navigate}
          isMobile={isMobile}
        />

        {/* ── Card ──────────────────────────────────────────────────────── */}
        <div className="pi-card">

          {/* Back button — mirrors Flutter's arrow_back GestureDetector */}
          <button
            className="pi-back-btn"
            onClick={() => navigate('/profile')}
            aria-label="Go back to profile"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>

          {/* Page header */}
          <div className="pi-card-header">
            <h2 className="pi-card-title">Personal Information</h2>
            <p className="pi-card-subtitle">
              Review and update your basic personal details for your account
            </p>
          </div>

          <Divider />

          {loading ? (
            <SkeletonLoader />
          ) : (
            <div className="pi-form">

              {/* ════════════════════════════════════════════════════════════
                  SECTION 1 — Personal Details
                  Mirrors Flutter's "Personal Details" block
              ═══════════════════════════════════════════════════════════════ */}
              <SectionTitle>Personal Details</SectionTitle>

              <Field label="Last Name" error={fieldErrors.lastName}>
                <TextInput
                  value={form.lastName}
                  onChange={setField('lastName')}
                  placeholder="e.g. Dela Cruz"
                  hasError={!!fieldErrors.lastName}
                />
              </Field>

              <div className={`pi-row${isMobile ? ' pi-row--col' : ''}`}>
                <Field label="First Name" error={fieldErrors.firstName} className="pi-field--flex">
                  <TextInput
                    value={form.firstName}
                    onChange={setField('firstName')}
                    placeholder="e.g. Juan"
                    hasError={!!fieldErrors.firstName}
                  />
                </Field>
                <Field label="Middle Name" error={fieldErrors.middleName} className="pi-field--flex">
                  <TextInput
                    value={form.middleName}
                    onChange={setField('middleName')}
                    placeholder="e.g. Mercado"
                  />
                </Field>
              </div>

              <Field label="Gender" error={fieldErrors.gender}>
                <SelectInput
                  value={form.gender}
                  onChange={setField('gender')}
                  placeholder="Select gender"
                  options={['Male', 'Female', 'Prefer not to say']}
                />
              </Field>

              <Field label="Birthday" error={fieldErrors.birthday}>
                <DateInput
                  value={form.birthday}
                  onChange={setField('birthday')}
                />
              </Field>

              <Field label="Civil Status" error={fieldErrors.civilStatus}>
                <SelectInput
                  value={form.civilStatus}
                  onChange={setField('civilStatus')}
                  placeholder="Select civil status"
                  options={['Single', 'Married', 'Other']}
                />
              </Field>

              <Field label="Street Address" error={fieldErrors.street}>
                <TextInput
                  value={form.street}
                  onChange={setField('street')}
                  placeholder="e.g. Blk 123 Lot 456 AlumnAI St."
                />
              </Field>

              <div className={`pi-row${isMobile ? ' pi-row--col' : ''}`}>
                <Field label="City" error={fieldErrors.city} className="pi-field--flex">
                  <TextInput
                    value={form.city}
                    onChange={setField('city')}
                    placeholder="e.g. Dasmariñas"
                  />
                </Field>
                <Field label="Province" error={fieldErrors.province} className="pi-field--flex">
                  <TextInput
                    value={form.province}
                    onChange={setField('province')}
                    placeholder="e.g. Cavite"
                  />
                </Field>
              </div>

              <div className={`pi-row${isMobile ? ' pi-row--col' : ''}`}>
                <Field label="Zip Code" error={fieldErrors.zipCode} className="pi-field--flex">
                  <TextInput
                    value={form.zipCode}
                    onChange={setField('zipCode')}
                    placeholder="e.g. 4114"
                    maxLength={4}
                    type="tel"
                    hasError={!!fieldErrors.zipCode}
                  />
                </Field>
                <Field label="Country" error={fieldErrors.country} className="pi-field--flex">
                  <TextInput
                    value={form.country}
                    onChange={setField('country')}
                    placeholder="Philippines"
                  />
                </Field>
              </div>

              <Field label="Contact Number" error={fieldErrors.contactNumber}>
                <TextInput
                  value={form.contactNumber}
                  onChange={setField('contactNumber')}
                  placeholder="e.g. 09123456789"
                  type="tel"
                  maxLength={11}
                  hasError={!!fieldErrors.contactNumber}
                />
              </Field>

              {/* ════════════════════════════════════════════════════════════
                  SECTION 2 — Academic Information
                  Mirrors Flutter's "Academic Information" block
              ═══════════════════════════════════════════════════════════════ */}
              <SectionTitle>Academic Information</SectionTitle>

              <Field label="Academic Program" error={fieldErrors.academicProgram}>
                <TextInput
                  value={form.academicProgram}
                  onChange={setField('academicProgram')}
                  placeholder="e.g. BSIT-MWA"
                />
              </Field>

              <Field label="Year Graduated" error={fieldErrors.yearGraduated}>
                <TextInput
                  value={form.yearGraduated}
                  onChange={setField('yearGraduated')}
                  placeholder="e.g. 2025"
                  type="tel"
                  maxLength={4}
                  hasError={!!fieldErrors.yearGraduated}
                />
              </Field>

              <Field label="Student Number" error={fieldErrors.studentNumber}>
                <TextInput
                  value={form.studentNumber}
                  onChange={setField('studentNumber')}
                  placeholder="e.g. 2023-123456"
                />
              </Field>

              {/* ════════════════════════════════════════════════════════════
                  SECTION 3 — Account Security
                  Mirrors Flutter's "Account Security" block
              ═══════════════════════════════════════════════════════════════ */}
              <SectionTitle>Account Security</SectionTitle>

              <Field label="Email Address">
                <TextInput
                  value={form.email}
                  onChange={() => {}}
                  placeholder=""
                  type="email"
                  disabled
                />
                <span className="pi-field-hint">Email is managed by your authentication provider.</span>
              </Field>

              {/* Change Password — mirrors Flutter's GestureDetector */}
              <div className="pi-field">
                <FieldLabel>Password</FieldLabel>
                <button
                  className="pi-change-pass-btn"
                  onClick={() => navigate('/change-password')}
                  aria-label="Change your password"
                >
                  <span>Change Password</span>
                  <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <path
                      d="M2 7.5H13M13 7.5L8 2.5M13 7.5L8 12.5"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* ── Feedback banners ───────────────────────────────────────── */}
              {saveError && (
                <div className="pi-banner pi-banner--error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="#FF6B6B" strokeWidth="1.5"/>
                    <path d="M12 8v4M12 16h.01" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p>{saveError}</p>
                </div>
              )}
              {saveSuccess && (
                <div className="pi-banner pi-banner--success" role="status">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 6L9 17L4 12" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Changes saved successfully!</p>
                </div>
              )}

              {/* ── Save button ───────────────────────────────────────────── */}
              <button
                className={`pi-save-btn${saving ? ' pi-save-btn--saving' : ''}`}
                onClick={handleSave}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <span className="pi-spinner" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>

            </div>
          )}
        </div>
      </main>

      {/* ── Mobile bottom nav — mirrors Flutter's _buildBottomNav ─────────── */}
      {isMobile && (
        <nav className="pi-bottom-nav" aria-label="Main navigation">
          <div className="pi-bottom-nav-divider" />
          <div className="pi-bottom-nav-items">
            {[
              { label: 'Home',         icon: 'home',    route: '/dashboard' },
              { label: 'Tracer Survey',icon: 'survey',  route: '/survey'    },
              { label: 'Profile',      icon: 'profile', route: '/profile', active: true },
            ].map(({ label, icon, route, active }) => (
              <button
                key={label}
                className={`pi-nav-item${active ? ' pi-nav-item--active' : ''}`}
                onClick={() => navigate(route)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <span className="pi-nav-icon-wrap">
                  {icon === 'home' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {icon === 'survey' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7C5.895 5 5 5.895 5 7V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7C19 5.895 18.105 5 17 5H15M9 5C9 5.552 9.448 6 10 6H14C14.552 6 15 5.552 15 5M9 5C9 4.448 9.448 4 10 4H14C14.552 4 15 4.448 15 5"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M9 12H15M9 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  {icon === 'profile' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 20C4 17.239 7.582 15 12 15C16.418 15 20 17.239 20 20"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </span>
                <span className="pi-nav-label">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default memo(PersonalInformationView);