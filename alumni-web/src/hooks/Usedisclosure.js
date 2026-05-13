// hooks/useDisclosure.js
// ============================================================================
// Shared hook — fetches the singleton disclosures row (id = 1) from Supabase
// and subscribes to real-time changes so every consumer (TermsModal,
// PrivacyPolicyModal, AboutView, IDRegistrationView …) always shows the
// most-recent Last Updated date without a page reload.
//
// Usage:
//   const { disclosure, loading } = useDisclosure();
//   // disclosure?.updated_at  — ISO timestamp of last admin save
//   // disclosure?.tos_content — rich-text HTML (not used by read-only modals
//   //                           but available for future use)
//   // disclosure?.pp_content
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const useDisclosure = () => {
  const [disclosure, setDisclosure] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let channel;

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('disclosures')
        .select('id, tos_content, pp_content, updated_at')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        // Row absent on first-run is normal — not an actionable error.
        console.warn('[useDisclosure] fetch warning:', error.message);
      } else if (data) {
        setDisclosure(data);
      }
      setLoading(false);
    };

    fetch();

    // Real-time subscription — re-fetches whenever the admin saves the row.
    // This keeps every open modal's Last Updated date in sync immediately
    // without requiring the user to reload the page.
    channel = supabase
      .channel('disclosure-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'disclosures', filter: 'id=eq.1' },
        () => fetch()
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { disclosure, loading };
};

export default useDisclosure;