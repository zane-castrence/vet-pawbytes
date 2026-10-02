import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DemoAccounts from "../components/DemoAccounts";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import { validateAuth } from "../utils/validators";

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = false;
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const home = (u) => (u.role === "customer" ? "/services" : "/admin");
  if (user) return <Navigate to={home(user)} replace />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAuth(form, isRegister);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setServerError("");
    try {
      const u = await (isRegister ? register(form) : login(form));
      navigate(home(u));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1>{isRegister ? "Sign up" : "Log in"}</h1>
      <form onSubmit={submit} noValidate className="flex flex-col gap-2">
        <Alert>{serverError}</Alert>
        {isRegister && <FormField label="Full name" name="name" value={form.name} onChange={change} error={errors.name} />}
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} />
        <button disabled={loading}>{loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}</button>
      </form>
      <p>{isRegister ? <>Have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/signup">Sign up</Link></>}</p>
       <DemoAccounts onPick={(email, password) => setForm({ email, password })} /> {/* DEMO: delete this line */}
    </section>
  );
}
