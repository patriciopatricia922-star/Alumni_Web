import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';

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
  width: '100%', height: '47px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '0.89px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  padding: '12px 16px',
  fontFamily: 'Arimo', fontSize: '15px',
  lineHeight: '21px', color: '#FFFFFF',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: 'Arimo', fontWeight: 400,
  fontSize: '14px', lineHeight: '21px', color: 'rgba(255,255,255,0.8)',
};

const Field = ({ label, children, mb = '16px', flex }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: mb, ...(flex ? { flex } : {}) }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const PersonalInformation = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const sidebarWidth = 229;

  const [form, setForm] = useState({ firstName: '', middleName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('first_name, middle_name, last_name, email')
        .eq('id', user.id)
        .single();
      if (data) setForm({ firstName: data.first_name || '', middleName: data.middle_name || '', lastName: data.last_name || '', email: data.email || '' });
      setLoading(false);
    };
    load();
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setError(''); setSuccess(false); setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase.from('users')
        .update({ first_name: form.firstName, middle_name: form.middleName, last_name: form.lastName })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#002263' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '24px 16px 90px' : '24px 32px',
        boxSizing: 'border-box',
        overflow: 'auto',
        position: 'relative',
      }}>

        {/* Notification Bell */}
        {!isMobile && (
          <div style={{ position: 'fixed', top: '28px', right: '32px', zIndex: 50 }}>
            <button style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
              border: '1.24px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', background: '#2B72FB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Arimo', fontSize: '10px', color: '#FFFFFF' }}>3</span>
              </div>
            </button>
          </div>
        )}

        {/* Card */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          padding: isMobile ? '24px 20px 28px' : '28px 33px 32px',
          gap: '0',
          width: '100%', maxWidth: '680px',
          background: 'rgba(13, 19, 56, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          borderRadius: '14px',
          boxSizing: 'border-box',
        }}>

          {/* Back button */}
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '12px' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
          </button>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: isMobile ? '18px' : '20px', color: '#FFFFFF', margin: '0 0 4px 0' }}>Personal Information</h2>
            <p style={{ fontFamily: 'Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>Review and update your basic personal details</p>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0 16px' }} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <span style={{ fontFamily: 'Arimo', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Loading...</span>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '15px', color: '#FFFFFF', margin: '0 0 12px 0' }}>Personal Details</h3>

              <Field label="Last Name">
                <input value={form.lastName} onChange={set('lastName')} placeholder="e.g. Dela Cruz" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </Field>

              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '20px' }}>
                <Field label="First Name" mb="0" flex={1}>
                  <input value={form.firstName} onChange={set('firstName')} placeholder="e.g. Juan" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </Field>
                <Field label="Middle Name" mb="0" flex={1}>
                  <input value={form.middleName} onChange={set('middleName')} placeholder="e.g. Mercado" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(43,114,251,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </Field>
              </div>

              <h3 style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '15px', color: '#FFFFFF', margin: '0 0 12px 0' }}>Account Security</h3>

              <Field label="Email Address">
                <input value={form.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </Field>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <button onClick={() => navigate('/change-password')} style={{
                  width: '100%', height: '47px', background: 'rgba(255,255,255,0.1)',
                  border: '0.89px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxSizing: 'border-box',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(43,114,251,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <span style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '14px', color: '#FFFFFF' }}>Change Password</span>
                  <svg width="13" height="20" viewBox="0 0 13 20" fill="none"><path d="M2 2L11 10L2 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {error && (
                <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'Arimo, Arimo', fontSize: '13px', color: '#FF6B6B', margin: 0 }}>{error}</p>
                </div>
              )}
              {success && (
                <div style={{ background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                  <p style={{ fontFamily: 'Arimo', fontSize: '13px', color: '#00C853', margin: 0 }}>Changes saved successfully!</p>
                </div>
              )}

              <button onClick={handleSave} disabled={saving} style={{
                width: '100%', height: '48px',
                background: saving ? 'rgba(0,40,255,0.4)' : 'rgba(0,40,255,0.8)',
                border: 'none', borderRadius: '10px',
                fontFamily: 'Arimo ', fontWeight: 600, fontSize: '15px', color: '#FFFFFF',
                cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;