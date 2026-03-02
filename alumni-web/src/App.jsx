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
    </Routes>
  );
}

export default App;  