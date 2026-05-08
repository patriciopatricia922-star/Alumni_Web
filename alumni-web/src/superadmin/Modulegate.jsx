/**
 * ModuleGate.jsx
 *
 * Declarative wrapper that renders children only when the logged-in user
 * has access to the specified module.
 *
 * Usage:
 *   import { ModuleGate } from '../components/ModuleGate';
 *   import { MODULES } from '../utils/modulePermissions';
 *
 *   // Hides entirely if no access
 *   <ModuleGate module={MODULES.REPORTS}>
 *     <ReportsNavItem />
 *   </ModuleGate>
 *
 *   // Shows a custom fallback instead
 *   <ModuleGate module={MODULES.AUDIT} fallback={<AccessDenied />}>
 *     <AuditPage />
 *   </ModuleGate>
 *
 *   // Disable a button instead of hiding it
 *   <ModuleGate module={MODULES.EXPORT} renderDisabled>
 *     {(allowed) => (
 *       <button disabled={!allowed} onClick={handleExport}>
 *         Export
 *       </button>
 *     )}
 *   </ModuleGate>
 */

import React from 'react';
import { useModulePermissions } from '../hooks/useModulePermissions'; // adjust path

// ─── ModuleGate ───────────────────────────────────────────────────────────────

/**
 * @param {object}  props
 * @param {string}  props.module         - MODULES.* key to check
 * @param {React.ReactNode} [props.children]  - Content to show when access granted
 * @param {React.ReactNode} [props.fallback]  - Content to show when access denied (default: null)
 * @param {boolean} [props.renderDisabled]   - When true, children is called as a render-prop
 *                                             receiving `allowed: boolean` rather than being
 *                                             conditionally mounted. Use this when you want to
 *                                             render the element in a disabled state.
 */
export function ModuleGate({
  module: moduleKey,
  children,
  fallback = null,
  renderDisabled = false,
}) {
  const { can, loading } = useModulePermissions();

  // While the permission state is loading, render nothing to avoid flicker
  if (loading) return null;

  const allowed = can(moduleKey);

  // Render-prop form — lets parent control disabled state
  if (renderDisabled && typeof children === 'function') {
    return children(allowed);
  }

  // Standard conditional rendering
  return allowed ? children : fallback;
}

export default ModuleGate;