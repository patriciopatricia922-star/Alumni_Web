import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

// ─── Responsive hook ──────────────────────────────────────────────────────────
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};


// ─── Shared Styles ────────────────────────────────────────────────────────────

const questionLabelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '21px',
  color: 'rgba(255, 255, 255, 0.7)',
};

const skillLabelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '21px',
  color: '#FFFFFF',
};

const radioOptionStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '21px',
  color: 'rgba(255, 255, 255, 0.7)',
};

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

// ─── Star Rating Component ────────────────────────────────────────────────────

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '25px', padding: '4px 0' }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hovered || value);
        return (
          <div
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="35" height="35" viewBox="0 0 24 24" fill={filled ? '#51A2FF' : '#D9D9D9'}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

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
    <span style={questionLabelStyle}>{label}</span>
    {children}
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPETENCIES_OPTIONS = [
  'Communication skills',
  'Information to technology Skills',
  'Leadership skills',
  'Critical & Problem-Solving skills',
  'Work Ethics/Professionalism',
  'Other',
];

const SKILL_RATINGS = [
  'Communication skills',
  'Information to technology Skills',
  'Leadership skills',
  'Critical & Problem-Solving skills',
  'Work Ethics/Professionalism skills',
];

// ─── Main Component ───────────────────────────────────────────────────────────

const SkillsAndCompetencies = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const hPad = isMobile ? '20px' : isTablet ? '32px' : '51px';
  const cardPad = isMobile ? '24px 20px' : isTablet ? '28px 28px' : '40px 40px';

  const [form, setForm] = useState({
    usefulCompetencies: [],
    skillRatings: {
      'Communication skills': 0,
      'Information to technology Skills': 0,
      'Leadership skills': 0,
      'Critical & Problem-Solving skills': 0,
      'Work Ethics/Professionalism skills': 0,
    },
    skillsToDevlop: '',
  })

  // Load saved form data on mount
  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('skills_competencies');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);;

  const toggleCompetency = (value) => {
    setForm(prev => {
      const current = prev.usefulCompetencies;
      return {
        ...prev,
        usefulCompetencies: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  const setSkillRating = (skill, rating) => {
    setForm(prev => ({
      ...prev,
      skillRatings: { ...prev.skillRatings, [skill]: rating },
    }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ marginLeft: isMobile ? 0 : '229px', flex: 1, position: 'relative', overflowY: 'auto', height: '100vh', paddingBottom: isMobile ? '90px' : '0px' }}>

        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: '#002263', paddingBottom: '16px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${isMobile ? '20px' : '30px'} ${hPad} 0px` }}>
            <button
              onClick={() => navigate('/survey/job-experience')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </button>
            {!isMobile && (
              <div style={{
                background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1.24px solid rgba(99,102,241,0.3)',
                borderRadius: '999px', padding: '7px 20px',
              }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>Alumni Status</span>
              </div>
            )}
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
          <div style={{ textAlign: 'center', padding: `${isMobile ? '14px' : '16px'} ${hPad} 0px` }}>
            <h1 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: isMobile ? '22px' : '28px', lineHeight: '42px', letterSpacing: '-0.7px', color: '#FFFFFF', margin: 0 }}>
              Alumni Tracer Survey
            </h1>
          </div>
          {/* Progress Banner */}
          <div style={{ margin: `12px ${hPad} 0px`, background: '#001743', border: '1px solid #01122F', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)', borderRadius: '16px', padding: isMobile ? '14px 18px 12px' : '18px 30px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: isMobile ? '13px' : '16px', color: 'rgba(255,255,255,0.99)' }}>Section 6 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: isMobile ? '13px' : '17px', color: 'rgba(255,255,255,0.99)' }}>86% complete</span>
            </div>
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '86%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: isMobile ? '13px' : '17px', color: 'rgba(255,255,255,0.99)' }}>Skills and competencies</span>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ padding: `0px ${hPad} 60px` }}>
          <div style={{
            background: 'rgba(13, 19, 56, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: cardPad,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '24px' : '32px',
          }}>

            {/* Title */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'Arimo, Arial', fontWeight: 700,
                fontSize: isMobile ? '18px' : '20px',
                lineHeight: '30px', color: '#FFFFFF', margin: '0 0 6px 0',
              }}>
                Skills and competencies
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '20px',
                color: 'rgba(255,255,255,0.6)', margin: 0,
              }}>
                Your workplace skills
              </p>
            </div>
            {/* Divider */}
            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '32px' }} />

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Q1 - Useful Competencies (checkbox) */}
              <QuestionBlock
                label="What are the competencies learned in college did you find very useful? *"
                borderTop={false}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {COMPETENCIES_OPTIONS.map(opt => (
                    <CheckboxOption
                      key={opt}
                      value={opt}
                      checked={form.usefulCompetencies.includes(opt)}
                      onChange={toggleCompetency}
                      label={opt}
                    />
                  ))}
                </div>
              </QuestionBlock>

              {/* Q2 - Skill Ratings */}
              <div style={{
                borderTop: '0.89px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '24.89px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                width: '100%',
              }}>
                {SKILL_RATINGS.map(skill => (
                  <div key={skill} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={skillLabelStyle}>{skill} *</span>
                    <StarRating
                      value={form.skillRatings[skill]}
                      onChange={rating => setSkillRating(skill, rating)}
                    />
                  </div>
                ))}
              </div>

              {/* Q3 - Skills to Develop (textarea) */}
              <div style={{
                borderTop: '0.89px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '24.89px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
              }}>
                <span style={questionLabelStyle}>
                  What other skills should NU Dasma develop in students to make them more employable? *
                </span>
                <textarea
                  placeholder="Enter your answer"
                  value={form.skillsToDevelop}
                  onChange={e => setForm(prev => ({ ...prev, skillsToDevelop: e.target.value }))}
                  style={{
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
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
              </div>

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
                onClick={() => navigate('/survey/job-experience')}
                style={{
                  width: isMobile ? '100px' : '120px', height: '48px',
                  background: '#FFFFFF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px', border: 'none',
                  fontFamily: 'Arimo, Arial', fontSize: '15px', fontWeight: 600, color: '#090909',
                  cursor: 'pointer',
                }}
              >
                Previous
              </button>
              <button
                onClick={() => saveSectionProgress('skills_competencies', form).then(() => navigate('/survey/feedback'))}
                style={{
                  width: isMobile ? '100px' : '120px', height: '48px',
                  background: '#0028FF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px', border: 'none',
                  fontFamily: 'Arimo, Arial', fontSize: '15px', fontWeight: 600, color: '#FFFFFF',
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

export default SkillsAndCompetencies;