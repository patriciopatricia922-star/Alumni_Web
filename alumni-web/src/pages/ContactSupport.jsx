import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import email_icn from '../assets/email_icn.svg';
import phone_icn from '../assets/phone_icn.svg';
import location_icn from '../assets/location_icn.svg';

const ContactSupport = () => {
  const navigate = useNavigate();

  const contactItems = [
    {
      icon: <img src={email_icn} alt="Email" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)', display: 'block', margin: 'auto' }} />,
      label: 'Email',
      value: 'nudaao@nu-dasma.edu.ph',
      underline: true,
    },
    {
      icon: <img src={phone_icn} alt="Phone" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)', display: 'block', margin: 'auto' }} />,
      label: 'Phone',
      value: '0912-345-6789',
      underline: false,
    },
    {
      icon: <img src={location_icn} alt="Location" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)', display: 'block', margin: 'auto' }} />,
      label: 'Location',
      value: "Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite",
      underline: false,
      multiline: true,
    },
  ];

  const supportHours = [
    { day: 'Monday - Friday', time: '8:30 AM - 5:00 PM' },
    { day: 'Saturday', time: '8:30 AM - 12:30 PM' },
  ];

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
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '31px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '19px',
            width: '545px',
            background: 'rgba(13, 19, 56, 0.4)',
            border: '0.8px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '34px 37px',
            boxSizing: 'border-box',
          }}>

            {/* Back button */}
            <button
              onClick={() => navigate('/about')}
              style={{
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
            <div style={{ textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'Montserrat', fontWeight: 700,
                fontSize: '19px', lineHeight: '20px',
                color: '#FFFFFF', margin: '0 0 8px 0',
              }}>
                Contact Support
              </h2>
              <p style={{
                fontFamily: 'Montserrat', fontWeight: 400,
                fontSize: '15px', lineHeight: '20px',
                color: 'rgba(255, 255, 255, 0.5)', margin: 0,
              }}>
                Support and assistance for your alumni needs
              </p>
            </div>

            {/* Contact Info Card */}
            <div style={{
              background: 'rgba(13, 19, 56, 0.4)',
              border: '0.8px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '41px 26px 31px',
              display: 'flex',
              flexDirection: 'column',
              gap: '35px',
            }}>
              {contactItems.map((item, i) => (
                <div key={i} style={{
                  background: 'rgba(13, 19, 56, 0.4)',
                  border: '0.8px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '16.8px 16.8px 12px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  {/* Icon box */}
                  <div style={{
                    width: '44px', height: '44px', flexShrink: 0, minWidth: '44px',
                    background: 'linear-gradient(180deg, rgba(30, 37, 85, 0.8) 0%, rgba(15, 19, 56, 0.8) 100%)',
                    boxShadow: '0px 10px 15px rgba(97, 95, 255, 0.3), 0px 4px 6px rgba(43, 114, 251, 0.15)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    alignSelf: 'center',
                  }}>
                    {item.icon}
                  </div>

                  {/* Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{
                      fontFamily: 'Montserrat', fontWeight: 600,
                      fontSize: '14px', lineHeight: '21px',
                      color: '#FFFFFF', margin: 0,
                    }}>
                      {item.label}
                    </h3>
                    <p style={{
                      fontFamily: 'Montserrat', fontWeight: 400,
                      fontSize: '13px', lineHeight: '20px',
                      color: '#2B72FB', margin: 0,
                      textDecoration: item.underline ? 'underline' : 'none',
                    }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support Hours Card */}
            <div style={{
              background: 'rgba(13, 19, 56, 0.4)',
              border: '0.8px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '25.8px 19.2px 20px 27.8px',
            }}>
              <h3 style={{
                fontFamily: 'Montserrat', fontWeight: 600,
                fontSize: '16px', lineHeight: '24px',
                color: '#FFFFFF', margin: '0 0 16px 0',
              }}>
                Support Hours
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {supportHours.map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'Montserrat', fontWeight: 400,
                      fontSize: '15px', lineHeight: '22px',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}>
                      {row.day}
                    </span>
                    <span style={{
                      fontFamily: 'Montserrat', fontWeight: 500,
                      fontSize: '15px', lineHeight: '22px',
                      color: '#FFFFFF',
                    }}>
                      {row.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;