import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSectionProgress, loadSectionData } from '../lib/surveyProgress';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400;0,700;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Root layout ── */
  .pb-root {
    display: flex;
    min-height: 100vh;
    background: #002263;
    font-family: 'Arimo', Arial, sans-serif;
  }

  /*
    The key to making sticky work:
    - .pb-content must be a normal block container (no overflow set)
    - .pb-header uses position:sticky top:0 inside that block flow
    - .pb-body is just a regular block that scrolls with the page
  */
  .pb-content {
    flex: 1;
    min-width: 0;
    margin-left: 229px;
  }

  /* ── Sticky header ── */
  .pb-header {
    position: sticky;
    top: 0;
    z-index: 40;
    background: #002263;
    padding-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  /* ── Top bar ── */
  .pb-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28px 51px 0;
  }

  .pb-back-btn {
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

  .pb-badge {
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

  .pb-bell {
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

  .pb-bell-dot {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    background: #2B72FB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 10px;
    color: #fff;
  }

  /* ── Survey title ── */
  .pb-title {
    text-align: center;
    padding: 14px 51px 0;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 28px;
    line-height: 1.4;
    letter-spacing: -0.7px;
    color: #fff;
  }

  /* ── Progress banner ── */
  .pb-progress {
    margin: 12px 51px 0;
    background: #001743;
    border: 1px solid #01122F;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 18px 30px 16px;
  }

  .pb-progress-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 16px;
    color: rgba(255,255,255,0.99);
  }

  .pb-progress-track {
    width: 100%;
    height: 11px;
    background: #D9CA81;
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .pb-progress-fill {
    width: 14%;
    height: 100%;
    background: #51A2FF;
    border-radius: 10px;
  }

  .pb-progress-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 17px;
    color: rgba(255,255,255,0.99);
  }

  /* ── Scrollable body ── */
  .pb-body {
    padding: 24px 51px 60px;
  }

  /* ── Form card ── */
  .pb-card {
    background: rgba(13, 19, 56, 0.4);
    border: 0.89px solid rgba(255,255,255,0.1);
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 16px;
    padding: 32px 32px 32px;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  /* ── Section heading ── */
  .pb-section-title {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.5;
    color: #fff;
    text-align: center;
  }

  .pb-section-sub {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
    color: rgba(255,255,255,0.6);
    margin-top: 6px;
    text-align: center;
  }

  /* ── Fields ── */
  .pb-fields {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .pb-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .pb-label {
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: rgba(255,255,255,0.7);
  }

  .pb-input {
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
  .pb-input:focus { border-color: rgba(43,114,251,0.6); }
  .pb-input option { background: #001947; }

  .pb-input-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    cursor: pointer;
  }

  .pb-row {
    display: flex;
    flex-direction: row;
    gap: 24px;
  }

  .pb-radio-group {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 4px;
  }

  .pb-radio-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.4;
  }

  .pb-radio-label input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: #51A2FF;
    cursor: pointer;
    flex-shrink: 0;
  }

  .pb-phone-row {
    display: flex;
    gap: 12px;
  }

  .pb-phone-prefix {
    width: 58px;
    height: 47px;
    flex-shrink: 0;
    background: rgba(255,255,255,0.17);
    border: 0.89px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 14px;
    color: rgba(255,255,255,0.6);
  }

  .pb-phone-input {
    flex: 1;
    min-width: 0;
  }

  /* ── Footer (Next button) — NO border-top divider ── */
  .pb-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }

  .pb-btn-next {
    width: 88px;
    height: 45px;
    background: #0028FF;
    box-shadow: 0 4px 4px rgba(0,0,0,0.25);
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Arimo', Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    transition: background 0.15s;
  }
  .pb-btn-next:hover { background: rgba(0,40,255,0.85); }
  /* ── Required asterisk (red) ── */
  .pb-req { color: #F87171; font-weight: 700; margin-left: 2px; }

  /* ── Inline field error ── */
  .pb-field-error {
    font-family: 'Arimo', Arial, sans-serif;
    font-size: 12px;
    color: #F87171;
    margin-left: 6px;
    font-weight: 400;
  }

  /* ══════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
  ══════════════════════════════════════════ */

  /* Tablet landscape / small desktop */
  @media (max-width: 1100px) {
    .pb-topbar   { padding: 24px 32px 0; }
    .pb-title    { padding: 14px 32px 0; font-size: 26px; }
    .pb-progress { margin: 12px 32px 0; }
    .pb-body     { padding: 20px 32px 60px; }
  }

  /* Tablet portrait */
  @media (max-width: 900px) {
    .pb-topbar   { padding: 20px 24px 0; }
    .pb-title    { padding: 12px 24px 0; font-size: 24px; }
    .pb-progress { margin: 10px 24px 0; }
    .pb-body     { padding: 18px 24px 60px; }
    .pb-card     { padding: 28px 24px 28px; }
  }

  /* Mobile — sidebar collapses */
  @media (max-width: 767px) {
    .pb-content  { margin-left: 0; }
    .pb-topbar   { padding: 20px 16px 0; }
    .pb-badge    { padding: 6px 12px; font-size: 10px; }
    .pb-bell     { display: none; }
    .pb-title    { padding: 12px 16px 0; font-size: 20px; }
    .pb-progress { margin: 10px 16px 0; padding: 14px 16px; }
    .pb-progress-row   { font-size: 13px; }
    .pb-progress-label { font-size: 13px; }
    .pb-body     { padding: 16px 16px 80px; }
    .pb-card     { padding: 20px 16px 20px; gap: 28px; }
    .pb-section-title  { font-size: 17px; }
    .pb-row      { flex-direction: column; gap: 28px; }
  }

  /* Very small phones */
  @media (max-width: 390px) {
    .pb-title    { font-size: 18px; }
    .pb-input    { font-size: 13px; height: 44px; }
    .pb-btn-next { width: 80px; height: 42px; font-size: 13px; }
  }

  /* Short viewports / landscape phones */
  @media (max-height: 600px) {
    .pb-header   { padding-bottom: 10px; }
    .pb-progress { padding: 10px 20px; }
    .pb-body     { padding-top: 14px; }
  }
`;

const PersonalBackground = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lastName: '', firstName: '', middleName: '',
    studentNumber: '', gender: '', birthday: '',
    civilStatus: '', streetAddress: '', city: '',
    province: '', zipCode: '', country: '',
    contactNumber: '', email: '',
  });

  useEffect(() => {
    const prefill = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, middle_name, last_name, email')
        .eq('id', authUser.id)
        .single();
      const savedData = await loadSectionData('personal_background');
      if (savedData) {
        setForm(f => ({ ...f, ...savedData }));
      } else if (data) {
        setForm(f => ({
          ...f,
          firstName:  data.first_name  || '',
          middleName: data.middle_name || '',
          lastName:   data.last_name   || '',
          email:      data.email       || '',
        }));
      }
    };
    prefill();
  }, []);

  const set      = (key) => (e)   => setForm(f => ({ ...f, [key]: e.target.value }));
  const setRadio = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const [errors, setErrors] = useState(new Set());
  const cardRef = useRef(null);

  const validate = () => {
    const e = new Set();
    if (!form.lastName.trim())      e.add('lastName');
    if (!form.firstName.trim())     e.add('firstName');
    if (!form.gender)               e.add('gender');
    if (!form.birthday)             e.add('birthday');
    if (!form.civilStatus)          e.add('civilStatus');
    if (!form.streetAddress.trim()) e.add('streetAddress');
    if (!form.city.trim())          e.add('city');
    if (!form.province.trim())      e.add('province');
    if (!form.zipCode.trim())       e.add('zipCode');
    if (!form.country)              e.add('country');
    if (!form.contactNumber.trim()) e.add('contactNumber');
    if (!form.email.trim())         e.add('email');
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
    saveSectionProgress('personal_background', form)
      .then(() => navigate('/survey/educational-background'));
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="pb-root">
        <Sidebar />

        <div className="pb-content">

          {/* ── Sticky Header ─────────────────────────────────────────── */}
          <div className="pb-header">

            <div className="pb-topbar">
              <button className="pb-back-btn" onClick={() => navigate('/dashboard')}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>

              <div className="pb-badge">Alumni Status</div>

              <button className="pb-bell">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="pb-bell-dot">3</div>
              </button>
            </div>

            <h1 className="pb-title">Alumni Tracer Survey</h1>

            <div className="pb-progress">
              <div className="pb-progress-row">
                <span>Section 1 of 7</span>
                <span>14% complete</span>
              </div>
              <div className="pb-progress-track">
                <div className="pb-progress-fill" />
              </div>
              <span className="pb-progress-label">Personal Background</span>
            </div>

          </div>
          {/* ── End Sticky Header ─────────────────────────────────────── */}

          {/* ── Body (scrolls naturally with the page) ────────────────── */}
          <div className="pb-body">
            <div className="pb-card" ref={cardRef}>

              <div>
                <h2 className="pb-section-title">Personal Information</h2>
                <p className="pb-section-sub">Basic information about you</p>
              </div>

              <div className="pb-fields">

                <div className="pb-field">
                  <label className="pb-label">Last Name <span className="pb-req">*</span>{errors.has('lastName') && <span className="pb-field-error">Required</span>}</label>
                  <input className="pb-input" placeholder="e.g. Dela Cruz"
                    value={form.lastName} onChange={set('lastName')} />
                </div>

                <div className="pb-row">
                  <div className="pb-field">
                    <label className="pb-label">First Name <span className="pb-req">*</span>{errors.has('firstName') && <span className="pb-field-error">Required</span>}</label>
                    <input className="pb-input" placeholder="e.g. Juan"
                      value={form.firstName} onChange={set('firstName')} />
                  </div>
                  <div className="pb-field">
                    <label className="pb-label">Middle Name</label>
                    <input className="pb-input" placeholder="e.g. Mercado"
                      value={form.middleName} onChange={set('middleName')} />
                  </div>
                </div>

                <div className="pb-field">
                  <label className="pb-label">Student Number <span className="pb-req">*</span></label>
                  <input className="pb-input" placeholder="e.g. 2023-123456"
                    value={form.studentNumber} onChange={set('studentNumber')} />
                </div>

                <div className="pb-field">
                  <label className="pb-label">Gender <span className="pb-req">*</span>{errors.has('gender') && <span className="pb-field-error">Required</span>}</label>
                  <div className="pb-radio-group">
                    {['Male', 'Female', 'Prefer not to say'].map(opt => (
                      <label key={opt} className="pb-radio-label">
                        <input type="radio" name="gender" value={opt}
                          checked={form.gender === opt}
                          onChange={() => setRadio('gender')(opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pb-field">
                  <label className="pb-label">Birthday <span className="pb-req">*</span>{errors.has('birthday') && <span className="pb-field-error">Required</span>}</label>
                  <input type="date" className="pb-input"
                    value={form.birthday} onChange={set('birthday')}
                    style={{ colorScheme: 'dark' }} />
                </div>

                <div className="pb-field">
                  <label className="pb-label">Civil Status <span className="pb-req">*</span>{errors.has('civilStatus') && <span className="pb-field-error">Required</span>}</label>
                  <div className="pb-radio-group">
                    {['Single', 'Married', 'Widowed'].map(opt => (
                      <label key={opt} className="pb-radio-label">
                        <input type="radio" name="civilStatus" value={opt}
                          checked={form.civilStatus === opt}
                          onChange={() => setRadio('civilStatus')(opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pb-field">
                  <label className="pb-label">Street Address <span className="pb-req">*</span>{errors.has('streetAddress') && <span className="pb-field-error">Required</span>}</label>
                  <input className="pb-input" placeholder="e.g. Blk 123 Lot 456 AlumnAI St."
                    value={form.streetAddress} onChange={set('streetAddress')} />
                </div>

                <div className="pb-row">
                  <div className="pb-field">
                    <label className="pb-label">City *</label>
                    <input className="pb-input" placeholder="e.g. Dasmariñas"
                      value={form.city} onChange={set('city')} />
                  </div>
                  <div className="pb-field">
                    <label className="pb-label">Province <span className="pb-req">*</span>{errors.has('province') && <span className="pb-field-error">Required</span>}</label>
                    <input className="pb-input" placeholder="e.g. Cavite"
                      value={form.province} onChange={set('province')} />
                  </div>
                </div>

                <div className="pb-row">
                  <div className="pb-field">
                    <label className="pb-label">ZIP Code *</label>
                    <input className="pb-input" placeholder="e.g. 4114"
                      value={form.zipCode} onChange={set('zipCode')} />
                  </div>
                  <div className="pb-field">
                    <label className="pb-label">Country <span className="pb-req">*</span>{errors.has('country') && <span className="pb-field-error">Required</span>}</label>
                    <select className="pb-input pb-input-select"
                      value={form.country} onChange={set('country')}>
                      <option value="" disabled style={{ background: '#001947' }}>Select</option>
                      <option value="Philippines" style={{ background: '#001947' }}>Philippines</option>
                      <option value="United States" style={{ background: '#001947' }}>United States</option>
                      <option value="Other" style={{ background: '#001947' }}>Other</option>
                    </select>
                  </div>
                </div>

                <div className="pb-field">
                  <label className="pb-label">Contact Number <span className="pb-req">*</span>{errors.has('contactNumber') && <span className="pb-field-error">Required</span>}</label>
                  <div className="pb-phone-row">
                    <div className="pb-phone-prefix">+63</div>
                    <input type="tel" className="pb-input pb-phone-input"
                      placeholder="e.g. 912-345-6789"
                      value={form.contactNumber} onChange={set('contactNumber')} />
                  </div>
                </div>

                <div className="pb-field">
                  <label className="pb-label">Personal Email Address <span className="pb-req">*</span>{errors.has('email') && <span className="pb-field-error">Required</span>}</label>
                  <input type="email" className="pb-input"
                    placeholder="e.g. juandelacruz@gmail.com"
                    value={form.email} onChange={set('email')} />
                </div>

              </div>

              {/* Footer — no divider */}
              <div className="pb-footer">
                <button className="pb-btn-next" onClick={handleNext}>Next</button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PersonalBackground;