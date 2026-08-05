/**
 * EditPermissionsModal.jsx
 *
 * Standalone modal for editing an existing admin's module_permissions.
 * Opens pre-populated with the admin's current permissions.
 *
 * What this touches:
 *  - Reads  `admin.module_permissions` (JSONB from users table)
 *  - Writes `module_permissions` back via a Supabase UPDATE
 *  - Fires `onSaved(updatedAdmin)` so the parent can patch local state without a re-fetch
 *  - Fires `onClose()` to let the parent close the modal
 *
 * What this does NOT touch:
 *  - Role assignment
 *  - account_status / access toggle
 *  - Any other field on the users row
 */

import React, { useState, useEffect } from 'react';
// import { supabaseAdmin } from '../../../backend/supabaseAdmin';
import { logAction } from '../../lib/auditLogger';
import {
  MODULE_META,
  permissionsFromArray,
  permissionsToArray,       // ← was incorrectly imported as arrayFromPermissions
} from '../../utils/modulePermissions';
import './EditPermissionsModal.css';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api`;

// ─── Component ────────────────────────────────────────────────────────────────

const EditPermissionsModal = ({ admin, onClose, onSaved }) => {
  // Derive initial selected set from the admin's stored permissions
  const [selectedModules, setSelectedModules] = useState(() => {
    const enabled = permissionsToArray(admin?.module_permissions ?? {});
    return new Set(enabled);
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Re-sync if the admin prop changes (parent re-renders with fresh data)
  useEffect(() => {
    const enabled = permissionsToArray(admin?.module_permissions ?? {});
    setSelectedModules(new Set(enabled));
  }, [admin?.id]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toggleModule = (key) => {
    setSelectedModules(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const allSelected  = MODULE_META.every(m => selectedModules.has(m.key));
  const noneSelected = selectedModules.size === 0;

  const handleSelectAll = () => {
    setSelectedModules(
      allSelected ? new Set() : new Set(MODULE_META.map(m => m.key))
    );
  };

  // ── Save handler ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setError('');
    setLoading(true);

    // try {
    //   const module_permissions = permissionsFromArray(Array.from(selectedModules));

    //   const { error: updateErr } = await supabaseAdmin
    //     .from('users')
    //     .update({ module_permissions })
    //     .eq('id', admin.id);

    //   if (updateErr) throw updateErr;

    //   await logAction({
    try {
      const module_permissions = permissionsFromArray(Array.from(selectedModules));

      const res = await fetch(`${API_BASE}/admin/alumni/${admin.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module_permissions }),
      });

      if (!res.ok) throw new Error("Failed to update permissions");

      await logAction({
        action:      'Update',
        module:      'User Management',
        description: `Updated module permissions for ${admin.email}`,
        recordId:    admin.id,
      });

      // 1. Notify parent to patch its local admins array.
      onSaved({ ...admin, module_permissions });

      // 2. Close the modal — single source of truth for closing after a save.
      onClose();
    } catch (e) {
      console.error('EditPermissionsModal save error:', e);
      setError(e.message || 'Failed to update permissions.');
    } finally {
      setLoading(false);
    }
  };

  const fullName = [admin?.first_name, admin?.last_name].filter(Boolean).join(' ') || admin?.email || 'Admin';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="ep-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit Module Permissions"
    >
      <div className="ep-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="ep-header">
          <div className="ep-header-text">
            <h2>Edit Module Permissions</h2>
            <p>
              <span className="ep-admin-name">{fullName}</span>
              <span className="ep-role-pill ep-role-pill--admin">
                {admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            </p>
          </div>
          <button className="ep-close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Superadmin notice ─────────────────────────────────────────── */}
        {admin?.role === 'superadmin' && (
          <div className="ep-superadmin-notice">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6.5" stroke="#155DFC" strokeWidth="1"/>
              <path d="M7 6.5V10M7 4.5V5" stroke="#155DFC" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Superadmin accounts have access to all modules at runtime regardless of these settings.
            Selections are saved for reference only.
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && <div className="ep-error">{error}</div>}

        {/* ── Permission grid ──────────────────────────────────────────── */}
        <div className="ep-section">
          <div className="ep-section-header">
            <span className="ep-section-label">Module Access</span>
            <button
              type="button"
              className="ep-select-all-btn"
              onClick={handleSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div
            className="ep-grid"
            role="group"
            aria-label="Module permissions"
          >
            {MODULE_META.map((mod) => {
              const checked = selectedModules.has(mod.key);
              const id      = `ep-module-${mod.key}`;
              return (
                <label
                  key={mod.key}
                  htmlFor={id}
                  className={`ep-item ${checked ? 'ep-item--checked' : ''}`}
                >
                  <span className={`ep-checkbox ${checked ? 'ep-checkbox--checked' : ''}`}>
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    id={id}
                    className="ep-checkbox-input"
                    checked={checked}
                    onChange={() => toggleModule(mod.key)}
                  />
                  <span className="ep-item-label">{mod.label}</span>
                </label>
              );
            })}
          </div>

          <p className="ep-summary">
            {noneSelected
              ? 'No modules selected — this admin will have no module access.'
              : `${selectedModules.size} of ${MODULE_META.length} module${selectedModules.size !== 1 ? 's' : ''} selected`}
          </p>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="ep-footer">
          <button className="ep-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="ep-btn-save"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Permissions'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditPermissionsModal;