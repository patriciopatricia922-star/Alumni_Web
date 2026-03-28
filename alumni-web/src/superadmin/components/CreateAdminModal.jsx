import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabaseAdmin } from '../../lib/supabaseadmin';
import { logAction } from '../../lib/auditLogger';
import './CreateAdminModal.css';

const CreateAdminModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    role: 'admin' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validateEmail = (email) => {
    return email.endsWith('@nu-dasma.edu.ph');
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, text: '', color: '' });
      return;
    }

    let score = 0;
    let feedback = '';

    // Length check
    if (password.length >= 8) score += 1;
    else if (password.length >= 6) score += 0.5;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 0.5;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 0.5;
    
    // Contains numbers
    if (/[0-9]/.test(password)) score += 0.5;
    
    // Contains special characters
    if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;

    // Determine strength level (0-4)
    let strengthLevel = 0;
    let strengthText = '';
    let strengthColor = '';

    if (score < 1.5) {
      strengthLevel = 1;
      strengthText = 'Weak';
      strengthColor = '#EF4444';
    } else if (score < 2.5) {
      strengthLevel = 2;
      strengthText = 'Fair';
      strengthColor = '#F59E0B';
    } else if (score < 3.5) {
      strengthLevel = 3;
      strengthText = 'Good';
      strengthColor = '#10B981';
    } else {
      strengthLevel = 4;
      strengthText = 'Strong';
      strengthColor = '#00A63E';
    }

    setPasswordStrength({
      score: strengthLevel,
      text: strengthText,
      color: strengthColor,
      percentage: (score / 4) * 100
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    set('password', newPassword);
    checkPasswordStrength(newPassword);
  };

  const handleCreate = async () => {
    setError('');
    
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('All fields are required.');
      return;
    }
    
    if (!validateEmail(form.email)) {
      setError('Admin accounts must use @nu-dasma.edu.ph email address.');
      return;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    // Optional: Require at least "Good" strength for better security
    if (passwordStrength.score < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }
    
    setLoading(true);
    try {
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
        user_metadata: {
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
        }
      });
      
      if (authErr) throw authErr;

      const uid = authData?.user?.id;
      if (!uid) throw new Error('User creation failed.');

      const { error: insertErr } = await supabaseAdmin.from('users').insert({
        id: uid,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        account_status: 'active',
      });
      
      if (insertErr) {
        await supabaseAdmin.auth.admin.deleteUser(uid);
        throw insertErr;
      }

      await logAction({
        action: 'Create',
        module: 'User Management',
        description: `Created new ${form.role} account for ${form.email}`,
        recordId: uid,
      });

      onCreated();
      onClose();
    } catch (e) {
      console.error('Create admin error:', e);
      setError(e.message || 'Failed to create admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Create New Admin</h2>
            <p>Add a new admin or superadmin account</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <div className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>First Name <span className="required">*</span></label>
              <input
                type="text"
                name="admin-first-name"
                id="admin-first-name"
                autoComplete="given-name"
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-field">
              <label>Last Name <span className="required">*</span></label>
              <input
                type="text"
                name="admin-last-name"
                id="admin-last-name"
                autoComplete="family-name"
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              name="admin-email"
              id="admin-email"
              autoComplete="off"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="admin@nu-dasma.edu.ph"
            />
            <span className="email-hint">Must end with @nu-dasma.edu.ph</span>
          </div>

          <div className="form-field">
            <label>Password <span className="required">*</span></label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="admin-password"
                id="admin-password"
                autoComplete="new-password"
                value={form.password}
                onChange={handlePasswordChange}
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {form.password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div 
                    className="password-strength-fill"
                    style={{ 
                      width: `${passwordStrength.percentage}%`,
                      background: passwordStrength.color,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <div className="password-strength-text" style={{ color: passwordStrength.color }}>
                  Password Strength: {passwordStrength.text}
                </div>
                <div className="password-strength-requirements">
                  <span className={form.password.length >= 6 ? 'valid' : 'invalid'}>
                    • At least 6 characters
                  </span>
                  <span className={/[A-Z]/.test(form.password) ? 'valid' : 'invalid'}>
                    • Uppercase letter
                  </span>
                  <span className={/[0-9]/.test(form.password) ? 'valid' : 'invalid'}>
                    • Number
                  </span>
                  <span className={/[^a-zA-Z0-9]/.test(form.password) ? 'valid' : 'invalid'}>
                    • Special character
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="form-field">
            <label>Role <span className="required">*</span></label>
            <select
              name="admin-role"
              id="admin-role"
              value={form.role}
              onChange={e => set('role', e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-create"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Admin'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminModal;