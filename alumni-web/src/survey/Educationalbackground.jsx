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
  height: '100px',
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
  color: 'rgba(255, 255, 255, 0.9)',
};

const subLabelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '13px',
  lineHeight: '18px',
  letterSpacing: '0.3px',
  textTransform: 'uppercase',
  color: 'rgba(255, 255, 255, 0.6)',
};

const Field = ({ label, sub = false, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
    <label style={sub ? subLabelStyle : labelStyle}>{label}</label>
    {children}
  </div>
);

const TextInput = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={inputStyle}
    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
  />
);

const TextArea = ({ placeholder, value, onChange }) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={textAreaStyle}
    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
  />
);

const RadioGroup = ({ name, options, value, onChange, gap = 9 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
    {options.map(opt => (
      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 0' }}>
        <input
          type="radio"
          name={name}
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
          style={{ width: '18px', height: '18px', accentColor: '#51A2FF', cursor: 'pointer', flexShrink: 0 }}
        />
        <span style={{ ...labelStyle, fontSize: '14px', fontWeight: 400 }}>{opt}</span>
      </label>
    ))}
  </div>
);

const SelectInput = ({ value, onChange, options, placeholder = 'Select' }) => (
  <div style={{ position: 'relative', width: '100%' }}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        ...inputStyle,
        appearance: 'none',
        WebkitAppearance: 'none',
        cursor: 'pointer',
        color: value ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o} style={{ background: '#001743', color: '#fff' }}>
          {o.label ?? o}
        </option>
      ))}
    </select>
    <svg
      style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      width="15" height="11" viewBox="0 0 15 11" fill="none"
    >
      <path d="M7.5 11L0 0H15L7.5 11Z" fill="white" />
    </svg>
  </div>
);

const DEGREE_OPTIONS = [
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Nursing',
  'Bachelor of Science in Education',
  'Bachelor of Arts',
  'Bachelor of Engineering',
  'Other',
];

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = 2025 + i;
  return { value: String(y), label: String(y) };
});

const DISTINCTION_OPTIONS = [
  { value: 'Summa Cum Laude', label: 'Summa Cum Laude' },
  { value: 'Magna Cum Laude', label: 'Magna Cum Laude' },
  { value: 'Cum Laude', label: 'Cum Laude' },
  { value: 'With Honors', label: 'With Honors' },
  { value: 'None', label: 'None' },
];

const EducationalBackground = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const sidebarWidth = 229;
  const hPad = isMobile ? '20px' : isTablet ? '32px' : '51px';
  const cardPad = isMobile ? '24px 20px' : isTablet ? '28px 28px' : '40px 40px';

  const [form, setForm] = useState({
    degreeProgram: '',
    reasonForCourse: '',
    yearGraduated: '',
    distinction: '',
    postGradPlans: '',
    postGradCourse: '',
    licensureReviewing: '',
    licensurePlans: '',
    licensureReason: '',
    boardExamName: '',
    boardExamDate: '',
    boardExamResult: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('educational_background');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  const showPostGradCourse = form.postGradPlans === 'Yes';
  const showLicensureBranch = form.licensureReviewing === 'Yes';
  const showBoardExam = showLicensureBranch && (form.licensurePlans === 'Yes' || form.licensurePlans === 'Already taken');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>
      {!isMobile && <Sidebar />}
      {isMobile && <Sidebar />}

      {/* Main Content */}
      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        position: 'relative',
        paddingBottom: isMobile ? '90px' : '0px',
      }}>

        {/* Sticky Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: '#002263',
          paddingBottom: '16px',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${isMobile ? '20px' : '30px'} ${hPad} 0px`,
          }}>
            {/* Back */}
            <button
              onClick={() => navigate('/dashboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
            </button>

            {/* Alumni Status badge — hide on mobile to save space */}
            {!isMobile && (
              <div style={{
                background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                border: '1.24px solid rgba(99,102,241,0.3)',
                borderRadius: '999px',
                padding: '7px 20px',
              }}>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>
                  Alumni Status
                </span>
              </div>
            )}

            {/* Notification Bell */}
            <button style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
              border: '1.24px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', flexShrink: 0,
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
          <div style={{ textAlign: 'center', padding: `${isMobile ? '14px' : '16px'} ${hPad} 0px` }}>
            <h1 style={{
              fontFamily: 'Arimo, Arial', fontWeight: 700,
              fontSize: isMobile ? '22px' : isTablet ? '25px' : '28px',
              lineHeight: '42px', letterSpacing: '-0.7px',
              color: '#FFFFFF', margin: 0,
            }}>
              Alumni Tracer Survey
            </h1>
          </div>

          {/* Progress Banner */}
          <div style={{
            margin: `12px ${hPad} 0px`,
            background: '#001743',
            border: '1px solid #01122F',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: isMobile ? '14px 18px 12px' : '18px 30px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: isMobile ? '13px' : '16px', color: 'rgba(255,255,255,0.99)' }}>Section 2 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: isMobile ? '13px' : '17px', color: 'rgba(255,255,255,0.99)' }}>29% complete</span>
            </div>
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '29%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: isMobile ? '13px' : '17px', color: 'rgba(255,255,255,0.99)' }}>
              Educational Background
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ padding: `0px ${hPad} 60px` }}>
          <div style={{
            background: 'rgba(13, 19, 56, 0.4)',
            border: '0.89px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            borderRadius: '16px',
            padding: cardPad,
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
          }}>

            {/* Section heading */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'Arimo, Arial', fontWeight: 700,
                fontSize: isMobile ? '18px' : '20px',
                lineHeight: '30px', color: '#FFFFFF', margin: '0 0 6px 0',
              }}>
                Educational Background
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '20px',
                color: 'rgba(255,255,255,0.6)', margin: 0,
              }}>
                Your academic background
              </p>
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '32px' }} />

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '28px' : '36px' }}>

              <Field label="Degree Program Completed *">
                <SelectInput
                  value={form.degreeProgram}
                  onChange={v => set('degreeProgram', v)}
                  options={DEGREE_OPTIONS}
                />
              </Field>

              <Field label="Reason(s) of taking the course *">
                <TextArea
                  placeholder="Enter your answer"
                  value={form.reasonForCourse}
                  onChange={e => set('reasonForCourse', e.target.value)}
                />
              </Field>

              <Field label="Year Graduated *">
                <SelectInput
                  value={form.yearGraduated}
                  onChange={v => set('yearGraduated', v)}
                  options={YEAR_OPTIONS}
                />
              </Field>

              <Field label="Distinction Received *">
                <SelectInput
                  value={form.distinction}
                  onChange={v => set('distinction', v)}
                  options={DISTINCTION_OPTIONS}
                />
              </Field>

              <Field label="Do you have plans on taking a post-graduate studies? *">
                <RadioGroup
                  name="postGradPlans"
                  options={['Yes', 'No']}
                  value={form.postGradPlans}
                  onChange={v => set('postGradPlans', v)}
                />
              </Field>

              {showPostGradCourse && (
                <Field label="If yes, what course?" sub>
                  <TextArea
                    placeholder="Enter your answer"
                    value={form.postGradCourse}
                    onChange={e => set('postGradCourse', e.target.value)}
                  />
                </Field>
              )}

              <Field label="Are you currently taking/reviewing for licensure examination? *">
                <RadioGroup
                  name="licensureReviewing"
                  options={['Yes', 'No', 'Not applicable']}
                  value={form.licensureReviewing}
                  onChange={v => {
                    setForm(prev => ({
                      ...prev,
                      licensureReviewing: v,
                      licensurePlans: '',
                      licensureReason: '',
                      boardExamName: '',
                      boardExamDate: '',
                      boardExamResult: '',
                    }));
                  }}
                />
              </Field>

              {showLicensureBranch && (
                <Field label="Do you have any plans on taking licensure examination?" sub>
                  <RadioGroup
                    name="licensurePlans"
                    options={['Yes', 'No', 'Already taken', 'Not applicable']}
                    value={form.licensurePlans}
                    onChange={v => {
                      setForm(prev => ({
                        ...prev,
                        licensurePlans: v,
                        boardExamName: '',
                        boardExamDate: '',
                        boardExamResult: '',
                      }));
                    }}
                    gap={13}
                  />
                </Field>
              )}

              {showLicensureBranch && (
                <Field label="Reason(s) for not taking or taking licensure examination *" sub>
                  <TextArea
                    placeholder="Enter your answer"
                    value={form.licensureReason}
                    onChange={e => set('licensureReason', e.target.value)}
                  />
                </Field>
              )}

              {showBoardExam && (
                <>
                  <Field label="Name of board/licensure examination *" sub>
                    <TextInput
                      placeholder="Enter your answer"
                      value={form.boardExamName}
                      onChange={e => set('boardExamName', e.target.value)}
                    />
                  </Field>

                  <Field label="Date taken/date of examination *" sub>
                    <input
                      type="date"
                      value={form.boardExamDate}
                      onChange={e => set('boardExamDate', e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    />
                  </Field>

                  <Field label="Results *" sub>
                    <RadioGroup
                      name="boardExamResult"
                      options={['Passed', 'Failed', 'Pending', 'Not yet taken']}
                      value={form.boardExamResult}
                      onChange={v => set('boardExamResult', v)}
                      gap={15}
                    />
                  </Field>
                </>
              )}

            </div>

            {/* Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '40px',
              paddingBottom: '8px',
              marginTop: '40px',
              borderTop: '0.89px solid rgba(255,255,255,0.06)',
            }}>
              <button
                onClick={() => navigate('/survey/personal-background')}
                style={{
                  width: isMobile ? '100px' : '120px',
                  height: '48px',
                  background: '#FFFFFF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px', border: 'none',
                  fontFamily: 'Arimo, Arial', fontSize: '15px', fontWeight: 600,
                  color: '#090909', cursor: 'pointer',
                }}
              >
                Previous
              </button>
              <button
                onClick={() => saveSectionProgress('educational_background', form).then(() => navigate('/survey/certification-achievement'))}
                style={{
                  width: isMobile ? '100px' : '120px',
                  height: '48px',
                  background: '#0028FF',
                  boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                  borderRadius: '10px', border: 'none',
                  fontFamily: 'Arimo, Arial', fontSize: '15px', fontWeight: 600,
                  color: '#FFFFFF', cursor: 'pointer',
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

export default EducationalBackground;