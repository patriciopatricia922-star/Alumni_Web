import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const inputStyle = {
  width: '100%',
  height: '47px',
  background: 'rgba(255, 255, 255, 0.17)',
  border: '0.89px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '10px',
  padding: '12px 16px',
  fontFamily: 'Arimo, Arial',
  fontSize: '14px',
  lineHeight: '16px',
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '21px',
  color: 'rgba(255, 255, 255, 0.7)',
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const TextInput = ({ placeholder, value, onChange, type = 'text' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={inputStyle}
    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
  />
);

const RadioGroup = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
    {options.map(opt => (
      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
        <input
          type="radio"
          name={`radio-${options[0]}`}
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
          style={{ width: '16px', height: '16px', accentColor: '#51A2FF', cursor: 'pointer' }}
        />
        <span style={labelStyle}>{opt}</span>
      </label>
    ))}
  </div>
);

const PersonalBackground = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    studentNumber: '',
    gender: '',
    birthday: '',
    civilStatus: '',
    streetAddress: '',
    city: '',
    province: '',
    zipCode: '',
    country: '',
    contactNumber: '',
    email: '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setRadio = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '229px', flex: 1, position: 'relative' }}>

        {/* Sticky Top Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: '#002263',
          paddingBottom: '16px',
        }}>
          {/* Top bar: back + ALUMNI STATUS badge + notification bell */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '30px 51px 0px',
          }}>
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </button>

            {/* ALUMNI STATUS badge — center */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              border: '1.24px solid rgba(99,102,241,0.3)',
              borderRadius: '999px',
              padding: '7px 20px',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>
                ALUMNI STATUS
              </span>
            </div>

            {/* Notification Bell */}
            <button style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, rgba(15, 22, 66, 0.1) 0%, rgba(10, 15, 46, 0.05) 100%)',
              border: '1.24px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
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
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
              </div>
            </button>
          </div>

          {/* Survey Title */}
          <div style={{ textAlign: 'center', padding: '16px 51px 0px' }}>
            <h1 style={{
              fontFamily: 'Arimo, Arial', fontWeight: 700,
              fontSize: '28px', lineHeight: '42px',
              letterSpacing: '-0.7px', color: '#FFFFFF', margin: 0,
            }}>
              Alumni Tracer Survey
            </h1>
          </div>

          {/* Progress Banner */}
          <div style={{
            margin: '12px 51px 0px',
            background: '#001743',
            border: '1px solid #01122F',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: '18px 30px 16px',
          }}>
            {/* Row: Section label + progress % */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: 'rgba(255,255,255,0.99)' }}>Section 1 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>14% complete</span>
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '14%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>

            {/* Section name */}
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>
              Personal Background
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ padding: '0px 51px 60px' }}>
          <div style={{
            background: 'rgba(13, 19, 56, 0.4)',
            border: '0.89px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: '32.89px 32.89px 0.89px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}>

            {/* Section heading */}
            <div>
              <h2 style={{
                fontFamily: 'Arimo, Arial', fontWeight: 700,
                fontSize: '20px', lineHeight: '30px',
                color: '#FFFFFF', margin: '0 0 4px 0', textAlign: 'center',
              }}>
                Personal Information
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '20px',
                color: '#FFFFFF', margin: 0, textAlign: 'center',
              }}>
                Basic information about you
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Last Name */}
              <Field label="Last Name *">
                <TextInput placeholder="e.g. Dela Cruz" value={form.lastName} onChange={set('lastName')} />
              </Field>

              {/* First Name + Middle Name */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <Field label="First Name *">
                  <TextInput placeholder="e.g. Juan" value={form.firstName} onChange={set('firstName')} />
                </Field>
                <Field label="Middle Name *">
                  <TextInput placeholder="e.g. Mercado" value={form.middleName} onChange={set('middleName')} />
                </Field>
              </div>

              {/* Student Number */}
              <Field label="Student Number *">
                <TextInput placeholder="e.g. 2023-123456" value={form.studentNumber} onChange={set('studentNumber')} />
              </Field>

              {/* Gender */}
              <Field label="Gender *">
                <RadioGroup
                  options={['Male', 'Female', 'Prefer not to say']}
                  value={form.gender}
                  onChange={setRadio('gender')}
                />
              </Field>

              {/* Birthday */}
              <Field label="Birthday *">
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={set('birthday')}
                    style={{
                      ...inputStyle,
                      colorScheme: 'dark',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                  />
                </div>
              </Field>

              {/* Civil Status */}
              <Field label="Civil Status *">
                <RadioGroup
                  options={['Single', 'Married', 'Widowed']}
                  value={form.civilStatus}
                  onChange={setRadio('civilStatus')}
                />
              </Field>

              {/* Street Address */}
              <Field label="Street Address *">
                <TextInput placeholder="e.g. Blk 123 Lot 456 AlumnAI St." value={form.streetAddress} onChange={set('streetAddress')} />
              </Field>

              {/* City + Province */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <Field label="City *">
                  <TextInput placeholder="e.g. Dasmariñas" value={form.city} onChange={set('city')} />
                </Field>
                <Field label="Province *">
                  <TextInput placeholder="e.g. Cavite" value={form.province} onChange={set('province')} />
                </Field>
              </div>

              {/* ZIP Code + Country */}
              <div style={{ display: 'flex', gap: '24px' }}>
                <Field label="ZIP Code *">
                  <TextInput placeholder="e.g. 4114" value={form.zipCode} onChange={set('zipCode')} />
                </Field>
                <Field label="Country *">
                  <select
                    value={form.country}
                    onChange={set('country')}
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      cursor: 'pointer',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                  >
                    <option value="" disabled style={{ background: '#001947' }}>Select</option>
                    <option value="Philippines" style={{ background: '#001947' }}>Philippines</option>
                    <option value="United States" style={{ background: '#001947' }}>United States</option>
                    <option value="Other" style={{ background: '#001947' }}>Other</option>
                  </select>
                </Field>
              </div>

              {/* Contact Number */}
              <Field label="Contact Number *">
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '58px', height: '47px', flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.17)',
                    border: '0.89px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>+63</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 912-345-6789"
                    value={form.contactNumber}
                    onChange={set('contactNumber')}
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                  />
                </div>
              </Field>

              {/* Personal Email */}
              <Field label="Personal Email Address *">
                <TextInput type="email" placeholder="e.g. juandelacruz@gmail.com" value={form.email} onChange={set('email')} />
              </Field>

            </div>

            {/* Footer: Next button */}
            <div style={{
              borderTop: '0.89px solid rgba(255,255,255,0.06)',
              paddingTop: '32px',
              paddingBottom: '32px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => navigate('/survey/educational-background')}
                style={{
                  width: '88px', height: '45px',
                  background: '#0028FF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Arimo, Arial', fontWeight: 400,
                  fontSize: '14px', color: '#FFFFFF',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,40,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = '#0028FF'}
              >
                Next
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBackground;