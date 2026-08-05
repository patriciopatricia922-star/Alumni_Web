/**
 * useModulePermissions.js
 *
 * Hook that resolves which modules the currently logged-in admin can access.
 * Works alongside the existing role system — does NOT replace it.
 *
 * Usage:
 *   const { can, loading } = useModulePermissions();
 *   if (can(MODULES.REPORTS)) { ... }
 *
 * Or with the component form:
 *   <ModuleGate module={MODULES.REPORTS}>
 *     <ReportsPage />
 *   </ModuleGate>
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';       // adjust path as needed
import { canAccessModule } from '../utils/Modulepermissions'; // adjust path as needed

/**
 * useModulePermissions()
 *
 * @returns {{
 *   can: (moduleKey: string) => boolean,
 *   user: object | null,
 *   loading: boolean,
 * }}
 */
export function useModulePermissions() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      // 1. Get the currently authenticated Supabase user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || !active) {
        setLoading(false);
        return;
      }

      // 2. Fetch the full profile (including module_permissions) from the users table
      const { data, error } = await supabase
        .from('users')
        .select('id, role, module_permissions, account_status')
        .eq('id', authUser.id)
        .single();

      if (active) {
        if (!error && data) setUser(data);
        setLoading(false);
      }
    }

    loadUser();

    // Re-run if the auth state changes (sign-in / sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      loadUser();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * can(moduleKey) — memoised check so it's safe to use in render logic.
   */
  const can = useCallback(
    (moduleKey) => canAccessModule(user, moduleKey),
    [user]
  );

  return { can, user, loading };
}