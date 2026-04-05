import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Shared state to prevent redundant API calls across components
let _cachedProfile = null;
let _fetchPromise = null;
const _subscribers = new Set();

const notifySubscribers = (profile) => {
  _cachedProfile = profile;
  _subscribers.forEach((fn) => fn(profile));
};

// Map Database Column -> Frontend JS Key
export const DB_TO_PROFILE = {
  id: 'id',
  email: 'email',
  first_name: 'firstName',
  middle_name: 'middleName',
  last_name: 'lastName',
  gender: 'gender',
  birthday: 'birthday',
  civil_status: 'civilStatus',
  street_address: 'street',
  city: 'city',
  province: 'province',
  zip_code: 'zipCode',
  country: 'country',
  contact_number: 'contactNumber',
  program: 'academicProgram',
  batch_year: 'yearGraduated',
  student_number: 'studentNumber', // Added to match your View
  role: 'role'
};

const PROFILE_TO_DB = Object.fromEntries(
  Object.entries(DB_TO_PROFILE).map(([db, js]) => [js, db])
);

const useUserProfile = () => {
  const [profile, setProfile] = useState(_cachedProfile);
  const [loading, setLoading] = useState(!_cachedProfile);
  const mountedRef = useRef(true);

  useEffect(() => {
    const subscriber = (p) => { if (mountedRef.current) { setProfile(p); setLoading(false); } };
    _subscribers.add(subscriber);
    return () => { mountedRef.current = false; _subscribers.delete(subscriber); };
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    if (!_fetchPromise) {
      _fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          if (!data) return null;
          
          const p = {};
          Object.entries(DB_TO_PROFILE).forEach(([db, js]) => {
            p[js] = data[db] ?? ''; // Default to empty string for controlled inputs
          });
          return p;
        })
        .catch((err) => {
          console.error("[useUserProfile] Fetch Error:", err.message);
          return null;
        })
        .finally(() => { _fetchPromise = null; });
    }

    const result = await _fetchPromise;
    notifySubscribers(result);
  }, []);

  useEffect(() => { if (!_cachedProfile) fetchProfile(); }, [fetchProfile]);

  const updateProfile = async (changes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active session");

      // Build payload with required DB fields first
      const payload = { 
        id: user.id,
        email: user.email // FIX: Prevents the 'null value in email' error
      };

      // Map JS keys back to DB columns
      Object.entries(changes).forEach(([jsKey, val]) => {
        const dbCol = PROFILE_TO_DB[jsKey];
        // Don't overwrite the ID or Email manually
        if (dbCol && dbCol !== 'id' && dbCol !== 'email') {
          payload[dbCol] = val === '' ? null : val;
        }
      });

      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      const updatedProfile = { ..._cachedProfile, ...changes };
      notifySubscribers(updatedProfile);
      return { success: true };
    } catch (err) {
      console.error("[useUserProfile] Update Error:", err.message);
      return { success: false, error: err.message };
    }
  };

  return { profile, loading, updateProfile, refresh: fetchProfile };
};

export default useUserProfile;