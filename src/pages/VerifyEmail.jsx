import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getState } from "../contexts/NoteContext";

function VerifyEmail() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { resendCode, handleVerify } = getState();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const success = await handleVerify(code);
    if (code.length > 4 || code.length < 4) return null;
    if (success) navigate("/login");
  };

  return (
    <div>
      <div>
        <h2>Verify Your Email</h2>
        <p>Enter the verification code sent to your email.</p>

        {success ? (
          <p style={{ color: "green" }}>
            ✅ Verification successful! Redirecting to login...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Code"
              required
            />
            <button type="submit">Verify</button>
          </form>
        )}
        <div>
          <p>Didn't receive any code?</p>{" "}
          <button onClick={resendCode}>Resend code</button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default VerifyEmail;
