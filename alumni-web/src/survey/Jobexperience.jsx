import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

// ─── Shared Styles ────────────────────────────────────────────────────────────

const labelStyle = {
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

// ─── Radio Option Component ───────────────────────────────────────────────────

const RadioOption = ({ name, value, checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
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

const CheckboxOption = ({ value, checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
    <input
      type="checkbox"
      value={value}
      checked={checked}
      onChange={() => onChange(value)}
      style={{ width: '16px', height: '16px', accentColor: '#51A2FF', cursor: 'pointer', flexShrink: 0 }}
    />
    <span style={radioOptionStyle}>{label}</span>
  </label>
);

// ─── Question Block ───────────────────────────────────────────────────────────

const QuestionBlock = ({ label, children, borderTop = true }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    ...(borderTop ? {
      borderTop: '0.89px solid rgba(255, 255, 255, 0.06)',
      paddingTop: '24.89px',
    } : {}),
  }}>
    <span style={labelStyle}>{label}</span>
    {children}
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const LICENSURE_OPTIONS = [
  'Less than a month',
  '1-3 months',
  '4-6 months',
  '7-12 months',
  'More than a year',
  'Not applicable',
];

const EMPLOYMENT_DURATION_OPTIONS = [
  'Less than a month',
  '1-5 months',
  '7-11 months',
  '1 year or less than 2 years',
  '2 years or less than 3 years',
  '3 years or less than 4 years',
  'Other',
];

const FIRST_JOB_OPTIONS = [
  'Job/Career fair',
  'Internship/Absorption',
  'Referral',
  'Recommendation',
  'Walk-in applications',
  'Not applicable',
  'Other',
];

const FACTORS_OPTIONS = [
  'Academic performance',
  'Internship/On-the-job training',
  'Personal connections',
  'Skills/Competencies acquired in school',
  'Certifications',
  'Not applicable',
  'Other',
];

// ─── Main Component ───────────────────────────────────────────────────────────

const JobExperience = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    licensureReviewing: '',
    employmentDuration: '',
    firstJobSource: '',
    firstJobFactors: [],
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  // Load saved form data on mount
  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('job_experience');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  const toggleFactor = (factor) => {
    setForm(prev => {
      const current = prev.firstJobFactors;
      return {
        ...prev,
        firstJobFactors: current.includes(factor)
          ? current.filter(f => f !== factor)
          : [...current, factor],
      };
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ marginLeft: '229px', flex: 1, position: 'relative', overflowY: 'auto', height: '100vh' }}>

        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#002263', paddingBottom: '16px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 51px 0px' }}>
            <button
              onClick={() => navigate('/survey/employment-information')}
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
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: 'rgba(255,255,255,0.99)' }}>Section 5 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>71% complete</span>
            </div>
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '71%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>Job Experience</span>
          </div>
        </div>

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

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '20px', fontWeight: 400, color: '#FFFFFF', lineHeight: '30px' }}>
                Job search Experience
              </span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '20px' }}>
                Your job hunting experience
              </span>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Q1 - Licensure Examination */}
              <QuestionBlock label="Are you currently taking/reviewing for licensure examinations? *" borderTop={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {LICENSURE_OPTIONS.map(opt => (
                    <RadioOption
                      key={opt}
                      name="licensureReviewing"
                      value={opt}
                      checked={form.licensureReviewing === opt}
                      onChange={v => set('licensureReviewing', v)}
                      label={opt}
                    />
                  ))}
                </div>
              </QuestionBlock>

              {/* Q2 - Employment Duration */}
              <QuestionBlock label="How long have you been employed in your current job? *">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {EMPLOYMENT_DURATION_OPTIONS.map(opt => (
                    <RadioOption
                      key={opt}
                      name="employmentDuration"
                      value={opt}
                      checked={form.employmentDuration === opt}
                      onChange={v => set('employmentDuration', v)}
                      label={opt}
                    />
                  ))}
                </div>
              </QuestionBlock>

              {/* Q3 - First Job Source */}
              <QuestionBlock label="How did you find your first job? *">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {FIRST_JOB_OPTIONS.map(opt => (
                    <RadioOption
                      key={opt}
                      name="firstJobSource"
                      value={opt}
                      checked={form.firstJobSource === opt}
                      onChange={v => set('firstJobSource', v)}
                      label={opt}
                    />
                  ))}
                </div>
              </QuestionBlock>

              {/* Q4 - First Job Factors (checkbox) */}
              <QuestionBlock label="What factors helped you most in getting your first job? *">
                <span style={{
                  fontFamily: 'Arimo, Arial',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: '16px',
                  marginTop: '-4px',
                }}>
                  (Check all that apply)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {FACTORS_OPTIONS.map(opt => (
                    <CheckboxOption
                      key={opt}
                      value={opt}
                      checked={form.firstJobFactors.includes(opt)}
                      onChange={toggleFactor}
                      label={opt}
                    />
                  ))}
                </div>
              </QuestionBlock>

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
                onClick={() => navigate('/survey/employment-information')}
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
                onClick={() => saveSectionProgress('job_experience', form).then(() => navigate('/survey/skills-and-competencies'))}
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

export default JobExperience;