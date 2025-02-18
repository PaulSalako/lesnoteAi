import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { getState } from "../contexts/NoteContext";
import "./SignUp.css";

function SignUp() {
  const { handleSignup } = getState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const submitSignup = async (e) => {
    e.preventDefault();
    const success = await handleSignup(email, password);
    if (success) navigate("/verify");
  };

  return (
    <div className="sign_up">
      <img src="/sign-up.svg" alt="login-image" className="sign-img" />
      <div className="signup-container">
        <Link to="/" className="close-btn" >
          ✖
        </Link>
        <h1 className="logo">LesNote</h1>
        <h2>Create an account</h2>
        <p className="subtitle">
          Welcome! Please fill in your details to get started
        </p>

        <button className="google-btn">
          <img
            src="https://img.icons8.com/?size=100&id=V5cGWnc9R4xj&format=png&color=000000"
            alt="gogle-img"
          />
          Continue with Google
        </button>

        <div className="divider">or</div>

        <form onSubmit={submitSignup}>
          <div className="name-fields">
            <div className="input-group">
              <label>First Name</label>
              <input type="text" placeholder="First name" required />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" placeholder="Last name" required />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter your Password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="options">
            <label className="checkbox">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>

          <div className="terms">
            <label>
              <input type="checkbox" required />I agree to the{" "}
              <a href="#">Terms of Use</a> and accept the{" "}
              <a href="#">privacy policy</a>
            </label>
          </div>

          <button type="submit" className="submit-btn">
            Continue ►
          </button>
        </form>

        <p className="signin-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
