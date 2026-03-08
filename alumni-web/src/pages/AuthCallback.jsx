import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const BLOCKED_EMAILS = ['nudaao@nu-dasma.edu.ph', 'superadmin@nu-dasma.edu.ph'];

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // If Supabase blocks the signup (Allow new users = OFF),
    // the SIGNED_IN event never fires — so we set a timeout
    // to redirect back to login with an error after 4 seconds.
    const timeout = setTimeout(() => {
      navigate('/login', {
        state: { error: 'This account is not registered yet. Sign up to login.' },
      });
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session) return;

        // Auth event fired — clear the timeout, we have a session to check
        clearTimeout(timeout);
        subscription.unsubscribe();

        const email = session.user.email?.toLowerCase().trim() || '';

        // 1. Block admin / superadmin
        if (BLOCKED_EMAILS.includes(email)) {
          await supabase.auth.signOut();
          navigate('/login', {
            state: { error: 'Admin accounts must log in with email and password.' },
          });
          return;
        }

        // 2. Check public.users — only registered alumni exist here
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, role')
          .eq('email', email)
          .maybeSingle();

        if (fetchError || !existingUser) {
          await supabase.auth.signOut();
          navigate('/login', {
            state: { error: 'This account is not registered yet. Sign up to login.' },
          });
          return;
        }

        // 3. Only alumni role allowed via Google
        if (existingUser.role !== 'alumni') {
          await supabase.auth.signOut();
          navigate('/login', {
            state: { error: 'Admin accounts must log in with email and password.' },
          });
          return;
        }

        // 4. All good — let them in
        navigate('/dashboard');
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  // ── Loading UI ────────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#002263',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '16px', fontFamily: 'Montserrat, Arial, sans-serif',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(255,255,255,0.2)',
        borderTop: '3px solid #D9CA81',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>
        Verifying your account…
      </p>
    </div>
  );
};

export default AuthCallback;