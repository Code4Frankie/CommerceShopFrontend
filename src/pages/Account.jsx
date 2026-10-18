import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Account() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy("profile");
    try {
      const d = await api.updateMe({ name: profile.name.trim(), phone: profile.phone.trim() });
      updateUser(d.user || { ...user, ...profile });
      toast("Profile updated", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy("");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast("New password must be at least 8 characters", "error");
    setBusy("password");
    try {
      await api.changePassword(pw);
      setPw({ currentPassword: "", newPassword: "" });
      toast("Password changed", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy("");
    }
  };

  return (
    <>
      <h1>My account</h1>
      <p className="muted">{user?.email}</p>
      <div className="two-col">
        <form className="panel form wide" onSubmit={saveProfile}>
          <h2>Profile</h2>
          <label>
            Name
            <input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </label>
          <label>
            Phone
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          </label>
          <button className="btn" disabled={busy === "profile"}>
            {busy === "profile" ? "Saving..." : "Save changes"}
          </button>
        </form>

        <form className="panel form wide" onSubmit={savePassword}>
          <h2>Change password</h2>
          <label>
            Current password
            <input type="password" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </label>
          <label>
            New password
            <input type="password" required minLength={8} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </label>
          <button className="btn" disabled={busy === "password"}>
            {busy === "password" ? "Saving..." : "Change password"}
          </button>
        </form>
      </div>
    </>
  );
}
