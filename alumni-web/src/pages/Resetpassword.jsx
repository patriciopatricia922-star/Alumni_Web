// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import ResetPasswordView from '../Views/Resetpasswordview';

// const getStrength = (pw) => {
//   let score = 0;
//   if (pw.length >= 8)          score++;
//   if (/[A-Z]/.test(pw))        score++;
//   if (/[0-9]/.test(pw))        score++;
//   if (/[^A-Za-z0-9]/.test(pw)) score++;
//   return score;
// };

// const ResetPassword = () => {
//   const navigate = useNavigate();

//   const [showNew,         setShowNew]         = useState(false);
//   const [showConfirm,     setShowConfirm]     = useState(false);
//   const [newPassword,     setNewPassword]     = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading,         setLoading]         = useState(false);
//   const [error,           setError]           = useState('');
//   const [success,         setSuccess]         = useState(false);

//   const strength = getStrength(newPassword);

//   const handleReset = async () => {
//     setError('');
//     if (!newPassword || !confirmPassword) return setError('Please fill in both fields.');
//     if (newPassword.length < 8)           return setError('Password must be at least 8 characters long.');
//     if (newPassword !== confirmPassword)  return setError('Passwords do not match.');

//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.updateUser({ password: newPassword });
//       if (error) throw error;
//       setSuccess(true);
//       // Navigate to landing page — user can open login modal from there
//       setTimeout(() => navigate('/'), 2000);
//     } catch (err) {
//       setError(err.message || 'Failed to reset password. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ResetPasswordView
//       showNew={showNew}
//       showConfirm={showConfirm}
//       newPassword={newPassword}
//       confirmPassword={confirmPassword}
//       loading={loading}
//       error={error}
//       success={success}
//       strength={strength}
//       setShowNew={setShowNew}
//       setShowConfirm={setShowConfirm}
//       setNewPassword={setNewPassword}
//       setConfirmPassword={setConfirmPassword}
//       handleReset={handleReset}
//     />
//   );
// };

// export default ResetPassword;