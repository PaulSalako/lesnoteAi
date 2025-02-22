// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { DataProvider } from "./contexts/NoteContext";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { GoogleOAuthProvider } from "@react-oauth/google";
import VerifyEmail from "./pages/VerifyEmail";
import DashboardLayout from './dashboard/DashboardLayout';
import DashboardHome from './dashboard/pages/DashboardHome';
import PromptPage from './dashboard/components/PromptPage/PromptPage';
import ChatPage from './dashboard/components/ChatPage/ChatPage';


function App() {
  const clientId = "650098995580-m4gl92otbmg0ptr6dtqmb24lulujd7oh.apps.googleusercontent.com";
  const redirectUri = "http://localhost:5173";

  return (
    <GoogleOAuthProvider clientId={clientId} redirectUri={redirectUri}>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="new" element={<PromptPage />} />
              <Route path="chat/:id" element={<ChatPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </GoogleOAuthProvider>
  );
}

export default App;