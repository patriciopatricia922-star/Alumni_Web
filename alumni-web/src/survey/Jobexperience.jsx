import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .je-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .je-content { flex: 1; min-width: 0; margin-left: 229px; }

  .je-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .je-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .je-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .je-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .je-bell { width: 48px; height: 48px; background: rgba(15,22,66,0.1); border: 1.24px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
  .je-bell-dot { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; }
  .je-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .je-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .je-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .je-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; }
  .je-progress-fill { width: 71%; height: 100%; background: #51A2FF; border-radius: 10px; }
  .je-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }

  .je-body { padding: 24px 51px 60px; }
  .je-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 40px; }
  .je-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .je-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }

  .je-questions { display: flex; flex-direction: column; gap: 40px; }
  .je-field { display: flex; flex-direction: column; gap: 14px; width: 100%; }
  .je-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7); }
  .je-hint { font-family: 'Arimo', Arial, sans-serif; font-size: 11px; color: rgba(255,255,255,0.4); line-height: 16px; margin-top: -4px; }

  .je-radio-group { display: flex; flex-direction: column; gap: 18px; padding-top: 8px; }
  .je-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .je-radio-label input[type="radio"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }
  .je-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .je-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }

  .je-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .je-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .je-btn-prev:hover { opacity: 0.85; }
  .je-btn-next { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .je-btn-next:hover { opacity: 0.9; }
  .je-other-input {
    width: 100%;
    height: 44px;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 10px 16px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    margin-top: 8px;
    transition: border-color 0.15s;
  }
  .je-other-input:focus { border-color: rgba(43,114,251,0.6); }
  .je-other-input::placeholder { color: rgba(255,255,255,0.3); }

  /* ── Required asterisk (red) ── */
  .je-req { color: #F87171; font-weight: 700; margin-left: 2px; }

  /* ── Inline field error ── */
  .je-field-error {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    color: #F87171;
    margin-left: 6px;
    font-weight: 400;
  }

  @media (max-width: 1100px) {
    .je-topbar { padding: 24px 32px 0; } .je-title { padding: 14px 32px 0; font-size: 26px; }
    .je-progress { margin: 12px 32px 0; } .je-body { padding: 20px 32px 60px; } .je-card { padding: 32px 32px 28px; }
  }
  @media (max-width: 900px) {
    .je-topbar { padding: 20px 24px 0; } .je-title { padding: 12px 24px 0; font-size: 24px; }
    .je-progress { margin: 10px 24px 0; } .je-body { padding: 18px 24px 60px; } .je-card { padding: 28px 24px 24px; gap: 28px; }
  }
  @media (max-width: 767px) {
    .je-content { margin-left: 0; } .je-topbar { padding: 20px 16px 0; } .je-badge { padding: 6px 12px; font-size: 10px; }
    .je-bell { display: none; } .je-title { padding: 12px 16px 0; font-size: 20px; }
    .je-progress { margin: 10px 16px 0; padding: 14px 16px; } .je-progress-row { font-size: 13px; } .je-progress-label { font-size: 13px; }
    .je-body { padding: 16px 16px 80px; } .je-card { padding: 20px 16px 20px; gap: 24px; } .je-section-title { font-size: 17px; }
    .je-btn-prev { width: 100px; height: 44px; font-size: 14px; } .je-btn-next { width: 100px; height: 44px; font-size: 14px; }
  }
  @media (max-width: 390px) { .je-title { font-size: 17px; } .je-btn-prev, .je-btn-next { width: 90px; font-size: 13px; } }
  @media (max-height: 600px) { .je-header { padding-bottom: 10px; } .je-progress { padding: 10px 20px; } .je-body { padding-top: 14px; } }
`;

const TIME_TO_FIND_JOB_OPTIONS = ['Less than a month','1–3 months','4–6 months','7–12 months','More than a year','Not applicable'];
const EMPLOYMENT_DURATION_OPTIONS = ['Less than a month','1–6 months','7–11 months','1 year or less than 2 years','2 years or less than 3 years','3 years or less than 4 years','Other'];
const FIRST_JOB_OPTIONS = ['Job/Career Fair','Internship Absorption','Online','Recommendation','Walk-in Applications','Not applicable','Other'];
const FACTORS_OPTIONS = ['Academic performance','Internship / On-the-job Training','Personal connections','Skills/Competencies acquired in school','Certifications','Not applicable','Other'];

const JobExperience = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    timeToFindJob: '', otherTimeToFindJob: '',
    employmentDuration: '', otherEmploymentDuration: '',
    firstJobSource: '', otherFirstJobSource: '',
    firstJobFactors: [], otherJobFactors: '',
  });
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    loadSectionData('job_experience').then(d => { if (d) setForm(f => ({ ...f, ...d })); });
  }, []);

  const toggleFactor = (factor) => setForm(prev => ({
    ...prev,
    firstJobFactors: prev.firstJobFactors.includes(factor)
      ? prev.firstJobFactors.filter(f => f !== factor)
      : [...prev.firstJobFactors, factor],
  }));

  const [errors, setErrors] = useState(new Set());
  const cardRef = useRef(null);

  const validate = () => {
    const e = new Set();
    if (!form.timeToFindJob)               e.add('timeToFindJob');
    if (!form.employmentDuration)          e.add('employmentDuration');
    if (form.employmentDuration === 'Other' && !form.otherEmploymentDuration.trim()) e.add('otherEmploymentDuration');
    if (!form.firstJobSource)              e.add('firstJobSource');
    if (form.firstJobSource === 'Other' && !form.otherFirstJobSource.trim()) e.add('otherFirstJobSource');
    if (form.firstJobFactors.length === 0) e.add('firstJobFactors');
    if (form.firstJobFactors.includes('Other') && !form.otherJobFactors.trim()) e.add('otherJobFactors');
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
    saveSectionProgress('job_experience', {
      ...form,
      employment_duration_other: form.employmentDuration === 'Other' ? form.otherEmploymentDuration : null,
      first_job_source_other:    form.firstJobSource === 'Other'    ? form.otherFirstJobSource    : null,
      job_factors_other:         form.firstJobFactors.includes('Other') ? form.otherJobFactors   : null,
    }).then(() => navigate('/survey/skills-and-competencies'));
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="je-root">
        <Sidebar />
        <div className="je-content">
          <div className="je-header">
            <div className="je-topbar">
              <button className="je-back-btn" onClick={() => navigate('/survey/employment-information')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <div className="je-badge">Alumni Status</div>
              <button className="je-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="je-bell-dot">3</div>
              </button>
            </div>
            <h1 className="je-title">Alumni Tracer Survey</h1>
            <div className="je-progress">
              <div className="je-progress-row"><span>Section 5 of 7</span><span>71% complete</span></div>
              <div className="je-progress-track"><div className="je-progress-fill" /></div>
              <span className="je-progress-label">Job Experience</span>
            </div>
          </div>

          <div className="je-body">
            <div className="je-card" ref={cardRef}>
              <div>
                <h2 className="je-section-title">Job search experience</h2>
                <p className="je-section-sub">Your job hunting experience</p>
              </div>
              <div className="je-questions">

                {/* Q1: Time to find first job */}
                <div className="je-field">
                  <span className="je-label">How long did it take you to find your first job after graduation? <span className="je-req">*</span>{errors.has('timeToFindJob') && <span className="je-field-error">Required</span>}</span>
                  <div className="je-radio-group">
                    {TIME_TO_FIND_JOB_OPTIONS.map(opt => (
                      <label key={opt} className="je-radio-label">
                        <input type="radio" name="timeToFindJob" value={opt} checked={form.timeToFindJob === opt} onChange={() => set('timeToFindJob', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q2: Employment duration */}
                <div className="je-field">
                  <span className="je-label">How long have you been employed in your current job? <span className="je-req">*</span>{errors.has('employmentDuration') && <span className="je-field-error">Required</span>}</span>
                  <div className="je-radio-group">
                    {EMPLOYMENT_DURATION_OPTIONS.map(opt => (
                      <label key={opt} className="je-radio-label">
                        <input type="radio" name="employmentDuration" value={opt}
                          checked={form.employmentDuration === opt}
                          onChange={() => set('employmentDuration', opt === form.employmentDuration ? '' : opt)} />{opt}
                      </label>
                    ))}
                  </div>
                  {form.employmentDuration === 'Other' && (
                    <input className="je-other-input" type="text" placeholder="Please specify"
                      value={form.otherEmploymentDuration}
                      onChange={e => set('otherEmploymentDuration', e.target.value)}
                      style={{ borderColor: errors.has('otherEmploymentDuration') ? '#F87171' : undefined }} />
                  )}
                </div>

                {/* Q3: First job source */}
                <div className="je-field">
                  <span className="je-label">How did you find your first job? <span className="je-req">*</span>{errors.has('firstJobSource') && <span className="je-field-error">Required</span>}</span>
                  <div className="je-radio-group">
                    {FIRST_JOB_OPTIONS.map(opt => (
                      <label key={opt} className="je-radio-label">
                        <input type="radio" name="firstJobSource" value={opt}
                          checked={form.firstJobSource === opt}
                          onChange={() => set('firstJobSource', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                  {form.firstJobSource === 'Other' && (
                    <input className="je-other-input" type="text" placeholder="Please specify"
                      value={form.otherFirstJobSource}
                      onChange={e => set('otherFirstJobSource', e.target.value)}
                      style={{ borderColor: errors.has('otherFirstJobSource') ? '#F87171' : undefined }} />
                  )}
                </div>

                {/* Q4: Job factors (multi-select) */}
                <div className="je-field">
                  <span className="je-label">What factors helped you most in getting your first job? <span className="je-req">*</span>{errors.has('firstJobFactors') && <span className="je-field-error">Required</span>}</span>
                  <span className="je-hint">(Check all that apply)</span>
                  <div className="je-radio-group">
                    {FACTORS_OPTIONS.map(opt => (
                      <label key={opt} className="je-checkbox-label">
                        <input type="checkbox" value={opt} checked={form.firstJobFactors.includes(opt)} onChange={() => toggleFactor(opt)} />{opt}
                      </label>
                    ))}
                  </div>
                  {form.firstJobFactors.includes('Other') && (
                    <input className="je-other-input" type="text" placeholder="Please specify"
                      value={form.otherJobFactors}
                      onChange={e => set('otherJobFactors', e.target.value)}
                      style={{ borderColor: errors.has('otherJobFactors') ? '#F87171' : undefined }} />
                  )}
                </div>

              </div>
              <div className="je-footer">
                <button className="je-btn-prev" onClick={() => navigate('/survey/employment-information')}>Previous</button>
                <button className="je-btn-next" onClick={handleNext}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobExperience;