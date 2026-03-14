import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sc-root { display: flex; min-height: 100vh; background: #002263; font-family: 'Arimo', Arial, sans-serif; }
  .sc-content { flex: 1; min-width: 0; margin-left: 229px; }

  .sc-header { position: sticky; top: 0; z-index: 40; background: #002263; padding-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
  .sc-topbar { display: flex; align-items: center; justify-content: space-between; padding: 28px 51px 0; }
  .sc-back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; }
  .sc-badge { background: linear-gradient(90deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1.24px solid rgba(99,102,241,0.3); border-radius: 999px; padding: 7px 20px; font-family: 'Arimo', Arial, sans-serif; font-size: 12px; letter-spacing: 0.3px; color: rgba(255,255,255,0.8); white-space: nowrap; }
  .sc-bell { width: 48px; height: 48px; background: rgba(15,22,66,0.1); border: 1.24px solid rgba(255,255,255,0.1); border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; }
  .sc-bell-dot { position: absolute; top: -4px; right: -4px; width: 20px; height: 20px; background: #2B72FB; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Arimo', Arial, sans-serif; font-size: 10px; color: #fff; }
  .sc-title { text-align: center; padding: 14px 51px 0; font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 28px; line-height: 1.4; letter-spacing: -0.7px; color: #fff; }
  .sc-progress { margin: 12px 51px 0; background: #001743; border: 1px solid #01122F; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 18px 30px 16px; }
  .sc-progress-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: 'Arimo', Arial, sans-serif; font-size: 16px; color: rgba(255,255,255,0.99); }
  .sc-progress-track { width: 100%; height: 11px; background: #D9CA81; border-radius: 10px; margin-bottom: 10px; }
  .sc-progress-fill { width: 86%; height: 100%; background: #51A2FF; border-radius: 10px; }
  .sc-progress-label { font-family: 'Arimo', Arial, sans-serif; font-size: 17px; color: rgba(255,255,255,0.99); }

  .sc-body { padding: 24px 51px 60px; }
  .sc-card { background: rgba(13,19,56,0.4); border: 0.89px solid rgba(255,255,255,0.1); box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 16px; padding: 40px 40px 32px; display: flex; flex-direction: column; gap: 40px; }
  .sc-section-title { font-family: 'Arimo', Arial, sans-serif; font-weight: 700; font-size: 20px; line-height: 1.5; color: #fff; text-align: center; }
  .sc-section-sub { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 6px; text-align: center; }

  .sc-questions { display: flex; flex-direction: column; gap: 40px; }
  .sc-field { display: flex; flex-direction: column; gap: 14px; width: 100%; }
  .sc-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: rgba(255,255,255,0.7); }
  .sc-skill-label { font-family: 'Arimo', Arial, sans-serif; font-weight: 400; font-size: 14px; line-height: 21px; color: #fff; }

  .sc-radio-group { display: flex; flex-direction: column; gap: 18px; padding-top: 8px; }
  .sc-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.4; }
  .sc-checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: #51A2FF; cursor: pointer; flex-shrink: 0; }

  .sc-stars { display: flex; flex-direction: row; align-items: center; gap: 20px; padding: 4px 0; }
  .sc-star { width: 35px; height: 35px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

  .sc-skill-ratings { display: flex; flex-direction: column; gap: 32px; }
  .sc-skill-row { display: flex; flex-direction: column; gap: 14px; }

  .sc-textarea { width: 100%; height: 110px; background: rgba(255,255,255,0.17); border: 0.89px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 14px; color: #fff; outline: none; resize: vertical; transition: border-color 0.15s; }
  .sc-textarea:focus { border-color: rgba(43,114,251,0.6); }

  .sc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; padding-bottom: 8px; }
  .sc-btn-prev { width: 120px; height: 48px; background: #fff; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #090909; transition: opacity 0.15s; }
  .sc-btn-prev:hover { opacity: 0.85; }
  .sc-btn-next { width: 120px; height: 48px; background: #0028FF; box-shadow: 0 4px 4px rgba(0,0,0,0.25); border-radius: 10px; border: none; cursor: pointer; font-family: 'Arimo', Arial, sans-serif; font-size: 15px; font-weight: 600; color: #fff; transition: opacity 0.15s; }
  .sc-btn-next:hover { opacity: 0.9; }

  .sc-error-banner { background: rgba(220,38,38,0.15); border: 1px solid rgba(220,38,38,0.4); border-radius: 10px; padding: 12px 16px; font-family: 'Arimo', Arial, sans-serif; font-size: 13px; color: #FCA5A5; line-height: 1.5; }
  .sc-req { color: #F87171; font-weight: 700; margin-left: 2px; }
  .sc-field-error { font-family: 'Arimo', Arial, sans-serif; font-size: 12px; color: #F87171; margin-left: 6px; font-weight: 400; }

  @media (max-width: 1100px) {
    .sc-topbar { padding: 24px 32px 0; } .sc-title { padding: 14px 32px 0; font-size: 26px; }
    .sc-progress { margin: 12px 32px 0; } .sc-body { padding: 20px 32px 60px; } .sc-card { padding: 32px 32px 28px; }
  }
  @media (max-width: 900px) {
    .sc-topbar { padding: 20px 24px 0; } .sc-title { padding: 12px 24px 0; font-size: 24px; }
    .sc-progress { margin: 10px 24px 0; } .sc-body { padding: 18px 24px 60px; } .sc-card { padding: 28px 24px 24px; gap: 28px; }
  }
  @media (max-width: 767px) {
    .sc-content { margin-left: 0; } .sc-topbar { padding: 20px 16px 0; } .sc-badge { padding: 6px 12px; font-size: 10px; }
    .sc-bell { display: none; } .sc-title { padding: 12px 16px 0; font-size: 20px; }
    .sc-progress { margin: 10px 16px 0; padding: 14px 16px; } .sc-progress-row { font-size: 13px; } .sc-progress-label { font-size: 13px; }
    .sc-body { padding: 16px 16px 80px; } .sc-card { padding: 20px 16px 20px; gap: 24px; } .sc-section-title { font-size: 17px; }
    .sc-stars { gap: 12px; } .sc-star { width: 28px; height: 28px; }
    .sc-btn-prev { width: 100px; height: 44px; font-size: 14px; } .sc-btn-next { width: 100px; height: 44px; font-size: 14px; }
  }
  @media (max-width: 390px) { .sc-title { font-size: 17px; } .sc-btn-prev, .sc-btn-next { width: 90px; font-size: 13px; } }
  @media (max-height: 600px) { .sc-header { padding-bottom: 10px; } .sc-progress { padding: 10px 20px; } .sc-body { padding-top: 14px; } }
`;

const COMPETENCIES_OPTIONS = ['Communication Skills','Information & Technology Skills','Leadership Skills','Critical & Problem-Solving Skills','Work Ethics/Professionalism'];
const SKILL_RATINGS = ['Communication Skills','Information & Technology Skills','Leadership Skills','Critical & Problem-Solving Skills','Work Ethics/Professionalism Skills'];

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="sc-stars">
      {[1,2,3,4,5].map(star => (
        <div key={star} className="sc-star"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= (hovered || value) ? '#51A2FF' : '#D9D9D9'}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      ))}
    </div>
  );
};

const SkillsAndCompetencies = () => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [errors, setErrors] = useState(new Set());
  const [form, setForm] = useState({
    usefulCompetencies: [],
    skillRatings: { 'Communication Skills': 0, 'Information & Technology Skills': 0, 'Leadership Skills': 0, 'Critical & Problem-Solving Skills': 0, 'Work Ethics/Professionalism Skills': 0 },
    skillsToDevelop: '',
  });

  useEffect(() => {
    loadSectionData('skills_competencies').then(d => { if (d) setForm(f => ({ ...f, ...d })); });
  }, []);

  const toggleCompetency = (value) => setForm(prev => ({
    ...prev,
    usefulCompetencies: prev.usefulCompetencies.includes(value)
      ? prev.usefulCompetencies.filter(v => v !== value)
      : [...prev.usefulCompetencies, value],
  }));

  const setSkillRating = (skill, rating) => setForm(prev => ({ ...prev, skillRatings: { ...prev.skillRatings, [skill]: rating } }));

  const validate = () => {
    const e = new Set();
    if (form.usefulCompetencies.length === 0) e.add('usefulCompetencies');
    SKILL_RATINGS.forEach(s => { if ((form.skillRatings[s] || 0) === 0) e.add('rating_' + s); });
    if (!form.skillsToDevelop?.trim()) e.add('skillsToDevelop');
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
    saveSectionProgress('skills_competencies', form).then(() => navigate('/survey/feedback'));
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="sc-root">
        <Sidebar />
        <div className="sc-content">
          <div className="sc-header">
            <div className="sc-topbar">
              <button className="sc-back-btn" onClick={() => navigate('/survey/job-experience')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <div className="sc-badge">Alumni Status</div>
              <button className="sc-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="sc-bell-dot">3</div>
              </button>
            </div>
            <h1 className="sc-title">Alumni Tracer Survey</h1>
            <div className="sc-progress">
              <div className="sc-progress-row"><span>Section 6 of 8</span><span>85% complete</span></div>
              <div className="sc-progress-track"><div className="sc-progress-fill" /></div>
              <span className="sc-progress-label">Skills and competencies</span>
            </div>
          </div>

          <div className="sc-body">
            <div className="sc-card" ref={cardRef}>
              {errors.size > 0 && (
                <div className="sc-error-banner">
                  <strong>Please answer all required questions before proceeding.</strong>
                </div>
              )}
              <div>
                <h2 className="sc-section-title">Skills and competencies</h2>
                <p className="sc-section-sub">Your workplace skills</p>
              </div>
              <div className="sc-questions">
                <div className="sc-field">
                  <span className="sc-label">What are the competencies learned in college did you find very useful? <span className="sc-req">*</span>{errors.has('usefulCompetencies') && <span className="sc-field-error">Required</span>}</span>
                  <div className="sc-radio-group">
                    {COMPETENCIES_OPTIONS.map(opt => (
                      <label key={opt} className="sc-checkbox-label">
                        <input type="checkbox" value={opt} checked={form.usefulCompetencies.includes(opt)} onChange={() => toggleCompetency(opt)} />{opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="sc-skill-ratings">
                  {SKILL_RATINGS.map(skill => (
                    <div key={skill} className="sc-skill-row">
                      <span className="sc-skill-label">{skill} <span className="sc-req">*</span>{errors.has('rating_' + skill) && <span className="sc-field-error">Required</span>}</span>
                      <StarRating value={form.skillRatings[skill]} onChange={r => setSkillRating(skill, r)} />
                    </div>
                  ))}
                </div>
                <div className="sc-field">
                  <span className="sc-label">What other skills should NU Dasma develop in students to make them more employable? <span className="sc-req">*</span>{errors.has('skillsToDevelop') && <span className="sc-field-error">Required</span>}</span>
                  <textarea className="sc-textarea" placeholder="Enter your answer"
                    value={form.skillsToDevelop}
                    onChange={e => setForm(prev => ({ ...prev, skillsToDevelop: e.target.value }))} />
                </div>
              </div>
              <div className="sc-footer">
                <button className="sc-btn-prev" onClick={() => navigate('/survey/job-experience')}>Previous</button>
                <button className="sc-btn-next" onClick={handleNext}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkillsAndCompetencies;