import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { DataProvider } from "./contexts/NoteContext";
import "./App.css";
import Dashboard from "./ui/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { GoogleOAuthProvider } from "@react-oauth/google";

import VerifyEmail from "./pages/VerifyEmail";

function App() {
  const clientId =
    "650098995580-m4gl92otbmg0ptr6dtqmb24lulujd7oh.apps.googleusercontent.com";

  const redirectUri = "http://localhost:5173";
  return (
    <GoogleOAuthProvider clientId={clientId} redirectUri={redirectUri}>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
