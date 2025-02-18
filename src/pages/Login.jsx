import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getState } from "../contexts/NoteContext";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
function Login() {
  const { handleLogin } = getState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleLogin(email, password);
    if (success) navigate("/dashboard");
  };
  const handleGoogleSuccess = async (response) => {
    const userData = jwtDecode(response.credential); // Decode user info from token
    const success = await handleGoogleLogin(userData);
    if (success) navigate("/dashboard");
  };

  const handleGoogleFailure = () => {
    alert("Google Login Failed. Try again!");
  };
  return (
    <div className="login">
      <div className="login-container">
        <img src="/result.svg" alt="login-image" />
        <div className="login-page">
          <h2 className="logo">LesNote</h2>
          <div>
            <h3>Login</h3>
            <small style={{ color: "#ccc", fontSize: "16px" }}>
              Welcome back! Please sign in to continue
            </small>
          </div>
          <div>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>

          <div className="divider">or</div>
          <form onSubmit={handleSubmit}>
            <div className="login-input-div">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-input-div">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="checkbox-flex">
                <div className="checkbox-div">
                  <input type="checkbox" className="checkbox" />{" "}
                  <label>Remember me</label>
                </div>
                <span>Forgot password?</span>
              </div>
            </div>
            <button className="login-btn">Continue ►</button>

            <div className="login-ques-div">
              <p>Didn't have an account?</p>
              <Link to="/sign-up"> Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
