import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ca-root {
    display: flex;
    min-height: 100vh;
    background: #002263;
    font-family: 'Arimo', Arial, sans-serif;
  }

  .ca-content {
    flex: 1;
    min-width: 0;
    margin-left: 229px;
  }

  /* ── Sticky header ── */
  .ca-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: #002263;
    padding-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .ca-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 51px 0;
  }

  .ca-back-btn {
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

  .ca-badge {
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

  .ca-bell {
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

  .ca-bell-dot {
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

  .ca-title {
    text-align: center;
    padding: 14px 51px 0;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.4;
    letter-spacing: -0.7px;
    color: #fff;
  }

  .ca-progress {
    margin: 12px 51px 0;
    background: #001743;
    border: 1px solid #01122F;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 18px 30px 16px;
  }

  .ca-progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 16px;
    color: rgba(255,255,255,0.99);
  }

  .ca-progress-track {
    width: 100%;
    height: 11px;
    background: #D9CA81;
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .ca-progress-fill {
    width: 43%;
    height: 100%;
    background: #51A2FF;
    border-radius: 10px;
  }

  .ca-progress-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 17px;
    color: rgba(255,255,255,0.99);
  }

  /* ── Body ── */
  .ca-body {
    padding: 24px 51px 60px;
  }

  /* ── Form card ── */
  .ca-card {
    background: rgba(13,19,56,0.4);
    border: 0.89px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 40px 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .ca-section-title {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.5;
    color: #fff;
    text-align: center;
  }

  .ca-section-sub {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: rgba(255,255,255,0.6);
    margin-top: 6px;
    text-align: center;
  }

  /* ── Fields ── */
  .ca-fields {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .ca-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .ca-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: rgba(255,255,255,0.9);
  }

  .ca-input {
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
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ca-textarea {
    width: 100%;
    height: 100px;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: #fff;
    outline: none;
    resize: none;
    transition: border-color 0.15s;
  }
  .ca-textarea:focus { border-color: rgba(43,114,251,0.6); }

  .ca-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 4px;
  }

  .ca-radio-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgba(255,255,255,0.9);
    line-height: 1.4;
    padding: 2px 0;
  }

  .ca-radio-label input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #51A2FF;
    cursor: pointer;
    flex-shrink: 0;
  }

  /* ── Dropdown ── */
  .ca-dropdown {
    position: relative;
    width: 100%;
  }

  .ca-dropdown-trigger {
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

  .ca-dropdown-trigger.open { border-color: rgba(43,114,251,0.6); }

  .ca-dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: #011C50;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    max-height: 280px;
    overflow-y: auto;
    z-index: 200;
    padding: 8px 0;
  }

  .ca-dropdown-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background 0.15s;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 13px;
    line-height: 20px;
    color: rgba(255,255,255,0.8);
  }

  .ca-dropdown-item:hover { background: rgba(255,255,255,0.05); }
  .ca-dropdown-item.selected { background: rgba(81,162,255,0.1); }
  .ca-dropdown-item.selected:hover { background: rgba(81,162,255,0.15); }

  .ca-dropdown-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    accent-color: #51A2FF;
    flex-shrink: 0;
    cursor: pointer;
  }

  /* ── Tags ── */
  .ca-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ca-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(81,162,255,0.15);
    border: 1px solid rgba(81,162,255,0.3);
    border-radius: 20px;
    padding: 5px 12px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    color: #fff;
  }

  .ca-tag-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.5);
    font-size: 16px;
    padding: 0;
    line-height: 1;
    font-family: 'Arimo', Arial, sans-serif;
  }

  /* ── Footer — no divider ── */
  .ca-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
  }

  .ca-btn-prev {
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
  .ca-btn-prev:hover { opacity: 0.85; }

  .ca-btn-next {
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
  .ca-btn-next:hover { opacity: 0.9; }
  /* ── Required asterisk (red) ── */
  .ca-req { color: #F87171; font-weight: 700; margin-left: 2px; }

  /* ── Inline field error ── */
  .ca-field-error {
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
    .ca-topbar   { padding: 24px 32px 0; }
    .ca-title    { padding: 14px 32px 0; font-size: 26px; }
    .ca-progress { margin: 12px 32px 0; }
    .ca-body     { padding: 20px 32px 60px; }
    .ca-card     { padding: 32px 32px 28px; }
  }

  @media (max-width: 900px) {
    .ca-topbar   { padding: 20px 24px 0; }
    .ca-title    { padding: 12px 24px 0; font-size: 24px; }
    .ca-progress { margin: 10px 24px 0; }
    .ca-body     { padding: 18px 24px 60px; }
    .ca-card     { padding: 28px 24px 24px; gap: 28px; }
    .ca-fields   { gap: 28px; }
  }

  @media (max-width: 767px) {
    .ca-content  { margin-left: 0; }
    .ca-topbar   { padding: 20px 16px 0; }
    .ca-badge    { padding: 6px 12px; font-size: 10px; }
    .ca-bell     { display: none; }
    .ca-title    { padding: 12px 16px 0; font-size: 20px; }
    .ca-progress { margin: 10px 16px 0; padding: 14px 16px; }
    .ca-progress-row   { font-size: 13px; }
    .ca-progress-label { font-size: 13px; }
    .ca-body     { padding: 16px 16px 80px; }
    .ca-card     { padding: 20px 16px 20px; gap: 24px; }
    .ca-fields   { gap: 24px; }
    .ca-section-title  { font-size: 17px; }
    .ca-btn-prev { width: 100px; height: 44px; font-size: 14px; }
    .ca-btn-next { width: 100px; height: 44px; font-size: 14px; }
  }

  @media (max-width: 390px) {
    .ca-title    { font-size: 17px; }
    .ca-textarea { font-size: 13px; }
    .ca-btn-prev, .ca-btn-next { width: 90px; font-size: 13px; }
  }

  @media (max-height: 600px) {
    .ca-header   { padding-bottom: 10px; }
    .ca-progress { padding: 10px 20px; }
    .ca-body     { padding-top: 14px; }
  }
`;

const CERTIFICATIONS = [
  'Microsoft Office Specialist (MOS) - Word',
  'Microsoft Office Specialist (MOS) - Excel',
  'Microsoft Office Specialist (MOS) - PowerPoint',
  'Microsoft Office Specialist (MOS) - Access',
  'Microsoft Office Specialist (MOS) - Outlook',
  'Microsoft Office Specialist Expert (MOS Expert) (advanced Word/Excel)',
  'Microsoft Certified Professional (MCP)',
  'Specialist Digital Marketing (SDM)',
  'Specialist Web Design (SWD)',
  'Adobe Certified Professional (ACP)',
  'Adobe Certified Associate (ACA) in Premiere Pro',
  'App Development with Swift - Associate',
  'Unity Certified User: Programmer',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Pro',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia WebMap',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Smart Client',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Transportation',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Covadis',
  'Intergraph Technology Specialist IT (Standard-level) - GeoMedia Grid',
  'Entrepreneurship and Small Business (ESB)',
  'IC3 GS5 (IC3 Global Standard 5 - Living Online, Key Applications, Computing Fundamentals)',
  'EUCIP (European Certification of IT Professionals)',
  'Autodesk Certified User / Professional - AutoCAD / Inventor / Revit / Fusion 360',
  'Cisco Certified Technician (CCT) / Cisco Certified Network Associate (CCNA)',
  'Cisco Career Support Associate (CCSA) - Entrepreneurship',
  'Cisco Certified Entry Networking Technician (CCENT)',
  'Linux Certification for Digital Marketing (LinuxCert)',
  'Communication Skills for Business (CSB)',
  'Entrepreneurship and Small Business Exam (ESB)',
  'CompTIA A+',
  'Project Management Institute (PMI) - Project Management Professional (PMP)',
  'EC-Council Certified Ethical Hacker (CEH) v11',
  'Scrum.org - Professional Scrum Master (PSM)',
  'Other',
];

const MultiSelectDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggle = (cert) => {
    if (value.includes(cert)) {
      onChange(value.filter(c => c !== cert));
    } else {
      onChange([...value, cert]);
    }
  };

  const displayText = value.length === 0
    ? 'Select a certification'
    : value.length === 1
      ? value[0].length > 45 ? value[0].slice(0, 45) + '…' : value[0]
      : `${value.length} certifications selected`;

  return (
    <div className="ca-dropdown">
      <div
        className={`ca-dropdown-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ color: value.length === 0 ? 'rgba(255,255,255,0.3)' : '#fff' }}>
          {displayText}
        </span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M1 1L6 7L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {open && (
        <div className="ca-dropdown-menu">
          {CERTIFICATIONS.map(cert => (
            <label
              key={cert}
              className={`ca-dropdown-item${value.includes(cert) ? ' selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={value.includes(cert)}
                onChange={() => toggle(cert)}
              />
              {cert}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CertificationAchievement = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    certiportPasser: '',
    certifications: [],
    helpedCareer: '',
    howHelped: '',
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    const load = async () => {
      const savedData = await loadSectionData('certification_achievement');
      if (savedData) setForm(f => ({ ...f, ...savedData }));
    };
    load();
  }, []);

  const showCertFields = form.certiportPasser === 'Yes';
  const showHowHelped  = showCertFields && form.helpedCareer === 'Yes';

  const [errors, setErrors] = useState(new Set());
  const cardRef = useRef(null);

  const validate = () => {
    const e = new Set();
    if (!form.certiportPasser) e.add('certiportPasser');
    if (form.certiportPasser === 'Yes') {
      if (form.certifications.length === 0) e.add('certifications');
      if (!form.helpedCareer) e.add('helpedCareer');
      if (form.helpedCareer === 'Yes' && !form.howHelped.trim()) e.add('howHelped');
    }
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
    saveSectionProgress('certification_achievement', form)
      .then(() => navigate('/survey/employment-information'));
  };

  const onFocus = e => e.target.style.borderColor = 'rgba(43,114,251,0.6)';
  const onBlur  = e => e.target.style.borderColor = 'rgba(255,255,255,0.06)';

  return (
    <>
      <style>{STYLES}</style>

      <div className="ca-root">
        <Sidebar />

        <div className="ca-content">

          {/* ── Sticky Header ─────────────────────────────────────────── */}
          <div className="ca-header">

            <div className="ca-topbar">
              <button className="ca-back-btn"
                onClick={() => navigate('/survey/educational-background')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>

              <div className="ca-badge">Alumni Status</div>

              <button className="ca-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="ca-bell-dot">3</div>
              </button>
            </div>

            <h1 className="ca-title">Alumni Tracer Survey</h1>

            <div className="ca-progress">
              <div className="ca-progress-row">
                <span>Section 3 of 7</span>
                <span>43% complete</span>
              </div>
              <div className="ca-progress-track">
                <div className="ca-progress-fill" />
              </div>
              <span className="ca-progress-label">Certification Achievement</span>
            </div>

          </div>
          {/* ── End Sticky Header ─────────────────────────────────────── */}

          {/* ── Body ──────────────────────────────────────────────────── */}
          <div className="ca-body">
            <div className="ca-card" ref={cardRef}>

              {/* Section heading — no divider below */}
              <div>
                <h2 className="ca-section-title">Certification Achievement</h2>
                <p className="ca-section-sub">Certifications you have</p>
              </div>

              {/* Fields */}
              <div className="ca-fields">

                {/* Certiport passer */}
                <div className="ca-field">
                  <label className="ca-label">Are you a certiport passer? <span className="ca-req">*</span>{errors.has('certiportPasser') && <span className="ca-field-error">Required</span>}</label>
                  <div className="ca-radio-group">
                    {['Yes', 'No'].map(opt => (
                      <label key={opt} className="ca-radio-label">
                        <input type="radio" name="certiportPasser" value={opt}
                          checked={form.certiportPasser === opt}
                          onChange={() => setForm(prev => ({
                            ...prev,
                            certiportPasser: opt,
                            certifications: [],
                            helpedCareer: '',
                            howHelped: '',
                          }))} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {showCertFields && (
                  <>
                    {/* Certifications dropdown */}
                    <div className="ca-field">
                      <label className="ca-label">Please specify any certiport certification earned <span className="ca-req">*</span>{errors.has('certifications') && <span className="ca-field-error">Required</span>}</label>
                      <MultiSelectDropdown
                        value={form.certifications}
                        onChange={v => set('certifications', v)}
                      />
                    </div>

                    {/* Tags */}
                    {form.certifications.length > 0 && (
                      <div className="ca-tags">
                        {form.certifications.map(cert => (
                          <div key={cert} className="ca-tag">
                            <span>{cert.length > 40 ? cert.slice(0, 40) + '…' : cert}</span>
                            <button className="ca-tag-remove"
                              onClick={() => set('certifications', form.certifications.filter(c => c !== cert))}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Helped career */}
                    <div className="ca-field">
                      <label className="ca-label">Have your certifications helped you in your career? <span className="ca-req">*</span>{errors.has('helpedCareer') && <span className="ca-field-error">Required</span>}</label>
                      <div className="ca-radio-group">
                        {['Yes', 'No'].map(opt => (
                          <label key={opt} className="ca-radio-label">
                            <input type="radio" name="helpedCareer" value={opt}
                              checked={form.helpedCareer === opt}
                              onChange={() => setForm(prev => ({ ...prev, helpedCareer: opt, howHelped: '' }))} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {showHowHelped && (
                      <div className="ca-field">
                        <label className="ca-label">How have your certifications helped you? <span className="ca-req">*</span>{errors.has('howHelped') && <span className="ca-field-error">Required</span>}</label>
                        <textarea className="ca-textarea"
                          placeholder="Please describe how your certifications have helped your career"
                          value={form.howHelped}
                          onChange={e => set('howHelped', e.target.value)}
                          onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    )}
                  </>
                )}

              </div>

              {/* Footer — no divider */}
              <div className="ca-footer">
                <button className="ca-btn-prev"
                  onClick={() => navigate('/survey/educational-background')}>
                  Previous
                </button>
                <button className="ca-btn-next" onClick={handleNext}>
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

export default CertificationAchievement;