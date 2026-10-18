import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    setBusy(true);
    setError("");
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel form" onSubmit={submit}>
      <h1>Create account</h1>
      <label>
        Name
        <input required autoComplete="name" value={form.name} onChange={set("name")} />
      </label>
      <label>
        Email
        <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
      </label>
      <label>
        Password (at least 8 characters)
        <input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>
        {busy ? "Creating..." : "Sign up"}
      </button>
      <p className="muted">
        Already have an account? <Link to="/login" state={{ from }}>Log in</Link>
      </p>
    </form>
  );
}
