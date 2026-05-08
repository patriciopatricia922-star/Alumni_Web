/**
 * modulePermissions.js
 * Central registry for module-level access control.
 *
 * Usage:
 *   import { MODULES, DEFAULT_PERMISSIONS, moduleLabel } from './modulePermissions';
 *
 * This file is intentionally free of React/Supabase deps so it can be
 * imported by both UI components and server-side helpers without side-effects.
 */

// ─── Module Registry ────────────────────────────────────────────────────────

/**
 * MODULES — canonical keys used everywhere (DB, routing, UI checks).
 * Add new modules here; the rest of the system picks them up automatically.
 */
export const MODULES = {
  ENGAGEMENT: 'engagement',
  ALUMNI:     'alumni',
  REPORTS:    'reports',
  AUDIT:      'audit',
  EXPORT:     'export',
  SURVEY:     'survey',
};

/**
 * MODULE_META — display labels, descriptions, and icons for the UI.
 * Ordered as they should appear in the modal grid (left-to-right, top-to-bottom).
 */
export const MODULE_META = [
  {
    key:         MODULES.ENGAGEMENT,
    label:       'Engagement Module',
    description: 'Manage events, posts, and community engagement features.',
  },
  {
    key:         MODULES.ALUMNI,
    label:       'Alumni Module',
    description: 'Access and manage alumni records and profiles.',
  },
  {
    key:         MODULES.REPORTS,
    label:       'Reports Module',
    description: 'View and generate system and analytics reports.',
  },
  {
    key:         MODULES.AUDIT,
    label:       'Audit Module',
    description: 'Access audit logs and system activity history.',
  },
  {
    key:         MODULES.EXPORT,
    label:       'Export Access',
    description: 'Export data to CSV, PDF, and other formats.',
  },
  {
    key:         MODULES.SURVEY,
    label:       'Survey Module',
    description: 'Create, distribute, and analyse surveys.',
  },
];

// ─── Default Permissions ────────────────────────────────────────────────────

/**
 * Default module access map — all modules OFF by default.
 * Superadmins receive all modules automatically (see canAccessModule).
 */
export const DEFAULT_PERMISSIONS = Object.values(MODULES).reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {}
);

/**
 * ALL_PERMISSIONS — every module enabled (used for superadmins).
 */
export const ALL_PERMISSIONS = Object.values(MODULES).reduce(
  (acc, key) => ({ ...acc, [key]: true }),
  {}
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * canAccessModule(user, moduleKey)
 * Core permission check — call this everywhere you need to gate access.
 *
 * Rules:
 *   1. Superadmins always have full access.
 *   2. For admins, check the module_permissions JSON column on the user record.
 *   3. Missing/null permissions → denied (fail-safe).
 *
 * @param {object} user          - User record (role, module_permissions)
 * @param {string} moduleKey     - One of MODULES.*
 * @returns {boolean}
 */
export function canAccessModule(user, moduleKey) {
  if (!user) return false;
  if (user.role === 'superadmin') return true;

  const perms = user.module_permissions;
  if (!perms || typeof perms !== 'object') return false;

  return perms[moduleKey] === true;
}

/**
 * permissionsFromArray(keys)
 * Convert an array of module keys to a permissions object.
 * Useful when converting checkbox state → DB payload.
 *
 * @param {string[]} keys
 * @returns {object}  e.g. { engagement: true, alumni: false, ... }
 */
export function permissionsFromArray(keys) {
  return Object.values(MODULES).reduce(
    (acc, key) => ({ ...acc, [key]: keys.includes(key) }),
    {}
  );
}

/**
 * permissionsToArray(permissionsObj)
 * Convert a permissions object → array of enabled module keys.
 * Useful for initialising checkbox state from DB data.
 *
 * @param {object} permissionsObj
 * @returns {string[]}
 */
export function permissionsToArray(permissionsObj) {
  if (!permissionsObj || typeof permissionsObj !== 'object') return [];
  return Object.entries(permissionsObj)
    .filter(([, val]) => val === true)
    .map(([key]) => key);
}

/**
 * moduleLabel(key)
 * Returns the human-readable label for a module key.
 *
 * @param {string} key
 * @returns {string}
 */
export function moduleLabel(key) {
  return MODULE_META.find(m => m.key === key)?.label ?? key;
}