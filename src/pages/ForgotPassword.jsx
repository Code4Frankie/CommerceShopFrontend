import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <div className="panel">
        <h1>Check your email</h1>
        <p>If an account exists for {email}, we have sent a link to reset your password.</p>
        <Link to="/login" className="btn">
          Back to log in
        </Link>
      </div>
    );

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Forgot password</h1>
      <label>
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>
        {busy ? "Sending..." : "Send reset link"}
      </button>
      <p className="muted">
        <Link to="/login">Back to log in</Link>
      </p>
    </form>
  );
}
