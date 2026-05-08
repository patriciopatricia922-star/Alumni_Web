/**
 * CreateAdminModal.jsx
 *
 * Extends the existing Create Admin modal to include Module Permissions selection.
 *
 * What changed vs. the original:
 *  - Added `module_permissions` field to form state (object, all false by default)
 *  - Added Module Permissions section in the UI (checkbox grid, mirrors Figma)
 *  - `module_permissions` is persisted to the `users` table on creation
 *  - All existing role logic, validation, and Supabase calls are UNCHANGED
 *
 * What did NOT change:
 *  - Role selection (admin / superadmin)
 *  - Email domain validation
 *  - Password strength logic
 *  - Audit logging
 *  - onCreated / onClose callbacks
 */

import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { supabaseAdmin } from '../../lib/supabaseadmin';
import { logAction } from '../../lib/auditLogger';
import {
  MODULE_META,
  DEFAULT_PERMISSIONS,
  permissionsFromArray,
} from '../../utils/Modulepermissions';
import './CreateAdminModal.css';

// ─── Component ────────────────────────────────────────────────────────────────

const CreateAdminModal = ({ onClose, onCreated }) => {
  // ── Form state (role fields unchanged) ──────────────────────────────────────
  const [form, setForm] = useState({
    first_name: '',
    last_name:  '',
    email:      '',
    password:   '',
    role:       'admin',
  });

  // ── Module permissions state ─────────────────────────────────────────────────
  // Tracks which module keys are checked. Stored as a Set for O(1) toggle.
  const [selectedModules, setSelectedModules] = useState(new Set());

  // ── UI state (unchanged) ─────────────────────────────────────────────────────
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');
  const [showPassword,     setShowPassword]     = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Helpers (unchanged) ──────────────────────────────────────────────────────
  const validateEmail = (email) => email.endsWith('@nu-dasma.edu.ph');

  const checkPasswordStrength = (password) => {
    if (!password) { setPasswordStrength({ score: 0, text: '', color: '' }); return; }

    let score = 0;
    if (password.length >= 8)          score += 1;
    else if (password.length >= 6)     score += 0.5;
    if (/[a-z]/.test(password))        score += 0.5;
    if (/[A-Z]/.test(password))        score += 0.5;
    if (/[0-9]/.test(password))        score += 0.5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;

    let strengthLevel, strengthText, strengthColor;
    if      (score < 1.5) { strengthLevel = 1; strengthText = 'Weak';   strengthColor = '#EF4444'; }
    else if (score < 2.5) { strengthLevel = 2; strengthText = 'Fair';   strengthColor = '#F59E0B'; }
    else if (score < 3.5) { strengthLevel = 3; strengthText = 'Good';   strengthColor = '#10B981'; }
    else                  { strengthLevel = 4; strengthText = 'Strong'; strengthColor = '#00A63E'; }

    setPasswordStrength({
      score:      strengthLevel,
      text:       strengthText,
      color:      strengthColor,
      percentage: (score / 4) * 100,
    });
  };

  const handlePasswordChange = (e) => {
    const v = e.target.value;
    set('password', v);
    checkPasswordStrength(v);
  };

  // ── Module toggle ────────────────────────────────────────────────────────────
  const toggleModule = (key) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Select-all / deselect-all helpers (convenience UX)
  const allSelected  = MODULE_META.every(m => selectedModules.has(m.key));
  const noneSelected = selectedModules.size === 0;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedModules(new Set());
    } else {
      setSelectedModules(new Set(MODULE_META.map(m => m.key)));
    }
  };

  // ── Create handler (role logic preserved; module_permissions added) ──────────
  const handleCreate = async () => {
    setError('');

    // ── Validation (unchanged) ──────────────────────────────────────────────
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
    if (passwordStrength.score < 2) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    // ── Build module_permissions payload ────────────────────────────────────
    // Superadmins inherit ALL modules automatically (canAccessModule handles
    // this at runtime), so we store whatever was selected in the UI.
    // For regular admins only the explicitly checked modules are stored.
    const module_permissions = permissionsFromArray(Array.from(selectedModules));

    setLoading(true);
    try {
      // ── Auth user creation (unchanged) ──────────────────────────────────
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email:         form.email,
        password:      form.password,
        email_confirm: true,
        user_metadata: {
          first_name: form.first_name,
          last_name:  form.last_name,
          role:       form.role,
        },
      });
      if (authErr) throw authErr;

      const uid = authData?.user?.id;
      if (!uid) throw new Error('User creation failed.');

      // ── DB insert — now includes module_permissions ──────────────────────
      const { error: insertErr } = await supabaseAdmin.from('users').insert({
        id:                 uid,
        email:              form.email,
        first_name:         form.first_name,
        last_name:          form.last_name,
        role:               form.role,
        account_status:     'active',
        module_permissions, // ← NEW column
      });

      if (insertErr) {
        // Roll back auth user if DB insert fails (unchanged behaviour)
        await supabaseAdmin.auth.admin.deleteUser(uid);
        throw insertErr;
      }

      // ── Audit log (unchanged) ────────────────────────────────────────────
      await logAction({
        action:      'Create',
        module:      'User Management',
        description: `Created new ${form.role} account for ${form.email}`,
        recordId:    uid,
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-admin-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header (unchanged) ───────────────────────────────────────── */}
        <div className="modal-header">
          <div>
            <h2>Create New Admin</h2>
            <p>Add a new admin or superadmin account</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Error banner (unchanged) ──────────────────────────────────── */}
        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">

          {/* ── Name row (unchanged) ─────────────────────────────────────── */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="admin-first-name">
                First Name <span className="required">*</span>
              </label>
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
              <label htmlFor="admin-last-name">
                Last Name <span className="required">*</span>
              </label>
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

          {/* ── Email (unchanged) ─────────────────────────────────────────── */}
          <div className="form-field">
            <label htmlFor="admin-email">
              Email <span className="required">*</span>
            </label>
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

          {/* ── Password (unchanged) ──────────────────────────────────────── */}
          <div className="form-field">
            <label htmlFor="admin-password">
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
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
                onClick={() => setShowPassword(s => !s)}
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {form.password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width:      `${passwordStrength.percentage}%`,
                      background: passwordStrength.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <div className="password-strength-text" style={{ color: passwordStrength.color }}>
                  Password Strength: {passwordStrength.text}
                </div>
                <div className="password-strength-requirements">
                  <span className={form.password.length >= 6  ? 'valid' : 'invalid'}>• At least 6 characters</span>
                  <span className={/[A-Z]/.test(form.password) ? 'valid' : 'invalid'}>• Uppercase letter</span>
                  <span className={/[0-9]/.test(form.password) ? 'valid' : 'invalid'}>• Number</span>
                  <span className={/[^a-zA-Z0-9]/.test(form.password) ? 'valid' : 'invalid'}>• Special character</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Role (unchanged) ──────────────────────────────────────────── */}
          <div className="form-field">
            <label htmlFor="admin-role">
              Role <span className="required">*</span>
            </label>
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

          {/* ══ NEW — Module Permissions ════════════════════════════════════ */}
          <div className="form-field module-permissions-field">
            <div className="module-permissions-header">
              <label className="module-permissions-label">
                Module Permissions
              </label>
              {/* Select-all toggle — convenience shortcut */}
              <button
                type="button"
                className="module-select-all-btn"
                onClick={handleSelectAll}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Superadmin notice */}
            {form.role === 'superadmin' && (
              <div className="module-superadmin-notice">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="6.5" stroke="#155DFC" strokeWidth="1"/>
                  <path d="M7 6.5V10M7 4.5V5" stroke="#155DFC" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Superadmin accounts automatically have access to all modules.
                Selections below are still saved for reference.
              </div>
            )}

            <div
              className="module-permissions-grid"
              role="group"
              aria-label="Module Permissions"
            >
              {MODULE_META.map((mod) => {
                const checked = selectedModules.has(mod.key);
                const id      = `module-${mod.key}`;
                return (
                  <label
                    key={mod.key}
                    htmlFor={id}
                    className={`module-checkbox-item ${checked ? 'module-checkbox-item--checked' : ''}`}
                  >
                    {/* Custom checkbox */}
                    <span className={`module-checkbox-box ${checked ? 'module-checkbox-box--checked' : ''}`}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                          <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      id={id}
                      name={id}
                      className="module-checkbox-input"
                      checked={checked}
                      onChange={() => toggleModule(mod.key)}
                    />
                    <span className="module-checkbox-label">{mod.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Selection summary */}
            <p className="module-selection-summary">
              {noneSelected
                ? 'No modules selected — this admin will have no module access.'
                : `${selectedModules.size} of ${MODULE_META.length} module${selectedModules.size !== 1 ? 's' : ''} selected`}
            </p>
          </div>
          {/* ══ END Module Permissions ══════════════════════════════════════ */}

        </div>{/* /.modal-form */}

        {/* ── Footer (unchanged) ────────────────────────────────────────── */}
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