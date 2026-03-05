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
  color: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

const textAreaStyle = {
  width: '100%',
  height: '89px',
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

const subLabelStyle = {
  fontFamily: 'Arimo, Arial',
  fontWeight: 400,
  fontSize: '12px',
  lineHeight: '18px',
  letterSpacing: '0.3px',
  textTransform: 'uppercase',
  color: 'rgba(255, 255, 255, 0.7)',
};

const Field = ({ label, sub = false, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
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

  const showPostGradCourse = form.postGradPlans === 'Yes';
  const showLicensureBranch = form.licensureReviewing === 'Yes' || form.licensureReviewing === 'Reviewing';
  const showBoardExam = showLicensureBranch && (form.licensurePlans === 'Yes' || form.licensurePlans === 'Already taken');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263', fontFamily: 'Arimo, Arial' }}>
      <Sidebar />

      {/* Main Content — offset by sidebar width */}
      <div style={{ marginLeft: '229px', flex: 1, position: 'relative' }}>

        {/* Sticky Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: '#002263',
          paddingBottom: '16px',
        }}>
          {/* Top bar: Back + ALUMNI STATUS badge + Bell */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '30px 51px 0px',
          }}>
            {/* Back */}
            <button
              onClick={() => navigate('/survey')}
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
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '16px', color: 'rgba(255,255,255,0.99)' }}>Section 2 of 7</span>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>29% complete</span>
            </div>
            <div style={{ width: '100%', height: '11px', background: '#D9CA81', borderRadius: '10px', marginBottom: '10px' }}>
              <div style={{ width: '29%', height: '100%', background: '#51A2FF', borderRadius: '10px' }} />
            </div>
            <span style={{ fontFamily: 'Arimo, Arial', fontSize: '17px', color: 'rgba(255,255,255,0.99)' }}>
              Educational Background
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
                Educational Background
              </h2>
              <p style={{
                fontFamily: 'Arimo, Arial', fontWeight: 400,
                fontSize: '13px', lineHeight: '20px',
                color: '#FFFFFF', margin: 0, textAlign: 'center',
              }}>
                Your academic background
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

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
                  options={['Yes', 'No', 'Reviewing']}
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
              paddingTop: '32px',
              paddingBottom: '33px',
              borderTop: '0.89px solid rgba(255,255,255,0.06)',
            }}>
              <button
                onClick={() => navigate('/survey/personal-background')}
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
                onClick={() => navigate('/survey/certification-achievement')}
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

export default EducationalBackground;