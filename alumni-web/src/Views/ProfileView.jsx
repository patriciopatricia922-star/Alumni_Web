/**
 * ProfileView.jsx — Presentation Layer
 * Location: src/views/ProfileView.jsx
 */

import React, { memo, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { PASSWORD_RULES } from '../pages/Profile';
import personHeaderIcon from '../assets/inverted_person_icn.svg';
import nameIcon from '../assets/person_icn.svg';
import idIcon from '../assets/ix_id.svg';
import genderIcon from '../assets/gender_icn.svg';
import birthdayIcon from '../assets/calenders_icn.svg';
import civilIcon from '../assets/civil_icn.svg';
import locationIcon from '../assets/loc_icn.svg';
import phoneIcon from '../assets/ph_icn.svg';
import emailIcon from '../assets/mail_icn.svg';
import '../styles/Profile.css';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getStrengthLabel = (pct) => {
  if (pct >= 100) return 'Excellent';
  if (pct >= 80)  return 'Very Good';
  if (pct >= 60)  return 'Good';
  if (pct >= 40)  return 'Fair';
  if (pct >= 20)  return 'Getting Started';
  return 'Just Starting';
};

const getStrengthColor = (pct) => {
  if (pct >= 80) return '#00C853';
  if (pct >= 60) return '#69F0AE';
  if (pct >= 40) return '#FFED97';
  if (pct >= 20) return '#FFB74D';
  return '#FF6B6B';
};

const formatDate = (isoDate) => {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Eye toggle icon
// ─────────────────────────────────────────────────────────────────────────────
const EyeIcon = memo(({ visible }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {visible ? (
      <>
        <path
          d="M1 9C1 9 4 3 9 3C14 3 17 9 17 9C17 9 14 15 9 15C4 15 1 9 1 9Z"
          stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="9" cy="9" r="2.5" stroke="#6B7280" strokeWidth="1.5" />
      </>
    ) : (
      <>
        <path
          d="M1 1L17 17M7.5 7.6C7.19 7.92 7 8.34 7 8.8C7 9.8 7.9 10.6 9 10.6C9.5 10.6 9.95 10.42 10.3 10.12M5.2 5.28C3.27 6.45 2 8 2 8C2 8 5 14 9 14C10.5 14 11.86 13.44 12.98 12.65M3 3C3 3 4.5 3 6 3C8.5 3 10 3 12 3C14 3 16 5 16 5"
          stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
      </>
    )}
  </svg>
));

// ─────────────────────────────────────────────────────────────────────────────
// Password input with show/hide toggle
// ─────────────────────────────────────────────────────────────────────────────
const PasswordInput = memo(({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="prof-cp-field">
      {label && <label className="prof-cp-label">{label}</label>}
      <div className="prof-cp-input-wrap">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || '···········'}
          autoComplete="new-password"
          className="prof-cp-input"
        />
        <button
          type="button"
          className="prof-cp-eye-btn"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Password rules checklist
// ─────────────────────────────────────────────────────────────────────────────
const PasswordRules = memo(({ value }) => {
  if (!value) return null;
  return (
    <div className="prof-cp-rules">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);
        return (
          <div key={rule.id} className="prof-cp-rule">
            <span className={`prof-cp-rule-dot ${passed ? 'prof-cp-rule-dot--pass' : 'prof-cp-rule-dot--fail'}`}>
              {passed && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="#00C853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="prof-cp-rule-label" style={{ color: passed ? '#00C853' : '#9CA3AF' }}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Notification Bell + Dropdown
// ─────────────────────────────────────────────────────────────────────────────
const NotificationBell = memo(({
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime, isMobile, navigate,
}) => (
  <div ref={bellRef} className="prof-bell-wrap">
    <button
      className={`prof-bell-btn${showDropdown ? ' prof-bell-btn--active' : ''}`}
      onClick={() => setShowDropdown((v) => !v)}
      aria-label="Notifications"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
          stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="prof-bell-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </button>

    {showDropdown && (
      <div className={`prof-notif-panel${isMobile ? ' prof-notif-panel--mobile' : ''}`}>
        <div className="prof-notif-header">
          <span className="prof-notif-title">Notifications</span>
          {unreadCount > 0 && (
            <button className="prof-notif-mark-all" onClick={markAllRead}>Mark all read</button>
          )}
        </div>
        <div className="prof-notif-tabs">
          {['all', 'unread'].map((t) => (
            <button
              key={t}
              className={`prof-notif-tab${notifTab === t ? ' prof-notif-tab--active' : ''}`}
              onClick={() => setNotifTab(t)}
            >
              {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>
        <div className="prof-notif-list">
          {(() => {
            const list = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;
            if (!list.length) return (
              <div className="prof-notif-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
              </div>
            );
            return Object.entries(groupByDate(list)).map(([label, items]) => {
              if (!items.length) return null;
              return (
                <div key={label}>
                  <p className="prof-notif-group-label">{label}</p>
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`prof-notif-item${n.read ? '' : ' prof-notif-item--unread'}`}
                      onClick={() => markOneRead(n.id)}
                    >
                      <div className="prof-notif-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="prof-notif-content">
                        <p className={`prof-notif-item-title${n.read ? '' : ' prof-notif-item-title--unread'}`}>{n.title}</p>
                        <p className="prof-notif-item-body">{n.body}</p>
                        <span className="prof-notif-time">{formatTime(n.time)}</span>
                      </div>
                      {!n.read && <div className="prof-notif-dot" />}
                    </div>
                  ))}
                </div>
              );
            });
          })()}
        </div>
        <div className="prof-notif-footer">
          <button
            className="prof-notif-see-all"
            onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
          >
            See all notifications
          </button>
        </div>
      </div>
    )}
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// Personal Information Modal
// ─────────────────────────────────────────────────────────────────────────────
const PersonalInformationModal = memo(({
  isMobile,
  piForm, setPiField, piFieldErrors,
  piLoading, piSaving, piSaveSuccess, piSaveError,
  onPISave, onClose, onOpenCP,
}) => {
  const row = isMobile ? 'prof-pi-row prof-pi-row--col' : 'prof-pi-row';

  // Handle contact number input - allow only numbers and limit to 11 digits
  const handleContactNumberChange = (e) => {
    let value = e.target.value;
    // Remove non-digits
    value = value.replace(/\D/g, '');
    // Limit to 11 digits
    if (value.length > 11) value = value.slice(0, 11);
    setPiField('contactNumber')(value);
  };

  return (
    <div className="prof-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="prof-pi-modal" role="dialog" aria-label="Personal Information" aria-modal="true">

        <div className="prof-pi-modal-header">
          <div className="prof-pi-modal-header-text">
            <h2>Update Personal Information</h2>
            <p>Keep your profile information current and accurate.</p>
          </div>
          <button className="prof-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="prof-pi-modal-body">
          {piLoading ? (
            <div className="prof-pi-skeleton-wrap">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="prof-pi-skeleton-row">
                  <div className="prof-pi-skeleton prof-pi-skeleton--label" />
                  <div className="prof-pi-skeleton prof-pi-skeleton--input" />
                </div>
              ))}
            </div>
          ) : (
            <div className="prof-pi-form">

              <h3 className="prof-pi-section-title">Personal Details</h3>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Last Name</label>
                <input
                  className={`prof-pi-input${piFieldErrors.lastName ? ' prof-pi-input--error' : ''}`}
                  value={piForm.lastName}
                  onChange={setPiField('lastName')}
                  placeholder="e.g. Dela Cruz"
                  autoComplete="family-name"
                />
                {piFieldErrors.lastName && <span className="prof-pi-error-text">{piFieldErrors.lastName}</span>}
              </div>

              <div className={row}>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">First Name</label>
                  <input
                    className={`prof-pi-input${piFieldErrors.firstName ? ' prof-pi-input--error' : ''}`}
                    value={piForm.firstName}
                    onChange={setPiField('firstName')}
                    placeholder="e.g. Juan"
                    autoComplete="given-name"
                  />
                  {piFieldErrors.firstName && <span className="prof-pi-error-text">{piFieldErrors.firstName}</span>}
                </div>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">Middle Name</label>
                  <input
                    className="prof-pi-input"
                    value={piForm.middleName}
                    onChange={setPiField('middleName')}
                    placeholder="e.g. Mercado"
                    autoComplete="additional-name"
                  />
                </div>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Gender</label>
                <select className="prof-pi-select" value={piForm.gender} onChange={setPiField('gender')}>
                  <option value="" disabled hidden>Select gender</option>
                  {['Male', 'Female', 'Prefer not to say'].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Birthday</label>
                <input
                  className="prof-pi-input"
                  type="date"
                  value={piForm.birthday}
                  onChange={setPiField('birthday')}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Civil Status</label>
                <select className="prof-pi-select" value={piForm.civilStatus} onChange={setPiField('civilStatus')}>
                  <option value="" disabled hidden>Select civil status</option>
                  {['Single', 'Married', 'Other'].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Street Address</label>
                <input
                  className="prof-pi-input"
                  value={piForm.street}
                  onChange={setPiField('street')}
                  placeholder="e.g. Blk 123 Lot 456 AlumnAI St."
                  autoComplete="street-address"
                />
              </div>

              <div className={row}>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">City</label>
                  <input
                    className="prof-pi-input"
                    value={piForm.city}
                    onChange={setPiField('city')}
                    placeholder="e.g. Dasmariñas"
                    autoComplete="address-level2"
                  />
                </div>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">Province</label>
                  <input
                    className="prof-pi-input"
                    value={piForm.province}
                    onChange={setPiField('province')}
                    placeholder="e.g. Cavite"
                    autoComplete="address-level1"
                  />
                </div>
              </div>

              <div className={row}>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">Zip Code</label>
                  <input
                    className={`prof-pi-input${piFieldErrors.zipCode ? ' prof-pi-input--error' : ''}`}
                    value={piForm.zipCode}
                    onChange={setPiField('zipCode')}
                    placeholder="e.g. 4114"
                    maxLength={4}
                    type="tel"
                    autoComplete="postal-code"
                  />
                  {piFieldErrors.zipCode && <span className="prof-pi-error-text">{piFieldErrors.zipCode}</span>}
                </div>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">Country</label>
                  <input
                    className="prof-pi-input"
                    value={piForm.country}
                    onChange={setPiField('country')}
                    placeholder="Philippines"
                    autoComplete="country-name"
                  />
                </div>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Contact Number</label>
                <input
                  className={`prof-pi-input${piFieldErrors.contactNumber ? ' prof-pi-input--error' : ''}`}
                  value={piForm.contactNumber}
                  onChange={handleContactNumberChange}
                  placeholder="e.g. 09123456789"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                {piFieldErrors.contactNumber && <span className="prof-pi-error-text">{piFieldErrors.contactNumber}</span>}
                <p className="prof-pi-hint">Enter a valid 10–11 digit mobile number.</p>
              </div>

              <h3 className="prof-pi-section-title">Academic Information</h3>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Student Number</label>
                <input
                  className="prof-pi-input"
                  value={piForm.studentNumber}
                  onChange={setPiField('studentNumber')}
                  placeholder="e.g. 2021-118341"
                  autoComplete="off"
                />
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Academic Program</label>
                <input
                  className="prof-pi-input"
                  value={piForm.academicProgram}
                  onChange={setPiField('academicProgram')}
                  placeholder="e.g. BSIT-MWA"
                  autoComplete="off"
                />
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Year Graduated</label>
                <input
                  className={`prof-pi-input${piFieldErrors.yearGraduated ? ' prof-pi-input--error' : ''}`}
                  value={piForm.yearGraduated}
                  onChange={setPiField('yearGraduated')}
                  placeholder="e.g. 2025"
                  type="tel"
                  maxLength={4}
                  autoComplete="off"
                />
                {piFieldErrors.yearGraduated && <span className="prof-pi-error-text">{piFieldErrors.yearGraduated}</span>}
              </div>

              <h3 className="prof-pi-section-title">Account Security</h3>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Email Address</label>
                <input
                  className="prof-pi-input"
                  value={piForm.email}
                  onChange={() => {}}
                  type="email"
                  disabled
                  autoComplete="email"
                />
                <p className="prof-pi-hint">Email is managed by your authentication provider.</p>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Password</label>
                <button className="prof-pi-change-pass-btn" onClick={onOpenCP} type="button">
                  <span>Change Password</span>
                  <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                    <path d="M2 7.5H13M13 7.5L8 2.5M13 7.5L8 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {piSaveError && (
                <div className="prof-pi-banner prof-pi-banner--error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5" />
                    <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p>{piSaveError}</p>
                </div>
              )}
              {piSaveSuccess && (
                <div className="prof-pi-banner prof-pi-banner--success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>Changes saved successfully!</p>
                </div>
              )}

            </div>
          )}
        </div>

        <div className="prof-pi-modal-footer">
          <button className="prof-pi-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="prof-pi-save-btn"
            onClick={onPISave}
            disabled={piSaving || piLoading}
          >
            {piSaving ? (
              <><span className="prof-spinner" />Saving…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M17 21v-8H7v8M7 3v5h8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Change Password Modal
// ─────────────────────────────────────────────────────────────────────────────
const ChangePasswordModal = memo(({
  cpCurrent, setCpCurrent,
  cpNew,     setCpNew,
  cpConfirm, setCpConfirm,
  cpLoading, cpError, cpSuccess,
  onCPSave, onClose,
}) => (
  <div className="prof-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="prof-cp-modal" role="dialog" aria-label="Change Password" aria-modal="true">

      <div className="prof-cp-modal-header">
        <div className="prof-cp-modal-header-text">
          <h2>Change Password</h2>
          <p>Enter your current and new password for your account.</p>
        </div>
        <button className="prof-modal-close-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="prof-cp-modal-body">
        <PasswordInput
          label="Current password *"
          value={cpCurrent}
          onChange={(e) => setCpCurrent(e.target.value)}
          placeholder="···········"
        />

        <div className="prof-cp-field">
          <label className="prof-cp-label">New password *</label>
          <NewPasswordField value={cpNew} onChange={(e) => setCpNew(e.target.value)} />
          <PasswordRules value={cpNew} />
        </div>

        <PasswordInput
          label="Confirm new password *"
          value={cpConfirm}
          onChange={(e) => setCpConfirm(e.target.value)}
          placeholder="···········"
        />

        <p className="prof-cp-hint">
          The password must be at least 8 characters long, one uppercase letter, one number, and one special character (e.g. !@#$%^&*).
        </p>

        {cpError && (
          <div className="prof-cp-banner prof-cp-banner--error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5" />
              <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p>{cpError}</p>
          </div>
        )}
        {cpSuccess && (
          <div className="prof-cp-banner prof-cp-banner--success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Password updated successfully!</p>
          </div>
        )}
      </div>

      <div className="prof-cp-modal-footer">
        <button className="prof-cp-cancel-btn" onClick={onClose}>Cancel</button>
        <button className="prof-cp-save-btn" onClick={onCPSave} disabled={cpLoading}>
          {cpLoading ? (
            <><span className="prof-spinner" />Saving…</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="#FFFFFF" strokeWidth="1.5" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Save Password
            </>
          )}
        </button>
      </div>
    </div>
  </div>
));

const NewPasswordField = memo(({ value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="prof-cp-input-wrap">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="···········"
        autoComplete="new-password"
        className="prof-cp-input"
      />
      <button
        type="button"
        className="prof-cp-eye-btn"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <EyeIcon visible={show} />
      </button>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Info Row for PI card
// ─────────────────────────────────────────────────────────────────────────────
const InfoRow = memo(({ icon, value, placeholder }) => (
  <div className="prof-info-row">
    <span className="prof-info-icon">{icon}</span>
    <span className={`prof-info-value${!value ? ' prof-info-value--empty' : ''}`}>
      {value || placeholder}
    </span>
  </div>
));

// ─────────────────────────────────────────────────────────────────────────────
// Main View Component
// ─────────────────────────────────────────────────────────────────────────────
const ProfileView = ({
  isMobile, isTablet, navigate,
  user, avatarUrl, strength, onAvatarUpload,
  lastPasswordChange,
  showPIModal, onClosePIModal,
  showCPModal, onCloseCPModal, onOpenCPFromPI,
  piForm, setPiField, piFieldErrors,
  piLoading, piSaving, piSaveSuccess, piSaveError, onPISave,
  cpCurrent, setCpCurrent, cpNew, setCpNew, cpConfirm, setCpConfirm,
  cpLoading, cpError, cpSuccess, onCPSave,
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead, groupByDate, formatTime,
  setShowPIModal, setShowCPModal,
}) => {
  // Get full name
  const fullName = user
    ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim()
    : '';
  const initials = fullName
    ? fullName.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  // Get user data with proper fallbacks
  const program = user?.program || user?.academicProgram || '';
  const batchYear = user?.batch_year || user?.yearGraduated || '';
  const studentNum = user?.student_number || user?.studentNumber || '';
  const gender = user?.gender || '';
  const birthday = user?.birthday || '';
  const civilStatus = user?.civil_status || user?.civilStatus || '';
  
  // CRITICAL FIX: Get phone number from multiple possible sources
  const phone = user?.contact_number || user?.mobile_number || user?.contactNumber || '';
  
  // Get address components
  const addressParts = [
    user?.street_address || user?.street,
    user?.city,
    user?.province,
    user?.zip_code || user?.zipCode,
    user?.country,
  ].filter(Boolean);
  const address = addressParts.length ? addressParts.join(', ') : '';
  
  const email = user?.email || '';

  const strengthColor = getStrengthColor(strength);
  const strengthLabel = getStrengthLabel(strength);
  const lastChangedFormatted = lastPasswordChange ? formatDate(lastPasswordChange) : null;

  return (
    <div className="prof-root">
      {!isMobile && <Sidebar />}

      {/* Content wrapper to create spacing between sidebar and main content */}
      <div className="prof-content-wrapper">
        <main className={`prof-main${isMobile ? ' prof-main--mobile' : ''}`}>
          <NotificationBell
            bellRef={bellRef}
            notifs={notifs}
            unreadCount={unreadCount}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            notifTab={notifTab}
            setNotifTab={setNotifTab}
            markAllRead={markAllRead}
            markOneRead={markOneRead}
            groupByDate={groupByDate}
            formatTime={formatTime}
            isMobile={isMobile}
            navigate={navigate}
          />

          {/* ── Back button - Position unchanged ── */}
          <button className="prof-back" onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 17 17" fill="none">
              <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5" stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>

          <div className="prof-page-header">
            <h1 className="prof-page-title">Profile</h1>
            <p className="prof-page-subtitle">
              Easily access and manage your information to ensure your profile stays complete and up to date.
            </p>
          </div>

          <div className="prof-top-row">
            <div className="prof-hero-card">
              <div className="prof-hero-left">
                <div className="prof-hero-info">
                  <h2 className="prof-hero-name">{fullName || 'Loading...'}</h2>
                  {program && <p className="prof-hero-program">{program}</p>}
                  {batchYear && <p className="prof-hero-batch">Class {batchYear}</p>}
                </div>
              </div>
              <div className="prof-hero-right">
                <div
                  className="prof-hero-avatar-wrap"
                  onClick={() => document.getElementById('prof-avatar-upload').click()}
                >
                  <input
                    id="prof-avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={onAvatarUpload}
                  />
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="prof-hero-avatar-img" />
                  ) : (
                    <div className="prof-hero-avatar-initials">
                      <span>{initials}</span>
                    </div>
                  )}
                  <div className="prof-hero-avatar-overlay">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="prof-strength-card">
              <div className="prof-strength-header">
                <span className="prof-strength-eyebrow">PROFILE STRENGTH</span>
              </div>
              <div className="prof-strength-value-row">
                <span className="prof-strength-label" style={{ color: strengthColor }}>
                  {strengthLabel} – {strength}% Complete
                </span>
              </div>
              <div className="prof-strength-bar-track">
                <div
                  className="prof-strength-bar-fill"
                  style={{ width: `${Math.min(strength, 100)}%`, background: strengthColor }}
                />
              </div>
              <p className="prof-strength-hint">
                {strength >= 100
                  ? 'Your profile is fully complete!'
                  : 'Go to Personal Information to update your profile.'}
              </p>
            </div>
          </div>

          <div className="prof-bottom-row">
            <div className="prof-info-card">
              <div className="prof-info-card-header">
                <div className="prof-info-card-icon prof-info-card-icon--primary">
                  <img src={personHeaderIcon} alt="Personal Info" />
                </div>
                <div>
                  <h3 className="prof-info-card-title">Personal Information</h3>
                  <p className="prof-info-card-subtitle">Review and update your basic personal details.</p>
                </div>
                <button
                  className="prof-info-card-edit-btn"
                  onClick={() => setShowPIModal(true)}
                  aria-label="Edit personal information"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Info list - NO SCROLL, natural flow */}
              <div className="prof-info-list">
                <InfoRow
                  icon={<img src={nameIcon} alt="Name" />}
                  value={fullName}
                  placeholder="Name not set"
                />
                <InfoRow
                  icon={<img src={idIcon} alt="Student ID" />}
                  value={studentNum}
                  placeholder="Student number not set"
                />
                <InfoRow
                  icon={<img src={genderIcon} alt="Gender" />}
                  value={gender}
                  placeholder="Gender not set"
                />
                <InfoRow
                  icon={<img src={birthdayIcon} alt="Birthday" />}
                  value={formatDate(birthday)}
                  placeholder="Birthday not set"
                />
                <InfoRow
                  icon={<img src={civilIcon} alt="Civil Status" />}
                  value={civilStatus}
                  placeholder="Civil status not set"
                />
                <InfoRow
                  icon={<img src={locationIcon} alt="Address" />}
                  value={address}
                  placeholder="Address not set"
                />
                <InfoRow
                  icon={<img src={phoneIcon} alt="Phone" />}
                  value={phone}
                  placeholder="Phone not set"
                />
                <InfoRow
                  icon={<img src={emailIcon} alt="Email" />}
                  value={email}
                  placeholder="Email not set"
                />
              </div>

              <button
                className="prof-info-card-action-btn"
                onClick={() => setShowPIModal(true)}
              >
                Update Information
              </button>
            </div>

            <div className="prof-cp-card">
              <div className="prof-info-card-header">
                <div className="prof-info-card-icon prof-info-card-icon--red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#EF4444" strokeWidth="1.5" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="prof-info-card-title">Change Password</h3>
                  <p className="prof-info-card-subtitle">Update your security credentials.</p>
                </div>
                <button
                  className="prof-info-card-edit-btn"
                  onClick={() => setShowCPModal(true)}
                  aria-label="Change password"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="prof-cp-card-body">
                <p className="prof-cp-req-title">Password Requirements</p>
                <ul className="prof-cp-req-list">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Includes numbers and special characters</li>
                  {lastChangedFormatted && (
                    <li className="prof-cp-last-changed">
                      • <strong>Last Changed: {lastChangedFormatted}</strong>
                    </li>
                  )}
                </ul>
              </div>

              <button
                className="prof-cp-card-action-btn"
                onClick={() => setShowCPModal(true)}
              >
                Change Password
              </button>
            </div>
          </div>
        </main>
      </div>

      {isMobile && (
        <nav className="prof-bottom-nav" aria-label="Main navigation">
          <div className="prof-bottom-nav-divider" />
          <div className="prof-bottom-nav-items">
            {[
              { label: 'Home', icon: 'home', route: '/dashboard' },
              { label: 'Tracer Survey', icon: 'survey', route: '/survey' },
              { label: 'Profile', icon: 'profile', route: '/profile', active: true },
            ].map(({ label, icon, route, active }) => (
              <button
                key={label}
                className={`prof-nav-item${active ? ' prof-nav-item--active' : ''}`}
                onClick={() => navigate(route)}
                aria-label={label}
              >
                <span className="prof-nav-icon-wrap">
                  {icon === 'home' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {icon === 'survey' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7C5.895 5 5 5.895 5 7V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7C19 5.895 18.105 5 17 5H15M9 5C9 5.552 9.448 6 10 6H14C14.552 6 15 5.448 15 5M9 5C9 4.448 9.448 4 10 4H14C14.552 4 15 4.448 15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M9 12H15M9 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                  {icon === 'profile' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M4 20C4 17.239 7.582 15 12 15C16.418 15 20 17.239 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="prof-nav-label">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {showPIModal && (
        <PersonalInformationModal
          isMobile={isMobile}
          piForm={piForm}
          setPiField={setPiField}
          piFieldErrors={piFieldErrors}
          piLoading={piLoading}
          piSaving={piSaving}
          piSaveSuccess={piSaveSuccess}
          piSaveError={piSaveError}
          onPISave={onPISave}
          onClose={onClosePIModal}
          onOpenCP={onOpenCPFromPI}
        />
      )}

      {showCPModal && (
        <ChangePasswordModal
          cpCurrent={cpCurrent} setCpCurrent={setCpCurrent}
          cpNew={cpNew} setCpNew={setCpNew}
          cpConfirm={cpConfirm} setCpConfirm={setCpConfirm}
          cpLoading={cpLoading}
          cpError={cpError}
          cpSuccess={cpSuccess}
          onCPSave={onCPSave}
          onClose={onCloseCPModal}
        />
      )}
    </div>
  );
};

export default memo(ProfileView);