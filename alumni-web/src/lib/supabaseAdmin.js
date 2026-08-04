// backend/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // only matters locally; Railway ignores this and uses its own env

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminInstance = null;
const getSupabaseAdmin = () => {
  if (!adminInstance) {
    adminInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      db: { schema: 'public' },
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
  }
  return adminInstance;
};

export const supabaseAdmin = getSupabaseAdmin();