import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .fu-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .fu-content { flex: 1; min-width: 0; margin-left: 229px; }

  .fu-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .fu-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .fu-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .fu-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .fu-bell { width: 48px; height: 48px; background: rgba(15,22,66,0.1); border: 1.24px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
  .fu-bell-dot { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; }
  .fu-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .fu-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .fu-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .fu-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; }
  .fu-progress-fill { width: 95%; height: 100%; background: #51A2FF; border-radius: 10px; }
  .fu-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }

  .fu-body { padding: 24px 51px 60px; }
  .fu-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 32px; }
  .fu-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .fu-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }

  .fu-questions { display: flex; flex-direction: column; gap: 32px; }
  .fu-field { display: flex; flex-direction: column; gap: 12px; width: 100%; }
  .fu-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7); }

  .fu-radio-group { display: flex; flex-direction: column; gap: 15px; padding-top: 4px; }
  .fu-radio-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .fu-radio-label input[type="radio"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }

  .fu-textarea { width: 100%; height: 110px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; resize: vertical; transition: border-color 0.15s; }
  .fu-textarea:focus { border-color: rgba(43,114,251,0.6); }

  .fu-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .fu-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .fu-btn-prev:hover { opacity: 0.85; }
  .fu-btn-next { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .fu-btn-next:hover { opacity: 0.9; }

  .fu-error-banner { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 13px; color: #FCA5A5; line-height: 1.5; }
  .fu-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .fu-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }

  @media (max-width: 1100px) {
    .fu-topbar { padding: 24px 32px 0; } .fu-title { padding: 14px 32px 0; font-size: 26px; }
    .fu-progress { margin: 12px 32px 0; } .fu-body { padding: 20px 32px 60px; } .fu-card { padding: 32px 32px 28px; }
  }
  @media (max-width: 900px) {
    .fu-topbar { padding: 20px 24px 0; } .fu-title { padding: 12px 24px 0; font-size: 24px; }
    .fu-progress { margin: 10px 24px 0; } .fu-body { padding: 18px 24px 60px; } .fu-card { padding: 28px 24px 24px; gap: 28px; }
  }
  @media (max-width: 767px) {
    .fu-content { margin-left: 0; } .fu-topbar { padding: 20px 16px 0; } .fu-badge { padding: 6px 12px; font-size: 10px; }
    .fu-bell { display: none; } .fu-title { padding: 12px 16px 0; font-size: 20px; }
    .fu-progress { margin: 10px 16px 0; padding: 14px 16px; } .fu-progress-row { font-size: 13px; } .fu-progress-label { font-size: 13px; }
    .fu-body { padding: 16px 16px 80px; } .fu-card { padding: 20px 16px 20px; gap: 24px; } .fu-section-title { font-size: 17px; }
    .fu-btn-prev { width: 100px; height: 44px; font-size: 14px; } .fu-btn-next { width: 100px; height: 44px; font-size: 14px; }
  }
  @media (max-width: 390px) { .fu-title { font-size: 17px; } .fu-btn-prev, .fu-btn-next { width: 90px; font-size: 13px; } }
  @media (max-height: 600px) { .fu-header { padding-bottom: 10px; } .fu-progress { padding: 10px 20px; } .fu-body { padding-top: 14px; } }
`;

const SATISFACTION_OPTIONS = ['Very satisfied','Satisfied','Neutral','Dissatisfied','Very Dissatisfied'];

const FeedbackForUniversity = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [errors, setErrors] = useState(new Set());
  const [form, setForm] = useState({ satisfaction: '', recommend: '', suggestions: '' });
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    loadSectionData('feedback_university').then(d => { if (d) setForm(f => ({ ...f, ...d })); });
  }, []);

  const validate = () => {
    const e = new Set();
    if (!form.satisfaction)       e.add('satisfaction');
    if (!form.recommend)          e.add('recommend');
    if (!form.suggestions.trim()) e.add('suggestions');
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
    saveSectionProgress('feedback_university', form).then(() => navigate('/survey/alumni-engagement'));
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="fu-root">
        <Sidebar />
        <div className="fu-content">
          <div className="fu-header">
            <div className="fu-topbar">
              <button className="fu-back-btn" onClick={() => navigate('/survey/skills-and-competencies')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <div className="fu-badge">Alumni Status</div>
              <button className="fu-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="fu-bell-dot">3</div>
              </button>
            </div>
            <h1 className="fu-title">Alumni Tracer Survey</h1>
            <div className="fu-progress">
              <div className="fu-progress-row"><span>Section 7 of 8</span><span>95% complete</span></div>
              <div className="fu-progress-track"><div className="fu-progress-fill" /></div>
              <span className="fu-progress-label">Feedback for the University</span>
            </div>
          </div>

          <div className="fu-body">
            <div className="fu-card" ref={cardRef}>
              {errors.size > 0 && (
                <div className="fu-error-banner">
                  <strong>Please answer all required questions before proceeding.</strong>
                </div>
              )}
              <div>
                <h2 className="fu-section-title">Feedback for the University</h2>
                <p className="fu-section-sub">Share your thoughts with us</p>
              </div>
              <div className="fu-questions">
                <div className="fu-field">
                  <span className="fu-label">How satisfied are you with your education at NU Dasma? <span className="fu-req">*</span>{errors.has('satisfaction') && <span className="fu-field-error">Required</span>}</span>
                  <div className="fu-radio-group">
                    {SATISFACTION_OPTIONS.map(opt => (
                      <label key={opt} className="fu-radio-label">
                        <input type="radio" name="satisfaction" value={opt} checked={form.satisfaction === opt} onChange={() => set('satisfaction', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fu-field">
                  <span className="fu-label">Would you recommend NU Dasma to others? <span className="fu-req">*</span>{errors.has('recommend') && <span className="fu-field-error">Required</span>}</span>
                  <div className="fu-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="fu-radio-label">
                        <input type="radio" name="recommend" value={opt} checked={form.recommend === opt} onChange={() => set('recommend', opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="fu-field">
                  <span className="fu-label">Suggestions for improving academic programs and alumni services <span className="fu-req">*</span>{errors.has('suggestions') && <span className="fu-field-error">Required</span>}</span>
                  <textarea className="fu-textarea" placeholder="Enter your answer"
                    value={form.suggestions} onChange={e => set('suggestions', e.target.value)} />
                </div>
              </div>
              <div className="fu-footer">
                <button className="fu-btn-prev" onClick={() => navigate('/survey/skills-and-competencies')}>Previous</button>
                <button className="fu-btn-next" onClick={handleNext}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeedbackForUniversity;