import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="panel">
        <h1>Password updated</h1>
        <p>You can now log in with your new password.</p>
        <Link to="/login" className="btn">
          Log in
        </Link>
      </div>
    );

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Choose a new password</h1>
      <label>
        New password (at least 8 characters)
        <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>
        {busy ? "Saving..." : "Update password"}
      </button>
    </form>
  );
}
