import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const USER_KEY = "shopcore_user";
const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
const writeUser = (u) => {
  try {
    u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? readUser() : null));

  const updateUser = useCallback((u) => {
    setUser(u);
    writeUser(u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    writeUser(null);
    setUser(null);
  }, []);

  // register and login both answer { success, token, user }
  const finish = (data) => {
    if (!data.token) throw new Error("The server did not return a token.");
    setToken(data.token);
    updateUser(data.user);
  };
  const login = async (creds) => finish(await api.login(creds));
  const register = async (details) => finish(await api.register(details));

  // An expired or invalid token anywhere signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // Refresh the profile (and role) on load.
  useEffect(() => {
    if (!getToken()) return;
    api
      .me()
      .then((d) => {
        const u = d.user || d.data;
        if (u) updateUser(u);
      })
      .catch(() => {});
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}
