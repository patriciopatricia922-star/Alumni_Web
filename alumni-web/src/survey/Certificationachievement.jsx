import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
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
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

const textAreaStyle = {
  width: '100%',
  height: '110px',
  background: 'rgba(255, 255, 255, 0.17)',
  border: '0.89px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '10px',
  padding: '12px 16px',
  fontFamily: 'Arimo, Arial',
  fontSize: '14px',
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
  resize: 'none',
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

const RadioGroup = ({ name, options, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
    {options.map(opt => (
      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
        <input
          type="radio"
          name={name}
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

// Multi-select dropdown for certifications
const CERTIFICATIONS = [
  'Microsoft Office Specialist (MOS) - Word',
  'Microsoft Office Specialist (MOS) - Excel',
  'Microsoft Office Specialist (MOS) - PowerPoint',
  'Microsoft Office Specialist (MOS) - Access',
  'Microsoft Office Specialist (MOS) - Outlook',
  'Microsoft Office Specialist Expert (MOS Expert) (advanced Word/Excel)',
  'Microsoft Certified Professional (MCP)',
  'Specialist Digital Marketing (SDM)',
  'Specialist Web Design (SWD)',
  'Adobe Certified Professional (ACP)',
  'Adobe Certified Associate (ACA) in Premiere Pro',
  'App Development with Swift - Associate',
  'Unity Certified User: Programmer',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Pro',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia WebMap',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Smart Client',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Transportation',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Covadis',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Grid',
  'Entrepreneurship and Small Business (ESB)',
  'IC3 GS5 (IC3 Global Standard 5 - Living Online, Key Applications, Computing Fundamentals)',
  'EUCIP (European Certification of IT Professionals)',
  'Autodesk Certified User / Professional - AutoCAD / Inventor / Revit / Fusion 360',
  'Cisco Certified Technician (CCT) / Cisco Certified Network Associate (CCNA)',
  'Cisco Career Support Associate (CCSA) - Entrepreneurship',
  'Cisco Certified Entry Networking Technician (CCENT)',
  'Linux Certification for Digital Marketing (LinuxCert)',
  'Communication Skills for Business (CSB)',
  'Entrepreneurship and Small Business Exam (ESB)',
  'CompTIA A+',
  'Project Management Institute (PMI) - Project Management Professional (PMP)',
  'EC-Council Certified Ethical Hacker (CEH) v11',
  'Scrum.org - Professional Scrum Master (PSM)',
  'Other',
];

const MultiSelectDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggle = (cert) => {
    if (value.includes(cert)) {
      onChange(value.filter(c => c !== cert));
    } else {
      onChange([...value, cert]);
    }
  };

  const displayText = value.length === 0
    ? 'Select a certification'
    : value.length === 1
      ? value[0].length > 45 ? value[0].slice(0, 45) + '…' : value[0]
      : `${value.length} certifications selected`;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderColor: open ? 'rgba(43,114,251,0.6)' : 'rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ color: value.length === 0 ? 'rgba(255,255,255,0.3)' : '#FFFFFF', fontSize: '14px', fontFamily: 'Arimo, Arial' }}>
          {displayText}
        </span>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M7.5 11L0 0H15L7.5 11Z" fill="white" />
        </svg>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#011C50',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          maxHeight: '280px',
          overflowY: 'auto',
          zIndex: 200,
          padding: '8px 0',
        }}>
          {CERTIFICATIONS.map(cert => (
            <label
              key={cert}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 16px',
                cursor: 'pointer',
                background: value.includes(cert) ? 'rgba(81,162,255,0.1)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = value.includes(cert) ? 'rgba(81,162,255,0.15)' : 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = value.includes(cert) ? 'rgba(81,162,255,0.1)' : 'transparent'}
            >
              <input
                type="checkbox"
                checked={value.includes(cert)}
                onChange={() => toggle(cert)}
                style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#51A2FF', flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', lineHeight: '18px', color: 'rgba(255,255,255,0.7)' }}>
                {cert}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CertificationAchievement = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    certiportPasser: '',
    certifications: [],
    helpedCareer: '',
    howHelped: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Load saved form data on mount
  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('certification_achievement');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  const showCertFields = form.certiportPasser === 'Yes';
  const showHowHelped = showCertFields && form.helpedCareer === 'Yes';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '229px', flex: 1, position: 'relative', overflowY: 'auto', height: '100vh' }}>

        {/* Sticky Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: '#002263',
          paddingBottom: '16px',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '30px 51px 0px',
          }}>
            {/* Back */}
            <button
              onClick={() => navigate('/survey/educational-background')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </button>

            {/* ALUMNI STATUS badge */}
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
              background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
              border: '1.24px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: 'rgba(255,255,255,0.99)' }}>Section 3 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>43% complete</span>
            </div>
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '43%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>
              Certification Achievement
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
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '20px', lineHeight: '30px',
                color: '#FFFFFF', margin: '0 0 4px 0', textAlign: 'center',
              }}>
                Certification Achievement
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '20px',
                color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center',
              }}>
                Certifications you have
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Q1: Certiport passer */}
              <Field label="Are you a certiport passer? *">
                <RadioGroup
                  name="certiportPasser"
                  options={['Yes', 'No']}
                  value={form.certiportPasser}
                  onChange={v => {
                    setForm(prev => ({
                      ...prev,
                      certiportPasser: v,
                      certifications: [],
                      helpedCareer: '',
                      howHelped: '',
                    }));
                  }}
                />
              </Field>

              {/* Branch: certification dropdown + career question */}
              {showCertFields && (
                <>
                  {/* Divider */}
                  <div style={{ borderTop: '0.89px solid rgba(255,255,255,0.06)', paddingTop: '4px' }} />

                  <Field label="Please specify any of certiport certification earned *">
                    <MultiSelectDropdown
                      value={form.certifications}
                      onChange={v => set('certifications', v)}
                    />
                  </Field>

                  {/* Selected tags */}
                  {form.certifications.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '-8px' }}>
                      {form.certifications.map(cert => (
                        <div key={cert} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(81,162,255,0.15)',
                          border: '1px solid rgba(81,162,255,0.3)',
                          borderRadius: '20px',
                          padding: '4px 10px',
                        }}>
                          <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#FFFFFF' }}>
                            {cert.length > 40 ? cert.slice(0, 40) + '…' : cert}
                          </span>
                          <button
                            onClick={() => set('certifications', form.certifications.filter(c => c !== cert))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '14px', padding: 0, lineHeight: 1 }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div style={{ borderTop: '0.89px solid rgba(255,255,255,0.06)', paddingTop: '4px' }} />

                  {/* Q2: Helped career */}
                  <Field label="Have your certifications helped you in your career? *">
                    <RadioGroup
                      name="helpedCareer"
                      options={['Yes', 'No']}
                      value={form.helpedCareer}
                      onChange={v => {
                        setForm(prev => ({ ...prev, helpedCareer: v, howHelped: '' }));
                      }}
                    />
                  </Field>

                  {/* Branch: how helped */}
                  {showHowHelped && (
                    <Field label="How have your certifications helped you? *">
                      <textarea
                        placeholder="Please describe how your certifications have helped your career"
                        value={form.howHelped}
                        onChange={e => set('howHelped', e.target.value)}
                        style={textAreaStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                      />
                    </Field>
                  )}
                </>
              )}

            </div>

            {/* Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '32px',
              paddingBottom: '33px',
              borderTop: '0.89px solid rgba(255,255,255,0.06)',
            }}>
              <button
                onClick={() => navigate('/survey/educational-background')}
                style={{
                  width: '88px', height: '45px',
                  background: '#FFFFFF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px', border: 'none',
                  fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#090909',
                  cursor: 'pointer',
                }}
              >
                Previous
              </button>
              <button
                onClick={() => saveSectionProgress('certification_achievement', form).then(() => navigate('/survey/employment-information'))}
                style={{
                  width: '88px', height: '45px',
                  background: '#0028FF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px', border: 'none',
                  fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#FFFFFF',
                  cursor: 'pointer',
                }}
                onMouseOver={e => e.target.style.opacity = '0.9'}
                onMouseOut={e => e.target.style.opacity = '1'}
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

export default CertificationAchievement;