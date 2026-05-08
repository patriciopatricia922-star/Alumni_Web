import React, { memo, useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { PASSWORD_RULES } from '../pages/Profile';
import personHeaderIcon from '../assets/inverted_person_icn.svg';
import nameIcon         from '../assets/person_icn.svg';
import idIcon           from '../assets/ix_id.svg';
import genderIcon       from '../assets/gender_icn.svg';
import birthdayIcon     from '../assets/calenders_icn.svg';
import civilIcon        from '../assets/civil_icn.svg';
import locationIcon     from '../assets/loc_icn.svg';
import phoneIcon        from '../assets/ph_icn.svg';
import emailIcon        from '../assets/mail_icn.svg';
import '../styles/Profile.css';

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

const EyeIcon = memo(({ visible }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {visible ? (
      <>
        <path d="M1 9C1 9 4 3 9 3C14 3 17 9 17 9C17 9 14 15 9 15C4 15 1 9 1 9Z"
          stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="9" r="2.5" stroke="#6B7280" strokeWidth="1.5"/>
      </>
    ) : (
      <path d="M1 1L17 17M7.5 7.6C7.19 7.92 7 8.34 7 8.8C7 9.8 7.9 10.6 9 10.6C9.5 10.6 9.95 10.42 10.3 10.12M5.2 5.28C3.27 6.45 2 8 2 8C2 8 5 14 9 14C10.5 14 11.86 13.44 12.98 12.65M3 3C3 3 4.5 3 6 3C8.5 3 10 3 12 3C14 3 16 5 16 5"
        stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    )}
  </svg>
));

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
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
    </div>
  );
});

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
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="#00C853" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
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

const countryData = [
  { code: '+63', name: 'Philippines', flag: '🇵🇭', dial: '+63' },
  { code: '+1', name: 'United States', flag: '🇺🇸', dial: '+1' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', dial: '+44' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', dial: '+61' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', dial: '+81' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', dial: '+82' },
  { code: '+86', name: 'China', flag: '🇨🇳', dial: '+86' },
  { code: '+91', name: 'India', flag: '🇮🇳', dial: '+91' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', dial: '+49' },
  { code: '+33', name: 'France', flag: '🇫🇷', dial: '+33' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', dial: '+39' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', dial: '+34' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', dial: '+55' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', dial: '+52' },
  { code: '+7', name: 'Russia', flag: '🇷🇺', dial: '+7' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', dial: '+27' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', dial: '+20' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', dial: '+62' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', dial: '+60' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', dial: '+65' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', dial: '+66' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', dial: '+84' },
];

const fullCountryList = [
  { name: 'Afghanistan', flag: '🇦🇫' },
  { name: 'Albania', flag: '🇦🇱' },
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'Andorra', flag: '🇦🇩' },
  { name: 'Angola', flag: '🇦🇴' },
  { name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Armenia', flag: '🇦🇲' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Austria', flag: '🇦🇹' },
  { name: 'Azerbaijan', flag: '🇦🇿' },
  { name: 'Bahamas', flag: '🇧🇸' },
  { name: 'Bahrain', flag: '🇧🇭' },
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Barbados', flag: '🇧🇧' },
  { name: 'Belarus', flag: '🇧🇾' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Belize', flag: '🇧🇿' },
  { name: 'Benin', flag: '🇧🇯' },
  { name: 'Bhutan', flag: '🇧🇹' },
  { name: 'Bolivia', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Brunei', flag: '🇧🇳' },
  { name: 'Bulgaria', flag: '🇧🇬' },
  { name: 'Burkina Faso', flag: '🇧🇫' },
  { name: 'Burundi', flag: '🇧🇮' },
  { name: 'Cabo Verde', flag: '🇨🇻' },
  { name: 'Cambodia', flag: '🇰🇭' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Central African Republic', flag: '🇨🇫' },
  { name: 'Chad', flag: '🇹🇩' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Comoros', flag: '🇰🇲' },
  { name: 'Congo', flag: '🇨🇬' },
  { name: 'Costa Rica', flag: '🇨🇷' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Cuba', flag: '🇨🇺' },
  { name: 'Cyprus', flag: '🇨🇾' },
  { name: 'Czech Republic', flag: '🇨🇿' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Djibouti', flag: '🇩🇯' },
  { name: 'Dominica', flag: '🇩🇲' },
  { name: 'Dominican Republic', flag: '🇩🇴' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'El Salvador', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', flag: '🇬🇶' },
  { name: 'Eritrea', flag: '🇪🇷' },
  { name: 'Estonia', flag: '🇪🇪' },
  { name: 'Eswatini', flag: '🇸🇿' },
  { name: 'Ethiopia', flag: '🇪🇹' },
  { name: 'Fiji', flag: '🇫🇯' },
  { name: 'Finland', flag: '🇫🇮' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Gabon', flag: '🇬🇦' },
  { name: 'Gambia', flag: '🇬🇲' },
  { name: 'Georgia', flag: '🇬🇪' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Grenada', flag: '🇬🇩' },
  { name: 'Guatemala', flag: '🇬🇹' },
  { name: 'Guinea', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', flag: '🇬🇼' },
  { name: 'Guyana', flag: '🇬🇾' },
  { name: 'Haiti', flag: '🇭🇹' },
  { name: 'Honduras', flag: '🇭🇳' },
  { name: 'Hungary', flag: '🇭🇺' },
  { name: 'Iceland', flag: '🇮🇸' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Israel', flag: '🇮🇱' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Jamaica', flag: '🇯🇲' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Kazakhstan', flag: '🇰🇿' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Kiribati', flag: '🇰🇮' },
  { name: 'Korea, North', flag: '🇰🇵' },
  { name: 'Korea, South', flag: '🇰🇷' },
  { name: 'Kosovo', flag: '🇽🇰' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', flag: '🇰🇬' },
  { name: 'Laos', flag: '🇱🇦' },
  { name: 'Latvia', flag: '🇱🇻' },
  { name: 'Lebanon', flag: '🇱🇧' },
  { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'Liberia', flag: '🇱🇷' },
  { name: 'Libya', flag: '🇱🇾' },
  { name: 'Liechtenstein', flag: '🇱🇮' },
  { name: 'Lithuania', flag: '🇱🇹' },
  { name: 'Luxembourg', flag: '🇱🇺' },
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Malawi', flag: '🇲🇼' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Maldives', flag: '🇲🇻' },
  { name: 'Mali', flag: '🇲🇱' },
  { name: 'Malta', flag: '🇲🇹' },
  { name: 'Marshall Islands', flag: '🇲🇭' },
  { name: 'Mauritania', flag: '🇲🇷' },
  { name: 'Mauritius', flag: '🇲🇺' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Micronesia', flag: '🇫🇲' },
  { name: 'Moldova', flag: '🇲🇩' },
  { name: 'Monaco', flag: '🇲🇨' },
  { name: 'Mongolia', flag: '🇲🇳' },
  { name: 'Montenegro', flag: '🇲🇪' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'Myanmar', flag: '🇲🇲' },
  { name: 'Namibia', flag: '🇳🇦' },
  { name: 'Nauru', flag: '🇳🇷' },
  { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Nicaragua', flag: '🇳🇮' },
  { name: 'Niger', flag: '🇳🇪' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'North Macedonia', flag: '🇲🇰' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'Palau', flag: '🇵🇼' },
  { name: 'Palestine', flag: '🇵🇸' },
  { name: 'Panama', flag: '🇵🇦' },
  { name: 'Papua New Guinea', flag: '🇵🇬' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Peru', flag: '🇵🇪' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Romania', flag: '🇷🇴' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Rwanda', flag: '🇷🇼' },
  { name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { name: 'Saint Lucia', flag: '🇱🇨' },
  { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { name: 'Samoa', flag: '🇼🇸' },
  { name: 'San Marino', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Seychelles', flag: '🇸🇨' },
  { name: 'Sierra Leone', flag: '🇸🇱' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Slovakia', flag: '🇸🇰' },
  { name: 'Slovenia', flag: '🇸🇮' },
  { name: 'Solomon Islands', flag: '🇸🇧' },
  { name: 'Somalia', flag: '🇸🇴' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Sudan', flag: '🇸🇸' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Sri Lanka', flag: '🇱🇰' },
  { name: 'Sudan', flag: '🇸🇩' },
  { name: 'Suriname', flag: '🇸🇷' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Syria', flag: '🇸🇾' },
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Tajikistan', flag: '🇹🇯' },
  { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Timor-Leste', flag: '🇹🇱' },
  { name: 'Togo', flag: '🇹🇬' },
  { name: 'Tonga', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Turkmenistan', flag: '🇹🇲' },
  { name: 'Tuvalu', flag: '🇹🇻' },
  { name: 'Uganda', flag: '🇺🇬' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Vanuatu', flag: '🇻🇺' },
  { name: 'Vatican City', flag: '🇻🇦' },
  { name: 'Venezuela', flag: '🇻🇪' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Yemen', flag: '🇾🇪' },
  { name: 'Zambia', flag: '🇿🇲' },
  { name: 'Zimbabwe', flag: '🇿🇼' },
];

const CountryCodeSelector = memo(({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCountry = countryData.find(c => c.dial === value) || countryData[0];
  
  const filteredCountries = countryData.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dial.includes(searchTerm)
  );
  
  const handleSelect = (country) => {
    onChange(country.dial);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="prof-country-code-search">
      <button
        type="button"
        className="prof-country-code-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.dial}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="prof-country-dropdown">
          <div className="prof-country-search">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="prof-country-list">
            {filteredCountries.map((country) => (
              <div
                key={country.dial}
                className="prof-country-option"
                onClick={() => handleSelect(country)}
              >
                <span className="prof-country-flag">{country.flag}</span>
                <span>{country.name}</span>
                <span className="prof-country-dial-code">{country.dial}</span>
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div className="prof-country-search-empty">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

const CountrySelector = memo(({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const selectedCountry = fullCountryList.find(c => c.name === value);
  
  const filteredCountries = fullCountryList.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelect = (country) => {
    onChange(country.name);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className="prof-country-selector">
      <button
        type="button"
        className="prof-country-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedCountry && <span style={{ fontSize: '18px', marginRight: '8px' }}>{selectedCountry.flag}</span>}
          <span>{value || placeholder || 'Select country'}</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="prof-country-dropdown">
          <div className="prof-country-search">
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="prof-country-list">
            {filteredCountries.map((country) => (
              <div
                key={country.name}
                className="prof-country-option"
                onClick={() => handleSelect(country)}
              >
                <span className="prof-country-flag">{country.flag}</span>
                <span>{country.name}</span>
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div className="prof-country-search-empty">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

const Toast = memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`prof-toast prof-toast--${type || 'success'}`}>
      <div className="prof-toast-content">
        {type === 'success' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {type === 'error' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        {type === 'warning' && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4M12 16h.01M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#F59E0B" strokeWidth="1.5"/>
          </svg>
        )}
        <span>{message}</span>
      </div>
    </div>
  );
});

const NotificationBell = memo(({
  bellRef, notifs, unreadCount, showDropdown, setShowDropdown,
  notifTab, setNotifTab, markAllRead, markOneRead,
  groupByDate, formatTime, isMobile, navigate,
}) => (
  <div ref={bellRef} className="prof-bell-wrap">
    <button
      className={`prof-bell-btn${showDropdown ? ' prof-bell-btn--active' : ''}`}
      onClick={() => setShowDropdown(v => !v)}
      aria-label="Notifications"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
          stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
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
          {['all', 'unread'].map(t => (
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
            const list = notifTab === 'unread' ? notifs.filter(n => !n.read) : notifs;
            if (!list.length) return (
              <div className="prof-notif-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p>{notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
              </div>
            );
            return Object.entries(groupByDate(list)).map(([label, items]) => {
              if (!items.length) return null;
              return (
                <div key={label}>
                  <p className="prof-notif-group-label">{label}</p>
                  {items.map(n => (
                    <div
                      key={n.id}
                      className={`prof-notif-item${n.read ? '' : ' prof-notif-item--unread'}`}
                      onClick={() => markOneRead(n.id)}
                    >
                      <div className="prof-notif-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                            stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="prof-notif-content">
                        <p className={`prof-notif-item-title${n.read ? '' : ' prof-notif-item-title--unread'}`}>
                          {n.title}
                        </p>
                        <p className="prof-notif-item-body">{n.body}</p>
                        <span className="prof-notif-time">{formatTime(n.time)}</span>
                      </div>
                      {!n.read && <div className="prof-notif-dot"/>}
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

const PersonalInformationModal = memo(({
  isMobile, piForm, setPiField, piFieldErrors,
  piLoading, piSaving, piSaveSuccess, piSaveError,
  onPISave, onClose, onSetToast,
}) => {
  const row = isMobile ? 'prof-pi-row prof-pi-row--col' : 'prof-pi-row';

  const handleContactNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    setPiField('contactNumber')(value);
  };

  const handleStudentNumberChange = (e) => {
    let value = e.target.value;
    if (value.length > 12) value = value.slice(0, 12);
    setPiField('studentNumber')(value);
  };

  const handleCountryCodeChange = (code) => {
    setPiField('countryCode')(code);
  };

  const handleCountryChange = (country) => {
    setPiField('country')(country);
  };

  const getContactNumberError = () => {
    const digits = piForm.contactNumber?.replace(/\D/g, '') || '';
    if (digits.length > 0 && (digits.length < 10 || digits.length > 12)) {
      return 'Contact number must be 10-12 digits';
    }
    return piFieldErrors.contactNumber;
  };

  const getStudentNumberError = () => {
    const val = piForm.studentNumber || '';
    if (val.length > 12) {
      return 'Student number must not exceed 12 characters';
    }
    if (val.length > 0 && val.length < 5) {
      return 'Student number should be at least 5 characters';
    }
    return piFieldErrors.studentNumber;
  };

  const contactNumberError = getContactNumberError();
  const studentNumberError = getStudentNumberError();

  const handleSaveWithToast = async () => {
    await onPISave();
  };

  useEffect(() => {
    if (piSaveSuccess && onSetToast) {
      onSetToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [piSaveSuccess, onSetToast, onClose]);

  useEffect(() => {
    if (piSaveError && onSetToast) {
      onSetToast({ show: true, message: piSaveError, type: 'error' });
    }
  }, [piSaveError, onSetToast]);

  return (
    <div className="prof-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="prof-pi-modal" role="dialog" aria-label="Personal Information" aria-modal="true">

        <div className="prof-pi-modal-header">
          <div className="prof-pi-modal-header-text">
            <h2>Update Personal Information</h2>
            <p>Keep your profile information current and accurate.</p>
          </div>
          <button className="prof-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="prof-pi-modal-body">
          {piLoading ? (
            <div className="prof-pi-skeleton-wrap">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="prof-pi-skeleton-row">
                  <div className="prof-pi-skeleton prof-pi-skeleton--label"/>
                  <div className="prof-pi-skeleton prof-pi-skeleton--input"/>
                </div>
              ))}
            </div>
          ) : (
            <div className="prof-pi-form">
              <div className="prof-pi-field">
                <label className="prof-pi-label">
                  Last Name <span className="eb-req">*</span>
                  {piFieldErrors.lastName && <span className="prof-pi-error-text">Required</span>}
                </label>
                <input
                  className={`prof-pi-input${piFieldErrors.lastName ? ' prof-pi-input--error' : ''}`}
                  value={piForm.lastName}
                  onChange={setPiField('lastName')}
                  placeholder="e.g. Dela Cruz"
                  autoComplete="family-name"
                />
              </div>

              <div className={row}>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">
                    First Name <span className="eb-req">*</span>
                    {piFieldErrors.firstName && <span className="prof-pi-error-text">Required</span>}
                  </label>
                  <input
                    className={`prof-pi-input${piFieldErrors.firstName ? ' prof-pi-input--error' : ''}`}
                    value={piForm.firstName}
                    onChange={setPiField('firstName')}
                    placeholder="e.g. Juan"
                    autoComplete="given-name"
                  />
                </div>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">Middle Name <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(Optional)</span></label>
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
                <label className="prof-pi-label">
                  Gender <span className="eb-req">*</span>
                  {piFieldErrors.gender && <span className="prof-pi-error-text">Required</span>}
                </label>
                <div className="prof-radio-group">
                  {['Male', 'Female', 'Prefer not to say'].map(option => (
                    <label key={option} className="prof-radio-option">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={piForm.gender === option}
                        onChange={setPiField('gender')}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">
                  Birthday <span className="eb-req">*</span>
                  {piFieldErrors.birthday && <span className="prof-pi-error-text">Required</span>}
                </label>
                <input
                  className="prof-pi-input"
                  type="date"
                  value={piForm.birthday}
                  onChange={setPiField('birthday')}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">
                  Civil Status <span className="eb-req">*</span>
                  {piFieldErrors.civilStatus && <span className="prof-pi-error-text">Required</span>}
                </label>
                <div className="prof-radio-group">
                  {['Single', 'Married', 'Other'].map(option => (
                    <label key={option} className="prof-radio-option">
                      <input
                        type="radio"
                        name="civilStatus"
                        value={option}
                        checked={piForm.civilStatus === option}
                        onChange={setPiField('civilStatus')}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">
                  Street Address <span className="eb-req">*</span>
                  {piFieldErrors.street && <span className="prof-pi-error-text">Required</span>}
                </label>
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
                  <label className="prof-pi-label">
                    City <span className="eb-req">*</span>
                    {piFieldErrors.city && <span className="prof-pi-error-text">Required</span>}
                  </label>
                  <input
                    className="prof-pi-input"
                    value={piForm.city}
                    onChange={setPiField('city')}
                    placeholder="e.g. Dasmariñas"
                    autoComplete="address-level2"
                  />
                </div>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">
                    Province <span className="eb-req">*</span>
                    {piFieldErrors.province && <span className="prof-pi-error-text">Required</span>}
                  </label>
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
                  <label className="prof-pi-label">
                    Zip Code <span className="eb-req">*</span>
                    {piFieldErrors.zipCode && <span className="prof-pi-error-text">{piFieldErrors.zipCode}</span>}
                  </label>
                  <input
                    className={`prof-pi-input${piFieldErrors.zipCode ? ' prof-pi-input--error' : ''}`}
                    value={piForm.zipCode}
                    onChange={setPiField('zipCode')}
                    placeholder="e.g. 4114"
                    maxLength={4}
                    type="tel"
                    autoComplete="postal-code"
                  />
                </div>
                <div className="prof-pi-field">
                  <label className="prof-pi-label">
                    Country <span className="eb-req">*</span>
                    {piFieldErrors.country && <span className="prof-pi-error-text">Required</span>}
                  </label>
                  <CountrySelector
                    value={piForm.country}
                    onChange={handleCountryChange}
                    placeholder="Select country"
                  />
                </div>
              </div>

              <h3 className="prof-pi-section-title">Contact Information</h3>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Email Address</label>
                <input
                  className="prof-pi-input"
                  value={piForm.email}
                  onChange={() => {}}
                  type="email"
                  disabled
                  autoComplete="email"
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <p className="prof-pi-hint">Email is managed by your authentication provider.</p>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">
                  Contact Number <span className="eb-req">*</span>
                </label>
                <div className="prof-contact-row">
                  <div className="prof-country-code-select">
                    <CountryCodeSelector
                      value={piForm.countryCode || '+63'}
                      onChange={handleCountryCodeChange}
                    />
                  </div>
                  <div className="prof-phone-number-input">
                    <input
                      className={`prof-pi-input${contactNumberError ? ' prof-pi-input--error' : ''}`}
                      value={piForm.contactNumber}
                      onChange={handleContactNumberChange}
                      placeholder="e.g. 9123456789"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </div>
                </div>
                {contactNumberError && <span className="prof-pi-error-text">{contactNumberError}</span>}
                <p className="prof-pi-hint">Enter a valid 10-12 digit mobile number without the country code.</p>
              </div>

              <h3 className="prof-pi-section-title">Academic Information</h3>

              <div className="prof-pi-field">
                <label className="prof-pi-label">
                  Student Number <span className="eb-req">*</span>
                </label>
                <input
                  className={`prof-pi-input${studentNumberError ? ' prof-pi-input--error' : ''}`}
                  value={piForm.studentNumber}
                  onChange={handleStudentNumberChange}
                  placeholder="e.g. 2021-118341"
                  autoComplete="off"
                  maxLength={12}
                />
                {studentNumberError && <span className="prof-pi-error-text">{studentNumberError}</span>}
                <p className="prof-pi-hint">Maximum of 12 characters allowed.</p>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Academic Program</label>
                <input
                  className="prof-pi-input"
                  value={piForm.academicProgram}
                  onChange={() => {}}
                  placeholder="e.g. BSIT-MWA"
                  autoComplete="off"
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: '#F3F4F6' }}
                />
                <p className="prof-pi-hint">This information is synced from your alumni record and cannot be edited.</p>
              </div>

              <div className="prof-pi-field">
                <label className="prof-pi-label">Year Graduated</label>
                <input
                  className="prof-pi-input"
                  value={piForm.yearGraduated}
                  onChange={() => {}}
                  placeholder="e.g. 2025"
                  type="tel"
                  maxLength={4}
                  autoComplete="off"
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed', backgroundColor: '#F3F4F6' }}
                />
                <p className="prof-pi-hint">This information is synced from your alumni record and cannot be edited.</p>
              </div>
            </div>
          )}
        </div>

        <div className="prof-pi-modal-footer">
          <button className="prof-pi-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="prof-pi-save-btn" onClick={handleSaveWithToast} disabled={piSaving || piLoading}>
            {piSaving ? (
              <><span className="prof-spinner"/>Saving…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                    stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17 21v-8H7v8M7 3v5h8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
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
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        <EyeIcon visible={show}/>
      </button>
    </div>
  );
});

const ChangePasswordModal = memo(({
  cpCurrent, setCpCurrent, cpNew, setCpNew, cpConfirm, setCpConfirm,
  cpLoading, cpError, cpSuccess, onCPSave, onClose, onSetToast,
}) => {
  useEffect(() => {
    if (cpSuccess && onSetToast) {
      onSetToast({ show: true, message: 'Password updated successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [cpSuccess, onSetToast, onClose]);

  useEffect(() => {
    if (cpError && onSetToast) {
      onSetToast({ show: true, message: cpError, type: 'error' });
    }
  }, [cpError, onSetToast]);

  return (
    <div className="prof-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="prof-cp-modal" role="dialog" aria-label="Change Password" aria-modal="true">

        <div className="prof-cp-modal-header">
          <div className="prof-cp-modal-header-text">
            <h2>Change Password</h2>
            <p>Enter your current and new password for your account.</p>
          </div>
          <button className="prof-modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="prof-cp-modal-body">
          <PasswordInput
            label="Current password *"
            value={cpCurrent}
            onChange={e => setCpCurrent(e.target.value)}
            placeholder="···········"
          />

          <div className="prof-cp-field">
            <label className="prof-cp-label">New password *</label>
            <NewPasswordField value={cpNew} onChange={e => setCpNew(e.target.value)}/>
            <PasswordRules value={cpNew}/>
          </div>

          <PasswordInput
            label="Confirm new password *"
            value={cpConfirm}
            onChange={e => setCpConfirm(e.target.value)}
            placeholder="···········"
          />

          <p className="prof-cp-hint">
            At least 8 characters, one uppercase, one number, and one special character (e.g. !@#$%^&*).
          </p>
        </div>

        <div className="prof-cp-modal-footer">
          <button className="prof-cp-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="prof-cp-save-btn" onClick={onCPSave} disabled={cpLoading}>
            {cpLoading ? (
              <><span className="prof-spinner"/>Saving…</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Save Password
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

const InfoRow = memo(({ icon, value, placeholder }) => (
  <div className="prof-info-row">
    <span className="prof-info-icon">{icon}</span>
    <span className={`prof-info-value${!value ? ' prof-info-value--empty' : ''}`}>
      {value || placeholder}
    </span>
  </div>
));

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
  toast = { show: false, message: '', type: 'success' },
  setToast,
}) => {
  const fullName = user
    ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim()
    : '';
  const initials = fullName
    ? fullName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const program     = user?.program || user?.academicProgram || '';
  const batchYear   = user?.batch_year || user?.yearGraduated || '';
  const studentNum  = user?.student_number || user?.studentNumber || '';
  const gender      = user?.gender || '';
  const birthday    = user?.birthday || '';
  const civilStatus = user?.civil_status || user?.civilStatus || '';
  const countryCode = user?.country_code || '+63';
  const phoneNumber = user?.contact_number || user?.mobile_number || user?.contactNumber || '';
  const phone = phoneNumber ? `${countryCode} ${phoneNumber}` : '';
  const addressParts = [
    user?.street_address || user?.street,
    user?.city,
    user?.province,
    user?.zip_code || user?.zipCode,
    user?.country,
  ].filter(Boolean);
  const address = addressParts.length ? addressParts.join(', ') : '';
  const email   = user?.email || '';

  const strengthColor        = getStrengthColor(strength);
  const strengthLabel        = getStrengthLabel(strength);
  const lastChangedFormatted = lastPasswordChange ? formatDate(lastPasswordChange) : null;

  const handleSetToast = useCallback((newToast) => {
    if (setToast) {
      setToast(newToast);
    }
  }, [setToast]);

  return (
    <div className="prof-root">
      {!isMobile && <Sidebar />}

      <div className="prof-content-wrapper">
        <main className={`prof-main${isMobile ? ' prof-main--mobile' : ''}`}>

          <button className="prof-back" onClick={() => navigate('/dashboard')}>
            <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
              <path d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
                stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>

          <div className="prof-page-header">
            <div className="prof-page-header-text">
              <h1 className="prof-page-title">Profile</h1>
              <p className="prof-page-subtitle">
                Easily access and manage your information to ensure your profile stays complete and up to date.
              </p>
            </div>

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
          </div>

          <div className="prof-top-row">
            <div className="prof-hero-card">
              <div className="prof-hero-left">
                <h2 className="prof-hero-name">{fullName || 'Loading…'}</h2>
                {program   && <p className="prof-hero-program">{program}</p>}
                {batchYear && <p className="prof-hero-batch">Class {batchYear}</p>}
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
                    <img src={avatarUrl} alt="Profile" className="prof-hero-avatar-img"/>
                  ) : (
                    <div className="prof-hero-avatar-initials">
                      <span>{initials}</span>
                    </div>
                  )}
                  <div className="prof-hero-avatar-overlay">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                        stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="prof-strength-card">
              <span className="prof-strength-eyebrow">PROFILE STRENGTH</span>
              <div className="prof-strength-value-row">
                <span className="prof-strength-label" style={{ color: strengthColor }}>
                  {strengthLabel} — {strength}% Complete
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
                  <img src={personHeaderIcon} alt="Personal Info"/>
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
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="prof-info-list">
                <InfoRow icon={<img src={nameIcon}     alt="Name"/>}         value={fullName}             placeholder="Name not set"/>
                <InfoRow icon={<img src={idIcon}       alt="Student ID"/>}   value={studentNum}           placeholder="Student number not set"/>
                <InfoRow icon={<img src={genderIcon}   alt="Gender"/>}       value={gender}               placeholder="Gender not set"/>
                <InfoRow icon={<img src={birthdayIcon} alt="Birthday"/>}     value={formatDate(birthday)} placeholder="Birthday not set"/>
                <InfoRow icon={<img src={civilIcon}    alt="Civil Status"/>} value={civilStatus}          placeholder="Civil status not set"/>
                <InfoRow icon={<img src={locationIcon} alt="Address"/>}      value={address}              placeholder="Address not set"/>
                <InfoRow icon={<img src={phoneIcon}    alt="Phone"/>}        value={phone}                placeholder="Phone not set"/>
                <InfoRow icon={<img src={emailIcon}    alt="Email"/>}        value={email}                placeholder="Email not set"/>
              </div>

              <button className="prof-info-card-action-btn" onClick={() => setShowPIModal(true)}>
                Update Information
              </button>
            </div>

            <div className="prof-cp-card">
              <div className="prof-info-card-header">
                <div className="prof-info-card-icon prof-info-card-icon--red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round"/>
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
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

              <button className="prof-cp-card-action-btn" onClick={() => setShowCPModal(true)}>
                Change Password
              </button>
            </div>

          </div>
        </main>
      </div>

      {isMobile && (
        <nav className="prof-bottom-nav" aria-label="Main navigation">
          <div className="prof-bottom-nav-divider"/>
          <div className="prof-bottom-nav-items">
            {[
              { label: 'Home',          icon: 'home',    route: '/dashboard' },
              { label: 'Tracer Survey', icon: 'survey',  route: '/survey' },
              { label: 'Profile',       icon: 'profile', route: '/profile', active: true },
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
                      <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {icon === 'survey' && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7C5.895 5 5 5.895 5 7V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7C19 5.895 18.105 5 17 5H15M9 5C9 5.552 9.448 6 10 6H14C14.552 6 15 5.448 15 5M9 5C9 4.448 9.448 4 10 4H14C14.552 4 15 4.448 15 5"
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
          onSetToast={handleSetToast}
        />
      )}

      {showCPModal && (
        <ChangePasswordModal
          cpCurrent={cpCurrent} setCpCurrent={setCpCurrent}
          cpNew={cpNew}         setCpNew={setCpNew}
          cpConfirm={cpConfirm} setCpConfirm={setCpConfirm}
          cpLoading={cpLoading} cpError={cpError} cpSuccess={cpSuccess}
          onCPSave={onCPSave}   onClose={onCloseCPModal}
          onSetToast={handleSetToast}
        />
      )}

      {toast && toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast && setToast({ show: false, message: '', type: 'success' })} />
      )}
    </div>
  );
};

export default memo(ProfileView);