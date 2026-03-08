import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ei-root {
    display: flex;
    min-height: 100vh;
    background: #002263;
    font-family: 'Arimo', Arial, sans-serif;
  }

  .ei-content {
    flex: 1;
    min-width: 0;
    margin-left: 229px;
  }

  /* ── Sticky header ── */
  .ei-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: #002263;
    padding-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .ei-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 51px 0;
  }

  .ei-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: #fff;
    flex-shrink: 0;
  }

  .ei-badge {
    background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
    border: 1.24px solid rgba(99,102,241,0.3);
    border-radius: 999px;
    padding: 7px 20px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: rgba(255,255,255,0.8);
    white-space: nowrap;
  }

  .ei-bell {
    width: 48px;
    height: 48px;
    background: rgba(15,22,66,0.1);
    border: 1.24px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }

  .ei-bell-dot {
    position: absolute;
    top: -4px; right: -4px;
    width: 20px; height: 20px;
    background: #2B72FB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 10px;
    color: #fff;
  }

  .ei-title {
    text-align: center;
    padding: 14px 51px 0;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.4;
    letter-spacing: -0.7px;
    color: #fff;
  }

  .ei-progress {
    margin: 12px 51px 0;
    background: #001743;
    border: 1px solid #01122F;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 18px 30px 16px;
  }

  .ei-progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 16px;
    color: rgba(255,255,255,0.99);
  }

  .ei-progress-track {
    width: 100%;
    height: 11px;
    background: #D9CA81;
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .ei-progress-fill {
    width: 57%;
    height: 100%;
    background: #51A2FF;
    border-radius: 10px;
  }

  .ei-progress-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 17px;
    color: rgba(255,255,255,0.99);
  }

  /* ── Body ── */
  .ei-body {
    padding: 24px 51px 60px;
  }

  /* ── Form card ── */
  .ei-card {
    background: rgba(13,19,56,0.4);
    border: 0.89px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 40px 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .ei-section-title {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.5;
    color: #fff;
    text-align: center;
  }

  .ei-section-sub {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: rgba(255,255,255,0.6);
    margin-top: 6px;
    text-align: center;
  }

  /* ── Fields ── */
  .ei-fields {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .ei-field {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .ei-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: rgba(255,255,255,0.7);
  }

  .ei-input {
    width: 100%;
    height: 47px;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.15s;
  }
  .ei-input:focus { border-color: rgba(43,114,251,0.6); }

  /* ── Radio & Checkbox ── */
  .ei-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .ei-radio-cols {
    display: flex;
    gap: 32px;
  }

  .ei-radio-col {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex: 1;
  }

  .ei-radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.4;
  }

  .ei-radio-label input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: #51A2FF;
    cursor: pointer;
    flex-shrink: 0;
  }

  .ei-checkbox-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 32px;
  }

  .ei-checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.4;
  }

  .ei-checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #51A2FF;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* ── Branch section ── */
  .ei-branch {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding-top: 16px;
  }

  /* ── Dropdown ── */
  .ei-dropdown {
    position: relative;
    width: 100%;
  }

  .ei-dropdown-trigger {
    width: 100%;
    height: 47px;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 0 16px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: border-color 0.15s;
    user-select: none;
  }
  .ei-dropdown-trigger.open { border-color: rgba(43,114,251,0.6); }

  .ei-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: #011C50;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    max-height: 260px;
    overflow-y: auto;
    z-index: 200;
  }

  .ei-dropdown-item {
    padding: 10px 16px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.85);
    cursor: pointer;
    transition: background 0.15s;
  }
  .ei-dropdown-item:hover    { background: rgba(81,162,255,0.08); }
  .ei-dropdown-item.selected { background: rgba(81,162,255,0.1); color: #51A2FF; }

  /* ── Footer — no divider ── */
  .ei-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .ei-btn-prev {
    width: 120px;
    height: 48px;
    background: #fff;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #090909;
    transition: opacity 0.15s;
  }
  .ei-btn-prev:hover { opacity: 0.85; }

  .ei-btn-next {
    width: 120px;
    height: 48px;
    background: #0028FF;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    transition: opacity 0.15s;
  }
  .ei-btn-next:hover { opacity: 0.9; }
  /* ── Required asterisk (red) ── */
  .ei-req { color: #F87171; font-weight: 700; margin-left: 2px; }

  /* ── Inline field error ── */
  .ei-field-error {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    color: #F87171;
    margin-left: 6px;
    font-weight: 400;
  }

  /* ══════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ══════════════════════════════════════════ */

  @media (max-width: 1100px) {
    .ei-topbar   { padding: 24px 32px 0; }
    .ei-title    { padding: 14px 32px 0; font-size: 26px; }
    .ei-progress { margin: 12px 32px 0; }
    .ei-body     { padding: 20px 32px 60px; }
    .ei-card     { padding: 32px 32px 28px; }
  }

  @media (max-width: 900px) {
    .ei-topbar   { padding: 20px 24px 0; }
    .ei-title    { padding: 12px 24px 0; font-size: 24px; }
    .ei-progress { margin: 10px 24px 0; }
    .ei-body     { padding: 18px 24px 60px; }
    .ei-card     { padding: 28px 24px 24px; gap: 24px; }
  }

  @media (max-width: 767px) {
    .ei-content        { margin-left: 0; }
    .ei-topbar         { padding: 20px 16px 0; }
    .ei-badge          { padding: 6px 12px; font-size: 10px; }
    .ei-bell           { display: none; }
    .ei-title          { padding: 12px 16px 0; font-size: 20px; }
    .ei-progress       { margin: 10px 16px 0; padding: 14px 16px; }
    .ei-progress-row   { font-size: 13px; }
    .ei-progress-label { font-size: 13px; }
    .ei-body           { padding: 16px 16px 80px; }
    .ei-card           { padding: 20px 16px 20px; gap: 20px; }
    .ei-section-title  { font-size: 17px; }
    .ei-radio-cols     { flex-direction: column; gap: 12px; }
    .ei-checkbox-grid  { grid-template-columns: 1fr; gap: 12px; }
    .ei-btn-prev       { width: 100px; height: 44px; font-size: 14px; }
    .ei-btn-next       { width: 100px; height: 44px; font-size: 14px; }
  }

  @media (max-width: 390px) {
    .ei-title    { font-size: 17px; }
    .ei-input    { font-size: 13px; }
    .ei-btn-prev, .ei-btn-next { width: 90px; font-size: 13px; }
  }

  @media (max-height: 600px) {
    .ei-header   { padding-bottom: 10px; }
    .ei-progress { padding: 10px 20px; }
    .ei-body     { padding-top: 14px; }
  }
`;

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

const SelectDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="ei-dropdown" ref={ref}>
      <div className={`ei-dropdown-trigger${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.3)' }}>{value || 'Select'}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M1 1L6 7L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <div className="ei-dropdown-menu">
          {INDUSTRY_OPTIONS.map(opt => (
            <div key={opt}
              className={`ei-dropdown-item${value === opt ? ' selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('employment_information');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  const toggleReasonForJob = (reason) => {
    setForm(prev => ({
      ...prev,
      reasonsForJob: prev.reasonsForJob.includes(reason)
        ? prev.reasonsForJob.filter(r => r !== reason)
        : [...prev.reasonsForJob, reason],
    }));
  };

  const resetEmploymentBranch = (v) =>
    setForm(prev => ({
      ...prev,
      employmentStatus: v,
      jobPosition: '', companyName: '', typeOfIndustry: '',
      locationOfEmployment: '', monthlyIncome: '',
      reasonsForJob: [], reasonsUnemployed: '',
    }));

  const isEmployed           = EMPLOYED_STATUSES.includes(form.employmentStatus);
  const isUnemployed         = form.employmentStatus === 'Unemployed';
  const showEmployedFields   = form.employmentStatus !== '' && isEmployed;
  const showUnemployedFields = form.employmentStatus !== '' && isUnemployed;

  const [errors, setErrors] = useState(new Set());
  const cardRef = useRef(null);

  const validate = () => {
    const e = new Set();
    if (!form.jobRelatedToDegree) e.add('jobRelatedToDegree');
    if (!form.employmentStatus)   e.add('employmentStatus');
    if (EMPLOYED_STATUSES.includes(form.employmentStatus)) {
      if (!form.jobPosition.trim())        e.add('jobPosition');
      if (!form.companyName.trim())        e.add('companyName');
      if (!form.typeOfIndustry)            e.add('typeOfIndustry');
      if (!form.locationOfEmployment)      e.add('locationOfEmployment');
      if (!form.monthlyIncome)             e.add('monthlyIncome');
      if (form.reasonsForJob.length === 0) e.add('reasonsForJob');
    }
    if (form.employmentStatus === 'Unemployed' && !form.reasonsUnemployed)
      e.add('reasonsUnemployed');
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress('employment_information', form)
      .then(() => navigate('/survey/job-experience'));
  };

  const onFocus = e => e.target.style.borderColor = 'rgba(43,114,251,0.6)';
  const onBlur  = e => e.target.style.borderColor = 'rgba(255,255,255,0.06)';

  return (
    <>
      <style>{STYLES}</style>

      <div className="ei-root">
        <Sidebar />

        <div className="ei-content">

          {/* ── Sticky Header ─────────────────────────────────────────── */}
          <div className="ei-header">

            <div className="ei-topbar">
              <button className="ei-back-btn"
                onClick={() => navigate('/survey/certification-achievement')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>

              <div className="ei-badge">Alumni Status</div>

              <button className="ei-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="ei-bell-dot">3</div>
              </button>
            </div>

            <h1 className="ei-title">Alumni Tracer Survey</h1>

            <div className="ei-progress">
              <div className="ei-progress-row">
                <span>Section 4 of 7</span>
                <span>57% complete</span>
              </div>
              <div className="ei-progress-track">
                <div className="ei-progress-fill" />
              </div>
              <span className="ei-progress-label">Employment Information</span>
            </div>

          </div>
          {/* ── End Sticky Header ─────────────────────────────────────── */}

          {/* ── Body ──────────────────────────────────────────────────── */}
          <div className="ei-body">
            <div className="ei-card" ref={cardRef}>

              {/* Section heading — no divider below */}
              <div>
                <h2 className="ei-section-title">Employment Information</h2>
                <p className="ei-section-sub">Information related to your job</p>
              </div>

              {/* Core fields */}
              <div className="ei-fields">

                {/* Q1: Job related to degree */}
                <div className="ei-field">
                  <span className="ei-label">Is your current job related to your degree? <span className="ei-req">*</span>{errors.has('jobRelatedToDegree') && <span className="ei-field-error">Required</span>}</span>
                  <div className="ei-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="ei-radio-label">
                        <input type="radio" name="jobRelatedToDegree" value={opt}
                          checked={form.jobRelatedToDegree === opt}
                          onChange={() => set('jobRelatedToDegree', opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q2: Employment status */}
                <div className="ei-field">
                  <span className="ei-label">Current Employment Status <span className="ei-req">*</span>{errors.has('employmentStatus') && <span className="ei-field-error">Required</span>}</span>
                  <div className="ei-radio-cols">
                    <div className="ei-radio-col">
                      {EMPLOYMENT_STATUSES_COL1.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="employmentStatus" value={opt}
                            checked={form.employmentStatus === opt}
                            onChange={() => resetEmploymentBranch(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <div className="ei-radio-col">
                      {EMPLOYMENT_STATUSES_COL2.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="employmentStatus" value={opt}
                            checked={form.employmentStatus === opt}
                            onChange={() => resetEmploymentBranch(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Employed branch ───────────────────────────────────── */}
              {showEmployedFields && (
                <div className="ei-branch">

                  <div className="ei-field">
                    <span className="ei-label">Job position <span className="ei-req">*</span>{errors.has('jobPosition') && <span className="ei-field-error">Required</span>}</span>
                    <input className="ei-input" type="text" placeholder="Enter your answer"
                      value={form.jobPosition}
                      onChange={e => set('jobPosition', e.target.value)}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>

                  <div className="ei-field">
                    <span className="ei-label">Name of company / employer <span className="ei-req">*</span>{errors.has('companyName') && <span className="ei-field-error">Required</span>}</span>
                    <input className="ei-input" type="text" placeholder="Enter your answer"
                      value={form.companyName}
                      onChange={e => set('companyName', e.target.value)}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>

                  <div className="ei-field">
                    <span className="ei-label">Type of industry <span className="ei-req">*</span>{errors.has('typeOfIndustry') && <span className="ei-field-error">Required</span>}</span>
                    <SelectDropdown value={form.typeOfIndustry} onChange={v => set('typeOfIndustry', v)} />
                  </div>

                  <div className="ei-field">
                    <span className="ei-label">Location of employment <span className="ei-req">*</span>{errors.has('locationOfEmployment') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group">
                      {['Local', 'Abroad'].map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="locationOfEmployment" value={opt}
                            checked={form.locationOfEmployment === opt}
                            onChange={() => set('locationOfEmployment', opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ei-field">
                    <span className="ei-label">Monthly income range <span className="ei-req">*</span>{errors.has('monthlyIncome') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group">
                      {MONTHLY_INCOME.map(opt => (
                        <label key={opt} className="ei-radio-label">
                          <input type="radio" name="monthlyIncome" value={opt}
                            checked={form.monthlyIncome === opt}
                            onChange={() => set('monthlyIncome', opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ei-field">
                    <span className="ei-label">Reasons for accepting the job <span className="ei-req">*</span>{errors.has('reasonsForJob') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-checkbox-grid">
                      {REASONS_FOR_JOB.map(reason => (
                        <label key={reason} className="ei-checkbox-label">
                          <input type="checkbox" value={reason}
                            checked={form.reasonsForJob.includes(reason)}
                            onChange={() => toggleReasonForJob(reason)} />
                          {reason}
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ── Unemployed branch ─────────────────────────────────── */}
              {showUnemployedFields && (
                <div className="ei-branch">
                  <div className="ei-field">
                    <span className="ei-label">Reasons of being unemployed <span className="ei-req">*</span>{errors.has('reasonsUnemployed') && <span className="ei-field-error">Required</span>}</span>
                    <div className="ei-radio-group" style={{ gap: '16px' }}>
                      {UNEMPLOYED_REASONS.map(reason => (
                        <label key={reason} className="ei-radio-label">
                          <input type="radio" name="reasonsUnemployed" value={reason}
                            checked={form.reasonsUnemployed === reason}
                            onChange={() => set('reasonsUnemployed', reason)} />
                          {reason}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer — no divider */}
              <div className="ei-footer">
                <button className="ei-btn-prev"
                  onClick={() => navigate('/survey/certification-achievement')}>
                  Previous
                </button>
                <button className="ei-btn-next" onClick={handleNext}>
                  Next
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default EmploymentInformation;