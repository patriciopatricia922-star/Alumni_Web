import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// ─── Shared Styles ───────────────────────────────────────────────────────────

const labelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '20px',
  color: '#FFFFFF',
};

const questionLabelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '21px',
  color: 'rgba(255, 255, 255, 0.7)',
};

const radioOptionStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '21px',
  color: 'rgba(255, 255, 255, 0.7)',
};

const inputStyle = {
  width: '100%',
  height: '46.78px',
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

// ─── Radio Option Component ───────────────────────────────────────────────────

const RadioOption = ({ name, value, checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      style={{ width: '16px', height: '16px', accentColor: '#51A2FF', cursor: 'pointer', flexShrink: 0 }}
    />
    <span style={radioOptionStyle}>{label}</span>
  </label>
);

// ─── Checkbox Option Component ────────────────────────────────────────────────

const CheckboxOption = ({ name, value, checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: 'pointer' }}>
    <input
      type="checkbox"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      style={{ width: '16px', height: '16px', accentColor: '#51A2FF', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
    />
    <span style={radioOptionStyle}>{label}</span>
  </label>
);

// ─── Select Dropdown Component ────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  'Agriculture, Forestry and Fishing',
  'Mining and Quarrying',
  'Manufacturing',
  'Electricity, Gas, Steam and Air Conditioning Supply',
  'Water Supply, Sewerage and Waste Management',
  'Construction',
  'Wholesale and Retail Trade',
  'Transportation and Storage',
  'Accommodation and Food Service Activities',
  'Information and Communication Technology (ICT)',
  'Financial and Insurance Activities',
  'Real Estate Activities',
  'Professional, Scientific and Technical Activities',
  'Administrative and Support Service Activities',
  'Public Administration and Defence',
  'Education',
  'Human Health and Social Work Activities',
  'Arts, Entertainment and Recreation',
  'Other Service Activities',
  'Other',
];

const SelectDropdown = ({ value, onChange, placeholder = 'Select' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', height: '47px',
          background: 'rgba(255, 255, 255, 0.17)',
          border: '0.89px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '10px', padding: '13px 15px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', boxSizing: 'border-box',
        }}
      >
        <span style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: value ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }}>
          {value || placeholder}
        </span>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M1 1L7.5 9L14 1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#011C50', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px', maxHeight: '260px', overflowY: 'auto', zIndex: 200,
        }}>
          {INDUSTRY_OPTIONS.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '10px 15px', fontFamily: 'Arimo, Arial', fontSize: '14px',
                color: value === opt ? '#51A2FF' : 'rgba(255,255,255,0.85)',
                background: value === opt ? 'rgba(81,162,255,0.1)' : 'transparent', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(81,162,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = value === opt ? 'rgba(81,162,255,0.1)' : 'transparent'}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Field Wrapper ────────────────────────────────────────────────────────────

const Field = ({ label, children, gap = '12px' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }}>
    <span style={labelStyle}>{label}</span>
    {children}
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const EMPLOYMENT_STATUSES_COL1 = [
  'Employed Full-time',
  'Employed Part-time',
  'Self-employed / Freelancer',
  'Government Employee',
];

const EMPLOYMENT_STATUSES_COL2 = [
  'Working Student',
  'OFW (Overseas Filipino Worker)',
  'Unemployed',
];

const REASONS_FOR_JOB = [
  'Salaries and benefits',
  'Career challenge',
  'Related to special Skill',
  'Related to course or Program of Study',
  'Proximity of residence',
  'Peer influence',
  'Family influence',
  'Other',
];

const UNEMPLOYED_REASONS = [
  'Pursuing further Studies',
  'Family responsibilities or Personal Matters',
  'Health-related reasons',
  'Lack of job Opportunities Related to the Field of Study',
  'Lack of job Placement Results or Hiring Process',
  'Currently seeking Better Employment Opportunities',
  'Started a personal Business or Freelance Work (Not Yet Stable)',
  'Relocation or migration Plans',
  'Lack of work Experience or Qualifications Required by Employers',
  'Taking a break or Resting Before Seeking Employment',
  'Reviewing for board Examination',
  'Other',
];

const MONTHLY_INCOME = [
  'Below ₱10,000',
  '₱10,000 - ₱20,000',
  '₱20,001 - ₱40,000',
  'Above ₱40,000',
];

const EMPLOYED_STATUSES = [
  'Employed Full-time',
  'Employed Part-time',
  'Self-employed / Freelancer',
  'Government Employee',
  'Working Student',
  'OFW (Overseas Filipino Worker)',
];

// ─── Main Component ───────────────────────────────────────────────────────────

const EmploymentInformation = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobRelatedToDegree: '',
    employmentStatus: '',
    jobPosition: '',
    companyName: '',
    typeOfIndustry: '',
    locationOfEmployment: '',
    monthlyIncome: '',
    reasonsForJob: [],
    reasonsUnemployed: '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleReasonForJob = (reason) => {
    setForm(prev => {
      const current = prev.reasonsForJob;
      return {
        ...prev,
        reasonsForJob: current.includes(reason)
          ? current.filter(r => r !== reason)
          : [...current, reason],
      };
    });
  };

  const isEmployed = EMPLOYED_STATUSES.includes(form.employmentStatus);
  const isUnemployed = form.employmentStatus === 'Unemployed';
  const showEmployedFields = form.employmentStatus !== '' && isEmployed;
  const showUnemployedFields = form.employmentStatus !== '' && isUnemployed;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ marginLeft: '229px', flex: 1, position: 'relative' }}>

        {/* Sticky Header — top bar + survey title + progress banner all sticky together */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#002263', paddingBottom: '16px' }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 51px 0px' }}>
            <button
              onClick={() => navigate('/survey/certification-achievement')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </button>
            <div style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              border: '1.24px solid rgba(99,102,241,0.3)',
              borderRadius: '999px', padding: '7px 20px',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>ALUMNI STATUS</span>
            </div>
            <button style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
              border: '1.24px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
              </div>
            </button>
          </div>

          {/* Survey Title */}
          <div style={{ textAlign: 'center', padding: '16px 51px 0px' }}>
            <h1 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '28px', lineHeight: '42px', letterSpacing: '-0.7px', color: '#FFFFFF', margin: 0 }}>
              Alumni Tracer Survey
            </h1>
          </div>

          {/* Progress Banner */}
          <div style={{ margin: '12px 51px 0px', background: '#001743', border: '1px solid #01122F', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)', borderRadius: '16px', padding: '18px 30px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: 'rgba(255,255,255,0.99)' }}>Section 4 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>57% complete</span>
            </div>
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '57%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>Employment Information</span>
          </div>

        </div>{/* end sticky */}

        {/* Form Card */}
        <div style={{ padding: '0px 51px 60px' }}>
          <div style={{
            background: 'rgba(13, 19, 56, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: '32.89px 32.89px 0.89px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}>

            {/* Section heading */}
            <div>
              <h2 style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '20px', lineHeight: '30px', color: '#FFFFFF', margin: '0 0 4px 0' }}>
                Employment Information
              </h2>
              <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Informations related to your job
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Q1: Job related to degree */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={questionLabelStyle}>Is your current job related to your degree? *</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  {['Yes', 'No'].map(opt => (
                    <RadioOption key={opt} name="jobRelatedToDegree" value={opt}
                      checked={form.jobRelatedToDegree === opt}
                      onChange={v => set('jobRelatedToDegree', v)} label={opt} />
                  ))}
                </div>
              </div>

              {/* Q2: Current Employment Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={labelStyle}>Current Employment Status *</span>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                    {EMPLOYMENT_STATUSES_COL1.map(opt => (
                      <RadioOption key={opt} name="employmentStatus" value={opt}
                        checked={form.employmentStatus === opt}
                        onChange={v => setForm(prev => ({ ...prev, employmentStatus: v, jobPosition: '', companyName: '', typeOfIndustry: '', locationOfEmployment: '', monthlyIncome: '', reasonsForJob: [], reasonsUnemployed: '' }))}
                        label={opt} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                    {EMPLOYMENT_STATUSES_COL2.map(opt => (
                      <RadioOption key={opt} name="employmentStatus" value={opt}
                        checked={form.employmentStatus === opt}
                        onChange={v => setForm(prev => ({ ...prev, employmentStatus: v, jobPosition: '', companyName: '', typeOfIndustry: '', locationOfEmployment: '', monthlyIncome: '', reasonsForJob: [], reasonsUnemployed: '' }))}
                        label={opt} />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* ── Employed Branch ─────────────────────────────────────────────── */}
            {showEmployedFields && (
              <div style={{ borderTop: '0.89px solid rgba(255,255,255,0.06)', paddingTop: '16.89px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                <Field label="Job position *">
                  <input type="text" placeholder="Enter your answer" value={form.jobPosition}
                    onChange={e => set('jobPosition', e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} />
                </Field>

                <Field label="Name of company / Employer *">
                  <input type="text" placeholder="Enter your answer" value={form.companyName}
                    onChange={e => set('companyName', e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} />
                </Field>

                <Field label="Type of industry *">
                  <SelectDropdown value={form.typeOfIndustry} onChange={v => set('typeOfIndustry', v)} placeholder="Select" />
                </Field>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={labelStyle}>Location of employment *</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {['Local', 'Abroad'].map(opt => (
                      <RadioOption key={opt} name="locationOfEmployment" value={opt}
                        checked={form.locationOfEmployment === opt} onChange={v => set('locationOfEmployment', v)} label={opt} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={labelStyle}>Monthly income Range *</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {MONTHLY_INCOME.map(opt => (
                      <RadioOption key={opt} name="monthlyIncome" value={opt}
                        checked={form.monthlyIncome === opt} onChange={v => set('monthlyIncome', v)} label={opt} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={labelStyle}>Reasons for accepting the Job *</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
                    {REASONS_FOR_JOB.map(reason => (
                      <CheckboxOption key={reason} name="reasonsForJob" value={reason}
                        checked={form.reasonsForJob.includes(reason)} onChange={toggleReasonForJob} label={reason} />
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── Unemployed Branch ───────────────────────────────────────────── */}
            {showUnemployedFields && (
              <div style={{ borderTop: '0.89px solid rgba(255,255,255,0.06)', paddingTop: '16.89px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={labelStyle}>Reasons of being Unemployed *</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '34px' }}>
                  {UNEMPLOYED_REASONS.map(reason => (
                    <RadioOption key={reason} name="reasonsUnemployed" value={reason}
                      checked={form.reasonsUnemployed === reason} onChange={v => set('reasonsUnemployed', v)} label={reason} />
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: '32px', paddingBottom: '33px',
              borderTop: '0.89px solid rgba(255,255,255,0.06)',
            }}>
              <button
                onClick={() => navigate('/survey/certification-achievement')}
                style={{ width: '88px', height: '45px', background: '#FFFFFF', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)', borderRadius: '10px', border: 'none', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#090909', cursor: 'pointer' }}
              >
                Previous
              </button>
              <button
                onClick={() => navigate('/survey/job-experience')}
                style={{ width: '88px', height: '45px', background: '#0028FF', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)', borderRadius: '10px', border: 'none', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#FFFFFF', cursor: 'pointer' }}
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

export default EmploymentInformation;