import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard"; // Ensure this path is correct
import InterviewPage from "./components/UserDashboard/Simulation/Interviewpage"; // Ensure this path is correct
import Dashboard from './components/Home/Dashboard.jsx';
import UserLogin from './components/UserDashboard/LoginUser/UserLogin.jsx';
import UserSignup from './components/UserDashboard/SignupUser/UserSignup';
import AdminLogin from './components/AdminDashboard/AdminLogin.jsx'
import UserDashboard from './components/UserDashboard/DashboardUser/UserDashboard.jsx';
import Home from './components/Home/Homepage.jsx'
import ResumeUploadPage from "./components/UserDashboard/Simulation/ResumeUploadPage.jsx";
import FeedbackPage from './components/FeedbackPage/FeedbackPage'; 
import RequireRedirect from './components/RequireRedirect';
import CompatibilityTest from './components/UserDashboard/Compatibility/CompatibilityTest.jsx';
import { NavigationProvider } from "./components/NavigationContext.jsx";


function App(){
  const isAllowed = true;
  return (
    <Router>
      <Routes>
        <Route path="/InterviewPage/:command_id" element={<InterviewPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/usersignup" element={<UserSignup />} />
        <Route path="/userlogin" element={<UserLogin />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/UserDashboard" element={<UserDashboard />} />
        {/* <Route path="/upload-resume" element={<ResumeUploadPage />} /> */}
        <Route path="/upload-resume/:command_id" element={<ResumeUploadPage />} />
        <Route path="/CompatibilityTest/:command_id" element={<CompatibilityTest />} />
        <Route path="/feedback" element={<FeedbackPage  />} /> {/* Add the feedback route */}

                <Route
          path="/Dashboard"
          element={
            <RequireRedirect isAllowed={isAllowed}>
              <Dashboard />
            </RequireRedirect>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
