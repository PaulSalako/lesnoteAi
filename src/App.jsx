// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
// import { DataProvider } from "./contexts/NoteContext";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { GoogleOAuthProvider } from "@react-oauth/google";
import VerifyEmail from "./pages/VerifyEmail";
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardHome from './dashboard/pages/DashboardHome';

import NotePromptPage from './dashboard/components/NotePromptPage/NotePromptPage';
import NoteChatPage from './dashboard/components/NoteChatPage/NoteChatPage';
import AllNotes from './dashboard/components/Notes/AllNotes';

import PlanPromptPage from './dashboard/components/PlanPromptPage/PlanPromptPage';
import PlanChatPage from './dashboard/components/PlanChatPage/PlanChatPage';
import AllPlans from './dashboard/components/Plans/AllPlans';

import AssessmentPromptPage from './dashboard/components/AssessmentPromptPage/AssessmentPromptPage';
import AssessmentChatPage from './dashboard/components/AssessmentChatPage/AssessmentChatPage';
import AllAssessment from './dashboard/components/Assessment/AllAssessment';



function App() {
  const clientId = "650098995580-m4gl92otbmg0ptr6dtqmb24lulujd7oh.apps.googleusercontent.com";
  const redirectUri = "http://localhost:5173";

  return (
    
      
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />

              <Route path="lesson-note" element={<NotePromptPage />} />
              <Route path="note-chat/:id" element={<NoteChatPage />} />
              <Route path="notes" element={<AllNotes />} />

              <Route path="lesson-plan" element={<PlanPromptPage />} />
              <Route path="lesson-plan-chat/:id" element={<PlanChatPage />} />
              <Route path="lesson-plans" element={<AllPlans />} />

              <Route path="lesson-assessment" element={<AssessmentPromptPage />} />
              <Route path="lesson-assessment-chat/:id" element={<AssessmentChatPage />} />
              <Route path="assessments" element={<AllAssessment />} />


            </Route>
          </Routes>
        </BrowserRouter>

  );
}

export default App;