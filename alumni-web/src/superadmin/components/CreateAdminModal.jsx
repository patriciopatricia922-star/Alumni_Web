/**
 * CreateAdminModal.jsx
 *
 * Updated per PM direction: Super Admins do not set passwords for new
 * employees. The password field and password-strength UI have been removed.
 * New admins are now invited via Supabase's invite-by-email flow — they
 * receive an email with a link to set their own password on first login.
 *
 * What changed vs. the previous version:
 *  - Removed `password` from form state
 *  - Removed password input, show/hide toggle, and strength meter UI
 *  - Removed password validation (length / strength checks)
 *  - Swapped `supabaseAdmin.auth.admin.createUser({ password, ... })`
 *    for `supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: ... })`
 *  - Removed unused FaEye / FaEyeSlash import
 *
 * What did NOT change:
 *  - Role selection (admin / superadmin)
 *  - Email domain validation
 *  - Module Permissions section (grid, Select All, summary text)
 *  - Audit logging
 *  - onCreated / onClose callbacks
 *  - DB insert shape into `users` table
 */

import React, { useState } from 'react';
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
  // ── Form state (password removed — admins no longer set passwords) ─────────
  const [form, setForm] = useState({
    first_name: '',
    last_name:  '',
    email:      '',
    role:       'admin',
  });

  // ── Module permissions state ─────────────────────────────────────────────────
  // Tracks which module keys are checked. Stored as a Set for O(1) toggle.
  const [selectedModules, setSelectedModules] = useState(new Set());

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const validateEmail = (email) => email.endsWith('@nu-dasma.edu.ph');

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

  // ── Create handler ───────────────────────────────────────────────────────────
  const handleCreate = async () => {
    setError('');

    // ── Validation ────────────────────────────────────────────────────────────
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Admin accounts must use @nu-dasma.edu.ph email address.');
      return;
    }

    // ── Build module_permissions payload ────────────────────────────────────
    // Superadmins inherit ALL modules automatically (canAccessModule handles
    // this at runtime), so we store whatever was selected in the UI.
    // For regular admins only the explicitly checked modules are stored.
    const module_permissions = permissionsFromArray(Array.from(selectedModules));

    setLoading(true);
    try {
      // ── Invite the new admin by email (no password set here) ────────────
      // Supabase sends an email with a secure link; the recipient sets their
      // own password on first login.
      const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        form.email,
        {
          data: {
            first_name: form.first_name,
            last_name:  form.last_name,
            role:       form.role,
          },
        }
      );
      if (inviteErr) throw inviteErr;

      const uid = inviteData?.user?.id;
      if (!uid) throw new Error('Admin invite failed.');

      // ── DB insert — includes module_permissions ──────────────────────────
      const { error: insertErr } = await supabaseAdmin.from('users').insert({
        id:                 uid,
        email:              form.email,
        first_name:         form.first_name,
        last_name:          form.last_name,
        role:               form.role,
        account_status:     'active',
        module_permissions,
      });

      if (insertErr) {
        // Roll back the invited auth user if DB insert fails
        await supabaseAdmin.auth.admin.deleteUser(uid);
        throw insertErr;
      }

      // ── Audit log ─────────────────────────────────────────────────────────
      await logAction({
        action:      'Create',
        module:      'User Management',
        description: `Invited new ${form.role} account for ${form.email}`,
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

        {/* ── Header ───────────────────────────────────────────────────── */}
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

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && <div className="modal-error">{error}</div>}

        <div className="modal-form">

          {/* ── Name row ─────────────────────────────────────────────────── */}
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

          {/* ── Email ─────────────────────────────────────────────────────── */}
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
            <span className="email-hint">
              Must end with @nu-dasma.edu.ph — an invite link will be sent to this address.
            </span>
          </div>

          {/* ── Role ──────────────────────────────────────────────────────── */}
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

          {/* ── Module Permissions ═══════════════════════════════════════════ */}
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

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-create"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Sending invite…' : 'Create Admin Account'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateAdminModal;