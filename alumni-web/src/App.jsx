import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import LandingPage from './pages/Landingpage';
import AlumniIDRegistration from './pages/AlumniIDRegistration';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Signup from './pages/Signup';
import Login from './pages/Login';
import AlumniDashboard from './pages/AlumniDashboard';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import PersonalInformation from './pages/PersonalInformation';
import ChangePassword from './pages/Changepassword';
import About from './pages/About';
import ContactSupport from './pages/ContactSupport';
import PersonalBackground from './survey/PersonalBackground';
import EducationalBackground from './survey/Educationalbackground';
import CertificationAchievement from './survey/Certificationachievement';
import EmploymentInformation from './survey/Employmentinformation';
import JobExperience from './survey/Jobexperience';
import SkillsAndCompetencies from './survey/Skillsandcompetencies';
import SurveyComplete from './survey/SurveyComplete';
import Discounts from './pages/Discounts';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import ForgotPassword from './pages/Forgotpassword';
import AdminDashboard from './admin/AdminDashboard';
import AlumniManagement from './admin/AlumniManagement';
import ResponseAndAnalytics from './admin/Responseandanalytics';
import PredictiveAnalytics from './admin/PredictiveAnalytics';
import SuperAdminDashboard from './superadmin/Superadmindashboard';
import DetailedAuditLogs from './superadmin/Detailedauditlogs';
import SuperAdminAlumni from './superadmin/Superadminalumni';
import AuthCallback from './pages/AuthCallback';
import VerificationCode from './pages/Verificationcode';
import ResetPassword from './pages/Resetpassword';
import SurveyManagement from './admin/SurveyManagement';
import UpdateTracer from './pages/UpdateTracer';
import AdminAccountManagement from './superadmin/Adminaccountmanagement';
import SuperAdminEngagement from './superadmin/Superadminengagement';
import TermsOfServiceAbout from './pages/Termsofserviceabout';
import PrivacyPolicyAbout from './pages/Privacypolicyabout';
import NotificationsPage from './pages/Notificationspage';
import FeedbackAndAlumniEngagement from './survey/Feedbackandalumniengagement';
import ContentManagement from './admin/ContentManagement';
// import DynamicSurvey from './pages/DynamicSurvey';

// ─── Protected Route ──────────────────────────────────────────────────────────
// Checks for a valid Supabase session before rendering the page.
// If no session then redirect to /login.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setStatus('denied');
        return;
      }

      // If specific roles are required, verify per public.users
      if (allowedRoles) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!userData || !allowedRoles.includes(userData.role)) {
          setStatus('denied');
          return;
        }
      }

      setStatus('allowed');
    };

    check();
  }, [location.pathname]);

  if (status === 'checking') return null; 
  if (status === 'denied') return <Navigate to="/login" replace />;
  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<AlumniIDRegistration />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<VerificationCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* ── Alumni protected routes ── */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniDashboard /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['alumni']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute allowedRoles={['alumni']}><Announcements /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['alumni']}><Profile /></ProtectedRoute>} />
      <Route path="/personal-information" element={<ProtectedRoute allowedRoles={['alumni']}><PersonalInformation /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute allowedRoles={['alumni']}><ChangePassword /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute allowedRoles={['alumni']}><About /></ProtectedRoute>} />
      <Route path="/terms-about" element={<ProtectedRoute allowedRoles={['alumni']}><TermsOfServiceAbout/></ProtectedRoute>} />
      <Route path="/privacy-about" element={<ProtectedRoute allowedRoles={['alumni']}><PrivacyPolicyAbout /></ProtectedRoute>} />
      <Route path="/contact-support" element={<ProtectedRoute allowedRoles={['alumni']}><ContactSupport /></ProtectedRoute>} />
      <Route path="/discounts" element={<ProtectedRoute allowedRoles={['alumni']}><Discounts /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute allowedRoles={['alumni']}><Events /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute allowedRoles={['alumni']}><Jobs /></ProtectedRoute>} />
      <Route path="/update-tracer" element={<ProtectedRoute allowedRoles={['alumni']}><UpdateTracer /></ProtectedRoute>} />
      {/* ── Survey protected routes ── */}
      {/* <Route path="/survey/:sectionId" element={<DynamicSurvey />} />
      <Route path="/survey/complete" element={<SurveyComplete />} /> */}
      <Route path="/survey/personal-background" element={<ProtectedRoute allowedRoles={['alumni']}><PersonalBackground /></ProtectedRoute>} />
      <Route path="/survey/educational-background" element={<ProtectedRoute allowedRoles={['alumni']}><EducationalBackground /></ProtectedRoute>} />
      <Route path="/survey/certification-achievement" element={<ProtectedRoute allowedRoles={['alumni']}><CertificationAchievement /></ProtectedRoute>} />
      <Route path="/survey/employment-information" element={<ProtectedRoute allowedRoles={['alumni']}><EmploymentInformation /></ProtectedRoute>} />
      <Route path="/survey/job-experience" element={<ProtectedRoute allowedRoles={['alumni']}><JobExperience /></ProtectedRoute>} />
      <Route path="/survey/skills-and-competencies" element={<ProtectedRoute allowedRoles={['alumni']}><SkillsAndCompetencies /></ProtectedRoute>} />
      <Route path="/survey/feedback-and-engagement" element={<ProtectedRoute allowedRoles={['alumni']}><FeedbackAndAlumniEngagement /></ProtectedRoute>} />
      <Route path="/survey/complete" element={<ProtectedRoute allowedRoles={['alumni']}><SurveyComplete /></ProtectedRoute>} />

      {/* ── Admin protected routes (For testing) ── */}
      <Route path="/admin/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/alumni-management" element={<ProtectedRoute allowedRoles={['admin']}><AlumniManagement /></ProtectedRoute>} />
      <Route path="/admin/survey-management" element={<ProtectedRoute allowedRoles={['admin']}><SurveyManagement /></ProtectedRoute>} />
      <Route path="/admin/response-and-analytics" element={<ProtectedRoute allowedRoles={['admin']}><ResponseAndAnalytics /></ProtectedRoute>} />
      <Route path="/admin/predictive-analytics" element={<ProtectedRoute allowedRoles={['admin']}><PredictiveAnalytics /></ProtectedRoute>} />
      <Route path="/admin/content-mgmt" element={<ProtectedRoute allowedRoles={['admin']}><ContentManagement/></ProtectedRoute>} />

      {/* ── Super Admin protected routes (For testing) ── */}
      <Route path="/superadmin/super-admin-dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/superadmin/audit-logs" element={<ProtectedRoute allowedRoles={['superadmin']}><DetailedAuditLogs /></ProtectedRoute>} />
      <Route path= "/superadmin/admin-management" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminAccountManagement/></ProtectedRoute>} />
      <Route path= "/superadmin/super-admin-alumni" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAlumni/></ProtectedRoute>} />
      <Route path= "/superadmin/super-alumni-engagement" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminEngagement/></ProtectedRoute>} />
    
    </Routes>
  );
}

export default App;