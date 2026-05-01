import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Shared module-level cache — prevents redundant API calls across components
// ─────────────────────────────────────────────────────────────────────────────
let _cachedProfile = null;
let _fetchPromise  = null;
const _subscribers = new Set();

const notifySubscribers = (profile) => {
  _cachedProfile = profile;
  _subscribers.forEach((fn) => fn(profile));
};

// ─────────────────────────────────────────────────────────────────────────────
// Map: Database column → Frontend JS key
// ─────────────────────────────────────────────────────────────────────────────
export const DB_TO_PROFILE = {
  id:             'id',
  email:          'email',
  first_name:     'firstName',
  middle_name:    'middleName',
  last_name:      'lastName',
  gender:         'gender',
  birthday:       'birthday',
  civil_status:   'civilStatus',
  street_address: 'street',
  city:           'city',
  province:       'province',
  zip_code:       'zipCode',
  country:        'country',
  contact_number: 'contactNumber',
  program:        'academicProgram',
  batch_year:     'yearGraduated',
  student_number: 'studentNumber',
  role:           'role',
};

const PROFILE_TO_DB = Object.fromEntries(
  Object.entries(DB_TO_PROFILE).map(([db, js]) => [js, db])
);

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
const useUserProfile = () => {
  const [profile,  setProfile]  = useState(_cachedProfile);
  const [loading,  setLoading]  = useState(!_cachedProfile);
  const mountedRef               = useRef(true);

  // Subscribe to shared cache updates
  useEffect(() => {
    const subscriber = (p) => {
      if (mountedRef.current) {
        setProfile(p);
        setLoading(false);
      }
    };
    _subscribers.add(subscriber);
    return () => {
      mountedRef.current = false;
      _subscribers.delete(subscriber);
    };
  }, []);

  // ── Fetch: users table + survey_progress.personal_background_data ────────
  // FIX: We now merge both sources so that every field the survey needs is
  //      available from the hook, regardless of where it is stored.
  //
  //  Priority (highest → lowest):
  //    1. users table  (authoritative for name, program, batch_year, email)
  //    2. personal_background_data JSONB  (authoritative for address, gender, etc.)
  //
  //  Fields present in both are taken from the users table so that a Profile
  //  modal save (which writes to users) is immediately reflected.
  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      if (mountedRef.current) setLoading(false);
      return;
    }

    if (!_fetchPromise) {
      _fetchPromise = Promise.all([
        // 1) users row
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),

        // 2) survey personal_background_data
        supabase
          .from('survey_progress')
          .select('personal_background_data')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])
        .then(([{ data: userData, error: userError }, { data: surveyRow, error: surveyError }]) => {
          if (userError)   console.error('[useUserProfile] users fetch error:',   userError.message);
          if (surveyError) console.error('[useUserProfile] survey fetch error:', surveyError.message);

          // ------------------------------------------------------------------
          // Build profile object
          // ------------------------------------------------------------------
          const p = {};

          // -- Step 1: seed from survey personal_background_data (lower priority)
          const bgData = surveyRow?.personal_background_data ?? {};
          // Map snake_case survey keys → camelCase profile keys
          const SURVEY_TO_PROFILE = {
            first_name:     'firstName',
            middle_name:    'middleName',
            last_name:      'lastName',
            email:          'email',
            gender:         'gender',
            birthday:       'birthday',
            civil_status:   'civilStatus',
            street_address: 'street',
            city:           'city',
            province:       'province',
            zip_code:       'zipCode',
            country:        'country',
            contact_number: 'contactNumber',
            student_number: 'studentNumber',
          };
          Object.entries(SURVEY_TO_PROFILE).forEach(([surveyKey, profileKey]) => {
            if (bgData[surveyKey] != null && bgData[surveyKey] !== '') {
              p[profileKey] = String(bgData[surveyKey]);
            }
          });

          // -- Step 2: overwrite with users table data (higher priority)
          if (userData) {
            Object.entries(DB_TO_PROFILE).forEach(([dbCol, jsKey]) => {
              if (userData[dbCol] != null && userData[dbCol] !== '') {
                p[jsKey] = String(userData[dbCol]);
              }
            });
          }

          // -- Step 3: always pull email from auth (most authoritative)
          p['email'] = user.email ?? p['email'] ?? '';

          // -- Step 4: ensure all keys exist (controlled inputs need strings)
          Object.values(DB_TO_PROFILE).forEach((jsKey) => {
            if (p[jsKey] == null) p[jsKey] = '';
          });

          return p;
        })
        .catch((err) => {
          console.error('[useUserProfile] fetchProfile error:', err.message);
          return null;
        })
        .finally(() => { _fetchPromise = null; });
    }

    const result = await _fetchPromise;
    notifySubscribers(result);
  }, []);

  useEffect(() => {
    if (!_cachedProfile) fetchProfile();
  }, [fetchProfile]);

  // ── Update: writes to users table only; survey JSONB is managed separately ─
  const updateProfile = async (changes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No active session');

      // Build DB payload — id + email are required to satisfy NOT NULL / upsert key
      const payload = {
        id:    user.id,
        email: user.email,
      };

      Object.entries(changes).forEach(([jsKey, val]) => {
        const dbCol = PROFILE_TO_DB[jsKey];
        if (dbCol && dbCol !== 'id' && dbCol !== 'email') {
          payload[dbCol] = val === '' ? null : val;
        }
      });

      const { error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      // Optimistic update of the shared cache
      const updatedProfile = { ..._cachedProfile, ...changes };
      notifySubscribers(updatedProfile);
      return { success: true };
    } catch (err) {
      console.error('[useUserProfile] updateProfile error:', err.message);
      return { success: false, error: err.message };
    }
  };

  return { profile, loading, updateProfile, refresh: fetchProfile };
};

export default useUserProfile;