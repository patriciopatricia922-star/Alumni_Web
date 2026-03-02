import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PersonalInformation = () => {
  const navigate = useNavigate();

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
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '116px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '29px 33px 40px',
            gap: '13px',
            width: '733px',
            background: 'rgba(13, 19, 56, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: '14px',
            boxSizing: 'border-box',
          }}>

            {/* Back button */}
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                marginBottom: '4px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{
                fontFamily: 'Arial', fontWeight: 700,
                fontSize: '14px', lineHeight: '16px',
                color: '#FFFFFF',
              }}>
                Back
              </span>
            </button>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h2 style={{
                  fontFamily: 'Montserrat', fontWeight: 600,
                  fontSize: '20px', lineHeight: '30px',
                  color: '#FFFFFF', margin: '0 0 4px 0',
                }}>
                  Personal Information
                </h2>
                <p style={{
                  fontFamily: 'Montserrat', fontWeight: 400,
                  fontSize: '17px', lineHeight: '20px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0, textAlign: 'center',
                }}>
                  Review and update your basic personal details for your account
                </p>
              </div>

              {/* Divider */}
              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

              {/* Personal Details section */}
              <h3 style={{
                fontFamily: 'Montserrat', fontWeight: 600,
                fontSize: '19px', lineHeight: '20px',
                color: '#FFFFFF', margin: '0 0 20px 0',
              }}>
                Personal Details
              </h3>

              {/* Last Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <label style={{
                  fontFamily: 'Montserrat', fontWeight: 400,
                  fontSize: '15px', lineHeight: '21px', color: '#FFFFFF',
                }}>
                  Last Name
                </label>
                <input
                  defaultValue="Doe"
                  style={{
                    width: '100%', height: '47px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '0.89px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: 'Montserrat', fontSize: '15px',
                    lineHeight: '21px', color: '#FFFFFF',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* First Name + Middle Name */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{
                    fontFamily: 'Montserrat', fontWeight: 400,
                    fontSize: '15px', lineHeight: '21px', color: '#FFFFFF',
                  }}>
                    First Name
                  </label>
                  <input
                    defaultValue="John"
                    style={{
                      width: '100%', height: '47px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '0.89px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontFamily: 'Montserrat', fontSize: '15px',
                      lineHeight: '21px', color: '#FFFFFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label style={{
                    fontFamily: 'Montserrat', fontWeight: 400,
                    fontSize: '15px', lineHeight: '21px', color: '#FFFFFF',
                  }}>
                    Middle Name
                  </label>
                  <input
                    placeholder=""
                    style={{
                      width: '100%', height: '47px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '0.89px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontFamily: 'Montserrat', fontSize: '15px',
                      lineHeight: '21px', color: '#FFFFFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Account Security section */}
              <h3 style={{
                fontFamily: 'Montserrat', fontWeight: 600,
                fontSize: '20px', lineHeight: '30px',
                color: '#FFFFFF', margin: '0 0 20px 0',
              }}>
                Account Security
              </h3>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <label style={{
                  fontFamily: 'Montserrat', fontWeight: 400,
                  fontSize: '15px', lineHeight: '21px', color: '#FFFFFF',
                }}>
                  Email Address
                </label>
                <input
                  defaultValue="johndoe@gmail.com"
                  type="email"
                  style={{
                    width: '100%', height: '47px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '0.89px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: 'Montserrat', fontSize: '15px',
                    lineHeight: '21px', color: '#FFFFFF',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Change Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  fontFamily: 'Montserrat', fontWeight: 400,
                  fontSize: '15px', lineHeight: '21px', color: '#FFFFFF',
                }}>
                  Password
                </label>
                <button
                  onClick={() => navigate('/change-password')}
                  style={{
                    width: '100%', height: '47px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '0.89px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', boxSizing: 'border-box',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <span style={{
                    fontFamily: 'Montserrat', fontWeight: 700,
                    fontSize: '15px', lineHeight: '20px', color: '#FFFFFF',
                  }}>
                    Change Password
                  </span>
                  <svg width="13" height="20" viewBox="0 0 13 20" fill="none">
                    <path d="M2 2L11 10L2 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;