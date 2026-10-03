import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell, { ALERT_CLASS, AuthButton, AuthDivider, AuthLink } from "../components/AuthShell";
import GoogleButton from "../components/GoogleButton";
import DemoAccounts from "../components/DemoAccounts";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import { validateAuth } from "../utils/validators";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const home = (u) => (u.role === "customer" ? "/services" : "/admin");
  if (user) return <Navigate to={home(user)} replace />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAuth(form, false);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setServerError("");
    try {
      const u = await login(form);
      navigate(home(u));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your account."
      footer={<>New here? <AuthLink to="/signup">Sign up</AuthLink></>}
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <Alert className={ALERT_CLASS}>{serverError}</Alert>
        <FormField theme="auth" label="Email" name="email" type="email" placeholder="name@email.com" value={form.email} onChange={change} error={errors.email} autoComplete="email" />
        <FormField theme="auth" label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} autoComplete="current-password" />
        <AuthButton loading={loading}>Log in</AuthButton>
      </form>

      <AuthDivider />
      <GoogleButton label="Continue with Google" />

      <DemoAccounts onPick={(email, password) => setForm({ email, password })} /> {/* DEMO: delete this line */}
    </AuthShell>
  );
}