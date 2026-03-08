import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ae-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .ae-content { flex: 1; min-width: 0; margin-left: 229px; }

  .ae-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .ae-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .ae-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .ae-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .ae-bell { width: 48px; height: 48px; background: rgba(15,22,66,0.1); border: 1.24px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
  .ae-bell-dot { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; }
  .ae-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .ae-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .ae-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .ae-progress-track { width: 100%; height: 11px; background: #51A2FF; border-radius: 10px; margin-bottom: 10px; }
  .ae-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }

  .ae-body { padding: 24px 51px 60px; }
  .ae-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 32px; }
  .ae-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .ae-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }

  .ae-questions { display: flex; flex-direction: column; gap: 32px; }
  .ae-field { display: flex; flex-direction: column; gap: 12px; width: 100%; }
  .ae-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7); }

  .ae-radio-group { display: flex; flex-direction: column; gap: 15px; padding-top: 4px; }
  .ae-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .ae-radio-label input[type="radio"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }
  .ae-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .ae-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }

  .ae-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .ae-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .ae-btn-prev:hover { opacity: 0.85; }
  .ae-btn-submit { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .ae-btn-submit:hover { opacity: 0.9; }
  /* ── Required asterisk (red) ── */
  .ae-req { color: #F87171; font-weight: 700; margin-left: 2px; }

  /* ── Inline field error ── */
  .ae-field-error {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    color: #F87171;
    margin-left: 6px;
    font-weight: 400;
  }

  @media (max-width: 1100px) {
    .ae-topbar { padding: 24px 32px 0; } .ae-title { padding: 14px 32px 0; font-size: 26px; }
    .ae-progress { margin: 12px 32px 0; } .ae-body { padding: 20px 32px 60px; } .ae-card { padding: 32px 32px 28px; }
  }
  @media (max-width: 900px) {
    .ae-topbar { padding: 20px 24px 0; } .ae-title { padding: 12px 24px 0; font-size: 24px; }
    .ae-progress { margin: 10px 24px 0; } .ae-body { padding: 18px 24px 60px; } .ae-card { padding: 28px 24px 24px; gap: 28px; }
  }
  @media (max-width: 767px) {
    .ae-content { margin-left: 0; } .ae-topbar { padding: 20px 16px 0; } .ae-badge { padding: 6px 12px; font-size: 10px; }
    .ae-bell { display: none; } .ae-title { padding: 12px 16px 0; font-size: 20px; }
    .ae-progress { margin: 10px 16px 0; padding: 14px 16px; } .ae-progress-row { font-size: 13px; } .ae-progress-label { font-size: 13px; }
    .ae-body { padding: 16px 16px 80px; } .ae-card { padding: 20px 16px 20px; gap: 24px; } .ae-section-title { font-size: 17px; }
    .ae-btn-prev { width: 100px; height: 44px; font-size: 14px; } .ae-btn-submit { width: 100px; height: 44px; font-size: 14px; }
  }
  @media (max-width: 390px) { .ae-title { font-size: 17px; } .ae-btn-prev, .ae-btn-submit { width: 90px; font-size: 13px; } }
  @media (max-height: 600px) { .ae-header { padding-bottom: 10px; } .ae-progress { padding: 10px 20px; } .ae-body { padding-top: 14px; } }
`;

const PARTICIPATE_OPTIONS = [
  'Alumni Seminars/Webinar programs for Professional Growth',
  'Career talks for Students',
  'Alumni fundraising Events/Activities',
  'Volunteer opportunities',
  'Not at all',
  'Other',
];

const AlumniEngagement = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ recommend: '', participateIn: [] });
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    loadSectionData('alumni_engagement').then(d => { if (d) setForm(f => ({ ...f, ...d })); });
  }, []);

  const toggleParticipate = (value) => setForm(prev => ({
    ...prev,
    participateIn: prev.participateIn.includes(value)
      ? prev.participateIn.filter(v => v !== value)
      : [...prev.participateIn, value],
  }));

  const [errors, setErrors] = useState(new Set());
  const cardRef = useRef(null);

  const validate = () => {
    const e = new Set();
    if (!form.recommend)                 e.add('recommend');
    if (form.participateIn.length === 0) e.add('participateIn');
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (e.size > 0) {
      setErrors(e);
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setErrors(new Set());
    saveSectionProgress('alumni_engagement', form).then(() => navigate('/survey/complete'));
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="ae-root">
        <Sidebar />
        <div className="ae-content">
          <div className="ae-header">
            <div className="ae-topbar">
              <button className="ae-back-btn" onClick={() => navigate('/survey/feedback')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <div className="ae-badge">Alumni Status</div>
              <button className="ae-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="ae-bell-dot">3</div>
              </button>
            </div>
            <h1 className="ae-title">Alumni Tracer Survey</h1>
            <div className="ae-progress">
              <div className="ae-progress-row"><span>Section 7 of 7</span><span>100% complete</span></div>
              <div className="ae-progress-track" />
              <span className="ae-progress-label">Alumni engagement</span>
            </div>
          </div>

          <div className="ae-body">
            <div className="ae-card" ref={cardRef}>
              <div>
                <h2 className="ae-section-title">Alumni Engagement</h2>
                <p className="ae-section-sub">Your insights and involvement</p>
              </div>
              <div className="ae-questions">
                <div className="ae-field">
                  <span className="ae-label">Would you recommend NU Dasma to others? <span className="ae-req">*</span>{errors.has('recommend') && <span className="ae-field-error">Required</span>}</span>
                  <div className="ae-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="ae-radio-label">
                        <input type="radio" name="recommend" value={opt} checked={form.recommend === opt} onChange={() => set('recommend', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="ae-field">
                  <span className="ae-label">Would you be willing to participate in: <span className="ae-req">*</span>{errors.has('participateIn') && <span className="ae-field-error">Required</span>}</span>
                  <div className="ae-radio-group">
                    {PARTICIPATE_OPTIONS.map(opt => (
                      <label key={opt} className="ae-checkbox-label">
                        <input type="checkbox" value={opt} checked={form.participateIn.includes(opt)} onChange={() => toggleParticipate(opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ae-footer">
                <button className="ae-btn-prev" onClick={() => navigate('/survey/feedback')}>Previous</button>
                <button className="ae-btn-submit" onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlumniEngagement;