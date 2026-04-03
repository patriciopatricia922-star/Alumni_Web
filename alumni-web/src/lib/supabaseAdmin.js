import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yqpihidkxnfxsikjfjuj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcGloaWRreG5meHNpa2pmanVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM3MzQwMiwiZXhwIjoyMDg1OTQ5NDAyfQ.LFKfOxZ2TQbjcCLaF-hr_t_NsJchKXv5ikIIGpKT_4Q';

let adminInstance = null;
 
const getSupabaseAdmin = () => {
  if (!adminInstance) {
    adminInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      db: { schema: 'public' },
      auth: {
        autoRefreshToken:   false,
        persistSession:     false,
        detectSessionInUrl: false,
        storageKey:         'sb-admin-service-key',
      },
    });
  }
  return adminInstance;
};
 
export const supabaseAdmin = getSupabaseAdmin();