import { createContext, useContext, useEffect, useState } from "react";
import { googleLogin, initializeDemoData, loginUser, registerUser } from "../services/api";
import { loadClinicSettings } from "../services/clinicSettings";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    initializeDemoData();
    return JSON.parse(localStorage.getItem("session") || "null");
  });

  // Refresh the clinic hours from the server on app start when someone is already logged in.
  useEffect(() => { if (user) loadClinicSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // `u` includes the JWT (`token`); the whole object is stored so api.js can send it.
  const save = (u) => { localStorage.setItem("session", JSON.stringify(u)); setUser(u); loadClinicSettings(); return u; };
  const login = async (creds) => save(await loginUser(creds));
  const register = async (data) => save(await registerUser(data));
  const loginWithGoogle = async (code) => save(await googleLogin(code));
  const logout = () => { localStorage.removeItem("session"); setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout }}>{children}</AuthContext.Provider>;
}
