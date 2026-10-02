import { createContext, useContext, useState } from "react";
import { initializeDemoData, loginUser, registerUser } from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    initializeDemoData();
    return JSON.parse(localStorage.getItem("session") || "null");
  });

  const save = (u) => { localStorage.setItem("session", JSON.stringify(u)); setUser(u); return u; };
  const login = async (creds) => save(await loginUser(creds));
  const register = async (data) => save(await registerUser(data));
  const logout = () => { localStorage.removeItem("session"); setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
