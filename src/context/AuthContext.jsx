import { createContext, useContext, useState } from "react";
import { api, getToken, setToken } from "../api.js";

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? readUser() : null));

  const finish = (data) => {
    const token = data.token || data.accessToken;
    if (!token) throw new Error("Server did not return a token.");
    const u = data.user || { name: data.name, email: data.email };
    setToken(token);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setUser(u);
  };

  const login = async (creds) => finish(await api.login(creds));
  const register = async (details) => {
    const data = await api.register(details);
    // Some backends log you in on register, others don't.
    if (data.token || data.accessToken) finish(data);
    else await login({ email: details.email, password: details.password });
  };
  const logout = () => {
    setToken(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
