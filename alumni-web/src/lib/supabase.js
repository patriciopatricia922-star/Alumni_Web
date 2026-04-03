import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yqpihidkxnfxsikjfjuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcGloaWRreG5meHNpa2pmanVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzM0MDIsImV4cCI6MjA4NTk0OTQwMn0.7TodktOppRjW1MlE7xExi3ATcU-sC6lUcyPhX6vAfqU';


let userInstance = null;
 
const getSupabase = () => {
  if (!userInstance) {
    userInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      db: { schema: 'public' },
      auth: {
        autoRefreshToken:  true,
        persistSession:    true,
        detectSessionInUrl: true,
      },
      realtime: {
        timeout: 30_000,
      },
    });
  }
  return userInstance;
};
 
export const supabase = getSupabase();