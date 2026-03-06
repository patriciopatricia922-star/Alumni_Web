import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
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
import Feedback from './survey/Feedback';
import AlumniEngagement from './survey/Alumniengagement';
import SurveyComplete from './survey/SurveyComplete';
import Discounts from './pages/Discounts';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<AlumniIDRegistration />} />
      <Route path="/terms" element={<TermsOfService />}/>
      <Route path="/privacy" element={<PrivacyPolicy />}/>
      <Route path="/signup" element={<Signup />} />  
      <Route path="/login" element={<Login />} />    
      <Route path="/dashboard" element={<AlumniDashboard />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/personal-information" element={<PersonalInformation />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact-support" element={<ContactSupport />} />
      <Route path="/survey/personal-background" element={<PersonalBackground />} />
      <Route path="/survey/educational-background" element={<EducationalBackground />} />
      <Route path="/survey/certification-achievement" element={<CertificationAchievement />} />
      <Route path="/survey/employment-information" element={<EmploymentInformation />} />
      <Route path="/survey/job-experience" element={<JobExperience />} />
      <Route path="/survey/skills-and-competencies" element={<SkillsAndCompetencies />} />
      <Route path="/survey/feedback" element={<Feedback />} />
      <Route path="/survey/alumni-engagement" element={<AlumniEngagement />} />
      <Route path="/survey/complete" element={<SurveyComplete />} />
      <Route path="/discounts" element={<Discounts />} />
    </Routes>
  );
}

export default App;