import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const EyeIcon = ({ visible }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    {visible ? (
      <>
        <path d="M1 9C1 9 4 3 9 3C14 3 17 9 17 9C17 9 14 15 9 15C4 15 1 9 1 9Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="9" r="2.5" stroke="#FFFFFF" strokeWidth="1.5"/>
      </>
    ) : (
      <>
        <path d="M1 1L17 17M7.5 7.6C7.19 7.92 7 8.34 7 8.8C7 9.8 7.9 10.6 9 10.6C9.5 10.6 9.95 10.42 10.3 10.12M5.2 5.28C3.27 6.45 2 8 2 8C2 8 5 14 9 14C10.5 14 11.86 13.44 12.98 12.65M3 3C3 3 4.5 3 6 3C8.5 3 10 3 12 3C14 3 16 5 16 5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

const PasswordInput = ({ label, value, onChange, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontFamily: 'Montserrat', fontWeight: 500,
        fontSize: '15px', lineHeight: '20px', color: '#FFFFFF',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{
            width: '100%', height: '47px',
            background: 'rgba(243, 243, 245, 0.17)',
            border: '0.89px solid rgba(0, 0, 0, 0.25)',
            borderRadius: '10px',
            padding: '12px 48px 12px 16px',
            fontFamily: 'Montserrat', fontSize: '15px',
            color: '#FFFFFF', outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.25)'}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: '14px', top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center',
          }}
        >
          <EyeIcon visible={show} />
        </button>
      </div>
      {hint && (
        <p style={{
          fontFamily: 'Montserrat', fontWeight: 400,
          fontSize: '12px', lineHeight: '16px',
          color: 'rgba(255, 255, 255, 0.7)', margin: 0,
        }}>
          {hint}
        </p>
      )}
    </div>
  );
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '229px', flex: 1, padding: '37px 51px', position: 'relative' }}>

        {/* Notification Bell — fixed top right */}
        <div style={{ position: 'fixed', top: '53px', right: '51px', zIndex: 50 }}>
          <button style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, rgba(15, 22, 66, 0.1) 0%, rgba(10, 15, 46, 0.05) 100%)',
            border: '1.24px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px',
              background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'SF Pro Display, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* Centered Card */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '119px' }}>
          <div style={{
            position: 'relative',
            width: '527px',
            background: 'rgba(13, 19, 56, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: '14px',
            padding: '48px 33px 40px',
            boxSizing: 'border-box',
          }}>

            {/* Back button */}
            <button
              onClick={() => navigate('/personal-information')}
              style={{
                position: 'absolute', top: '30px', left: '28px',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>
                Back
              </span>
            </button>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontFamily: 'Montserrat', fontWeight: 600,
                fontSize: '20px', lineHeight: '36px',
                color: '#FFFFFF', margin: '0 0 4px 0',
              }}>
                Change Password
              </h2>
              <p style={{
                fontFamily: 'Montserrat', fontWeight: 400,
                fontSize: '14px', lineHeight: '21px',
                color: 'rgba(255, 255, 255, 0.7)', margin: 0,
              }}>
                Enter your current and new password for your account
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
              <PasswordInput
                label="Current Password *"
                value={current}
                onChange={e => setCurrent(e.target.value)}
              />
              <PasswordInput
                label="New Password *"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                hint="The password must be at least 8 characters long."
              />
              <PasswordInput
                label="Confirm New Password *"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                hint="The password must be at least 8 characters long."
              />
            </div>

            {/* Submit Button */}
            <button
              style={{
                width: '100%', height: '40px',
                background: 'rgba(0, 40, 255, 0.7)',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                borderRadius: '13px', border: 'none',
                fontFamily: 'Montserrat', fontWeight: 700,
                fontSize: '15px', lineHeight: '38px',
                color: '#FFFFFF', cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,40,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,40,255,0.7)'}
            >
              Save Password
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;