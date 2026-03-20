import { supabase } from './supabase';

export const logAction = async ({
  action,
  module,
  description,
  recordId = null,
  status = 'Success',
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', user.id)
      .single();

    await supabase.from('audit_logs').insert({
      user_id:    user.id,
      user_email: profile?.email,
      user_role:  profile?.role,
      action,
      module,
      description,
      record_id:  recordId ? String(recordId) : null,
      status,
    });
  } catch (e) {
    // never crash the app over a failed log
    console.warn('Audit log failed:', e.message);
  }
};