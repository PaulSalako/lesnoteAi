// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./homepage/LandingPage/LandingPage";
import "./App.css";
import Login from "./homepage/Login/Login";
import SignUp from "./homepage/Register/SignUp";
import ForgotPassword from "./homepage/ForgotPassword/ForgotPassword";
import ResetPassword from "./homepage/ResetPassword/ResetPassword";
import VerifyEmail from "./homepage/VerifyEmail/VerifyEmail";
import DashboardLayout from './dashboard/DashboardLayout/DashboardLayout';
import DashboardHome from './dashboard/pages/DashboardHome';

import NotePromptPage from './dashboard/NotePromptPage/NotePromptPage';
import NoteChatPage from './dashboard/NoteChatPage/NoteChatPage';
import AllNotes from './dashboard/Notes/AllNotes';

import NoteSearchPage from './dashboard/NoteSearchPage/NoteSearchPage';
import NoteSearchView from './dashboard/NoteSearchView/NoteSearchView';


import PlanPromptPage from './dashboard/PlanPromptPage/PlanPromptPage';
import PlanChatPage from './dashboard/PlanChatPage/PlanChatPage';
import AllPlans from './dashboard/Plans/AllPlans';

import AssessmentPromptPage from './dashboard/AssessmentPromptPage/AssessmentPromptPage';
import AssessmentChatPage from './dashboard/AssessmentChatPage/AssessmentChatPage';
import AllAssessment from './dashboard/Assessment/AllAssessment';

import AIChatSupport from './dashboard/AIChatSupport/AIChatSupport';

import ManageUsers from './dashboard/ManageUsers/ManageUsers';
import ManageClass from './dashboard/ManageClass/ManageClass';
import ManageSubject from './dashboard/ManageSubject/ManageSubject';
import ManageTopic from './dashboard/ManageTopic/ManageTopic';
import ManageTheme from './dashboard/ManageTheme/ManageTheme';
import ManageLessonStructure from './dashboard/ManageLessonStructure/ManageLessonStructure';



function App() {
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

              <Route path="note-search" element={<NoteSearchPage />} />
              <Route path="view-note/:id" element={<NoteSearchView />} />


              <Route path="lesson-plan" element={<PlanPromptPage />} />
              <Route path="lesson-plan-chat/:id" element={<PlanChatPage />} />
              <Route path="lesson-plans" element={<AllPlans />} />

              <Route path="lesson-assessment" element={<AssessmentPromptPage />} />
              <Route path="lesson-assessment-chat/:id" element={<AssessmentChatPage />} />
              <Route path="assessments" element={<AllAssessment />} />

              <Route path="ai-chat" element={<AIChatSupport />} />

              <Route path="manage-users" element={<ManageUsers />} />
              <Route path="manage-class" element={<ManageClass />} />
              <Route path="manage-subject" element={<ManageSubject />} />
              <Route path="manage-topic" element={<ManageTopic />} />
              <Route path="manage-theme" element={<ManageTheme />} />
              <Route path="manage-lesson-structure" element={<ManageLessonStructure />} />
            </Route>
          </Routes>
        </BrowserRouter>
  );
}
export default App;