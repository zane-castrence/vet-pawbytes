import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthShell, { ALERT_CLASS, AuthButton, AuthDivider, AuthLink, AuthSection } from "../components/AuthShell";
import GoogleButton from "../components/GoogleButton";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import { validateSignUp } from "../utils/validators";

const emptyForm = {
  name: "", email: "", phone: "",
  address: "", city: "", province: "",
  password: "", confirmPassword: "", agree: false,
};

export default function SignUp() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const home = (u) => (u.role === "customer" ? "/services" : "/admin");
  if (user) return <Navigate to={home(user)} replace />;

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateSignUp(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setServerError("");
    try {
      // confirmPassword and agree are only for validation, so don't save them
      const { confirmPassword, agree, ...data } = form;
      const u = await register(data);
      navigate(home(u));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const f = (name, label, extra = {}) => (
    <FormField theme="auth" label={label} name={name} value={form[name]} onChange={change} error={errors[name]} {...extra} />
  );

  return (
    <AuthShell
      wide
      title="Create your account"
      subtitle="Book appointments for your pets."
      footer={<>Have an account? <AuthLink to="/login">Log in</AuthLink></>}
    >
      <GoogleButton label="Sign up with Google" />
      <AuthDivider />

      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <Alert className={ALERT_CLASS}>{serverError}</Alert>

        <AuthSection>Personal information</AuthSection>
        <div className="grid gap-3 sm:grid-cols-2">
          {f("name", "Full name", { autoComplete: "name" })}
          {f("phone", "Mobile number", { type: "tel", placeholder: "09123456789", autoComplete: "tel" })}
        </div>
        {f("email", "Email", { type: "email", autoComplete: "email" })}

        <AuthSection>Address</AuthSection>
        {f("address", "Street address", { autoComplete: "street-address" })}
        <div className="grid gap-3 sm:grid-cols-2">
          {f("city", "City / Municipality")}
          {f("province", "Province")}
        </div>

        <AuthSection>Account security</AuthSection>
        <div className="grid gap-3 sm:grid-cols-2">
          {f("password", "Password", { type: "password", autoComplete: "new-password" })}
          {f("confirmPassword", "Confirm password", { type: "password", autoComplete: "new-password" })}
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-[#4B5563]">
            <input type="checkbox" name="agree" checked={form.agree} onChange={change} className="mt-0.5 h-4 w-4 accent-[#047857]" />
            I agree to the clinic's terms and privacy policy
          </label>
          {errors.agree && <small role="alert" className="mt-1 block text-xs text-red-600">{errors.agree}</small>}
        </div>

        <AuthButton loading={loading}>Create account</AuthButton>
      </form>
    </AuthShell>
  );
}