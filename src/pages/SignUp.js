import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import { validateSignUp } from "../utils/validators";

const emptyForm = {
  name: "", email: "", phone: "",
  address: "", city: "", province: "",
  password: "", confirmPassword: "", agree: false
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

  return (
    <section>
      <h1>Sign up</h1>
      <form onSubmit={submit} noValidate className="flex flex-col gap-2">
        <Alert>{serverError}</Alert>

        <h2>Personal information</h2>
        <FormField label="Full name" name="name" value={form.name} onChange={change} error={errors.name} autoComplete="name" />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} autoComplete="email" />
        <FormField label="Mobile number" name="phone" type="tel" placeholder="09123456789" value={form.phone} onChange={change} error={errors.phone} autoComplete="tel" />

        <h2>Address</h2>
        <FormField label="Street address" name="address" value={form.address} onChange={change} error={errors.address} autoComplete="street-address" />
        <FormField label="City / Municipality" name="city" value={form.city} onChange={change} error={errors.city} />
        <FormField label="Province" name="province" value={form.province} onChange={change} error={errors.province} />

        <h2>Account security</h2>
        <FormField label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} autoComplete="new-password" />
        <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} error={errors.confirmPassword} autoComplete="new-password" />

        <div>
          <label>
            <input type="checkbox" name="agree" checked={form.agree} onChange={change} /> I agree to the clinic's terms and privacy policy
          </label>
          {errors.agree && <small role="alert">{errors.agree}</small>}
        </div>

        <button disabled={loading}>{loading ? "Please wait…" : "Create account"}</button>
      </form>
      <p>Have an account? <Link to="/login">Log in</Link></p>
    </section>
  );
}