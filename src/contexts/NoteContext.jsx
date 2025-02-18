import { useEffect } from "react";
import { useContext, useState } from "react";
import { createContext } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const AppContext = createContext();

function DataProvider({ children }) {
  const storeTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(storeTheme);

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [isVerified, setIsVerified] = useState(false);

  // For theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }

  //  SIGNUP FUNCTION
  const handleSignup = async (email, password) => {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setEmail(email);
      localStorage.setItem("email", email);
    } else {
      alert(data.message);
    }
  };

  //  LOGIN FUNCTION
  const handleLogin = async (email, password) => {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
    } else {
      alert(data.message);
    }
  };

  //  LOGOUT FUNCTION
  // const handleLogout = () => {
  //   setUser(null);
  //   setToken("");
  //   localStorage.removeItem("token");
  //   navigate("/");
  // };

  //  VERIFY CODE FUNCTION
  const handleVerify = async (code) => {
    const response = await fetch("http://localhost:5000/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    if (response.ok) {
      setIsVerified(true);
      alert("Email verified successfully!");
    } else {
      alert("Invalid code! Try again.");
    }
  };

  //  RESEND VERIFICATION CODE FUNCTION
  const resendCode = async () => {
    const response = await fetch("http://localhost:5000/api/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("New verification code sent to your email.");
    } else {
      alert(data.message);
    }
  };

  //  GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        // navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  // Protect routes data
  const fetchProtectedData = async () => {
    const response = await fetch("http://localhost:5000/api/protected", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();
    console.log(data);
  };

  return (
    <AppContext
      value={{
        toggleTheme,
        theme,
        user,
        token,
        handleLogin,
        handleSignup,
        resendCode,
        handleVerify,
        handleGoogleLogin,
      }}
    >
      {children}
    </AppContext>
  );
}
function getState() {
  const context = useContext(AppContext);
  if (!context) throw new Error("getState must be used within a FoodProvider");
  return context;
}

export { DataProvider, getState, AppContext };
