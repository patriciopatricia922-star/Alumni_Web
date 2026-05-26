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
import RewardStore from './pages/Rewardstore';
import Discounts from './pages/Discounts';
import Events from './pages/Events';
import Jobs from './pages/Jobs';
import ForgotPassword from './pages/Forgotpassword';
import AdminDashboard from './admin/AdminDashboard';
import AlumniManagement from './admin/AlumniManagement';
import ResponseAndAnalytics from './admin/Responseandanalytics';
import PredictiveAnalytics from './admin/PredictiveAnalytics';
import AuditLogs from './superadmin/AuditLogs';
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
import ResponseAnalytics from './superadmin/Responseandanalytics';
import PredictiveAnaly from './superadmin/PredictiveAnalytics';
import SurveyMgmt from './superadmin/SurveyManagement';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import PersonalBackgroundSHS from './surveyshs/PersonalBackgroundSHS';
import EducationalBackgroundSHS from './surveyshs/EducationalBackgroundSHS';
import EmploymentInformationSHS from './surveyshs/EmploymentInformationSHS';

// Cache for auth state to prevent repeated checks
let cachedSession = null;
let cachedUserRole = null;
let authCheckPromise = null;

const getAuthState = async () => {
  // Return cached values if they exist
  if (cachedSession !== null && cachedUserRole !== null) {
    return { session: cachedSession, userRole: cachedUserRole };
  }
  
  // Prevent multiple simultaneous checks
  if (authCheckPromise) {
    return authCheckPromise;
  }
  
  authCheckPromise = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      cachedSession = session;
      
      if (session?.user?.id) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        cachedUserRole = userData?.role || null;
      } else {
        cachedUserRole = null;
      }
      
      return { session: cachedSession, userRole: cachedUserRole };
    } catch (error) {
      console.error('Auth check error:', error);
      return { session: null, userRole: null };
    } finally {
      authCheckPromise = null;
    }
  })();
  
  return authCheckPromise;
};

// Clear auth cache on logout/expiry
const clearAuthCache = () => {
  cachedSession = null;
  cachedUserRole = null;
  authCheckPromise = null;
};

// Listen for auth changes to clear cache
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    clearAuthCache();
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    cachedSession = session;
    // Clear role cache to force refresh
    cachedUserRole = null;
  }
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = useState('checking');
  const location = useLocation();
  const [prevPath, setPrevPath] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const check = async () => {
      // Don't re-check if we're already authenticated and path hasn't changed significantly
      if (status === 'allowed' && prevPath === location.pathname) {
        return;
      }
      
      const { session, userRole } = await getAuthState();
      
      if (!isMounted) return;
      
      if (!session) { 
        setStatus('denied'); 
        return; 
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!userRole || !allowedRoles.includes(userRole)) { 
          setStatus('denied'); 
          return; 
        }
      }
      
      setStatus('allowed');
      setPrevPath(location.pathname);
    };
    
    check();
    
    return () => {
      isMounted = false;
    };
  }, [location.pathname, allowedRoles, status, prevPath]);

  if (status === 'checking') return null;
  if (status === 'denied') return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Main Authentication Routes */}
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

      {/* Main Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniDashboard /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['alumni']}><NotificationsPage /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute allowedRoles={['alumni']}><Announcements /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['alumni']}><Profile /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute allowedRoles={['alumni']}><About /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute allowedRoles={['alumni']}><RewardStore /></ProtectedRoute>} />
      <Route path="/discounts" element={<ProtectedRoute allowedRoles={['alumni']}><Discounts /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute allowedRoles={['alumni']}><Events /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute allowedRoles={['alumni']}><Jobs /></ProtectedRoute>} />
      <Route path="/update-tracer" element={<ProtectedRoute allowedRoles={['alumni']}><UpdateTracer /></ProtectedRoute>} />

      {/* College Survey */}
      <Route path="/survey/personal-background" element={<ProtectedRoute allowedRoles={['alumni']}><PersonalBackground /></ProtectedRoute>} />
      <Route path="/survey/educational-background" element={<ProtectedRoute allowedRoles={['alumni']}><EducationalBackground /></ProtectedRoute>} />
      <Route path="/survey/certification-achievement" element={<ProtectedRoute allowedRoles={['alumni']}><CertificationAchievement /></ProtectedRoute>} />
      <Route path="/survey/employment-information" element={<ProtectedRoute allowedRoles={['alumni']}><EmploymentInformation /></ProtectedRoute>} />
      <Route path="/survey/job-experience" element={<ProtectedRoute allowedRoles={['alumni']}><JobExperience /></ProtectedRoute>} />
      <Route path="/survey/skills-and-competencies" element={<ProtectedRoute allowedRoles={['alumni']}><SkillsAndCompetencies /></ProtectedRoute>} />
      <Route path="/survey/feedback-and-engagement" element={<ProtectedRoute allowedRoles={['alumni']}><FeedbackAndAlumniEngagement /></ProtectedRoute>} />
      <Route path="/survey/complete" element={<ProtectedRoute allowedRoles={['alumni']}><SurveyComplete /></ProtectedRoute>} />

      {/* SHS Survey */}
      <Route path="/surveyshs/shs-personal-background" element={<ProtectedRoute allowedRoles={['alumni']}><PersonalBackgroundSHS /></ProtectedRoute>} />
      <Route path="/surveyshs/shs-educational-background" element={<ProtectedRoute allowedRoles={['alumni']}><EducationalBackgroundSHS /></ProtectedRoute>} />
      <Route path="/surveyshs/shs-employment-information" element={<ProtectedRoute allowedRoles={['alumni']}><EmploymentInformationSHS /></ProtectedRoute>} />
      
      {/* Dummy Routes Placeholder */}
      {/*<Route path="/surveyshs/shs-certification-achievement" element={<ProtectedRoute allowedRoles={['alumni']}><CertificationAchievement /></ProtectedRoute>} />
      <Route path="/surveyshs/shs-job-experience" element={<ProtectedRoute allowedRoles={['alumni']}><JobExperience /></ProtectedRoute>} />
      <Route path="/surveyshs/shs-skills-and-competencies" element={<ProtectedRoute allowedRoles={['alumni']}><SkillsAndCompetencies /></ProtectedRoute>} />
      <Route path="/surveyshs/shs-feedback-and-engagement" element={<ProtectedRoute allowedRoles={['alumni']}><FeedbackAndAlumniEngagement /></ProtectedRoute>} />
      <Route path="/surveyshs/shs-complete" element={<ProtectedRoute allowedRoles={['alumni']}><SurveyComplete /></ProtectedRoute>} /> */}

        {/* Administrator Routes */}
      <Route path="/admin/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/alumni-management" element={<ProtectedRoute allowedRoles={['admin']}><AlumniManagement /></ProtectedRoute>} />
      <Route path="/admin/survey-management" element={<ProtectedRoute allowedRoles={['admin']}><SurveyManagement /></ProtectedRoute>} />
      <Route path="/admin/response-and-analytics" element={<ProtectedRoute allowedRoles={['admin']}><ResponseAndAnalytics /></ProtectedRoute>} />
      <Route path="/admin/predictive-analytics" element={<ProtectedRoute allowedRoles={['admin']}><PredictiveAnalytics /></ProtectedRoute>} />
      <Route path="/admin/content-mgmt" element={<ProtectedRoute allowedRoles={['admin']}><ContentManagement /></ProtectedRoute>} />
        
        {/* Super Administrator Routes */}
      <Route path="/superadmin/super-admin-dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboard /></ProtectedRoute>} />
      <Route path="/superadmin/audit-logs" element={<ProtectedRoute allowedRoles={['superadmin']}><AuditLogs /></ProtectedRoute>} />
      <Route path="/superadmin/admin-management" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminAccountManagement /></ProtectedRoute>} />
      <Route path="/superadmin/super-admin-alumni" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAlumni /></ProtectedRoute>} />
      <Route path="/superadmin/super-alumni-engagement" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminEngagement /></ProtectedRoute>} />
      <Route path="/superadmin/survey-management" element={<ProtectedRoute allowedRoles={['superadmin']}><SurveyMgmt /></ProtectedRoute>} />
      <Route path="/superadmin/response-and-analytics" element={<ProtectedRoute allowedRoles={['superadmin']}><ResponseAnalytics /></ProtectedRoute>} />
      <Route path="/superadmin/predictive-analytics" element={<ProtectedRoute allowedRoles={['superadmin']}><PredictiveAnaly /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;