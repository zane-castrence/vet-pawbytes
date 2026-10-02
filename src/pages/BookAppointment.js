import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createAppointment, getClinicCatalog, getPets, getUnavailableTimes } from "../services/api";
import { validateAppointment } from "../utils/validators";
import FormField from "../components/FormField";
import Alert from "../components/Alert";

// 8:00 AM to 5:00 PM in 30-minute slots
const TIMES = Array.from({ length: 19 }, (_, i) => {
  const m = 8 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [catalog, setCatalog] = useState({ services: [], vets: [] });
  const [taken, setTaken] = useState([]);
  const [form, setForm] = useState({
    ownerName: user.name, petId: "", petName: "", species: "",
    service: params.get("service") || "", vet: "", date: "", time: "", notes: "", status: "Pending"
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getPets(user.id), getClinicCatalog()])
      .then(([p, c]) => { setPets(p); setCatalog(c); })
      .catch(() => setServerError("Couldn't load your pets and services. Refresh to try again."));
  }, [user.id]);

  // Re-check unavailable times whenever the vet or date changes
  useEffect(() => {
    if (!form.date || !form.vet) { setTaken([]); return; }
    getUnavailableTimes(form.date, form.vet).then(setTaken).catch(() => setTaken([]));
  }, [form.date, form.vet]);

  const change = (e) => {
    const { name, value } = e.target;
    if (name === "petId") {
      const pet = pets.find((p) => p.id === value);
      setForm({ ...form, petId: value, petName: pet?.name || "", species: pet?.species || "" });
    } else {
      setForm({ ...form, [name]: value, ...(name === "date" || name === "vet" ? { time: "" } : {}) });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAppointment(form);
    if (!form.petId) found.petId = "Choose one of your saved pets.";
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setServerError("");
    try {
      const appointment = await createAppointment(user.id, form, { requirePetProfile: true });
      navigate("/confirmation", { state: { appointment } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <section>
      <h1>Book an appointment</h1>
      {pets.length === 0 && <p>You need a pet profile first. <Link to="/my-pets">Add a pet</Link></p>}
      <form onSubmit={submit} noValidate className="flex flex-col gap-2">
        <Alert>{serverError}</Alert>
        <FormField label="Pet" name="petId" as="select" value={form.petId} onChange={change} error={errors.petId}>
          <option value="">Select…</option>
          {pets.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
        </FormField>
        <FormField label="Service" name="service" as="select" value={form.service} onChange={change} error={errors.service}>
          <option value="">Select…</option>
          {catalog.services.map((s) => <option key={s}>{s}</option>)}
        </FormField>
        <FormField label="Veterinarian" name="vet" as="select" value={form.vet} onChange={change} error={errors.vet}>
          <option value="">Select…</option>
          {catalog.vets.map((v) => <option key={v}>{v}</option>)}
        </FormField>
        <FormField label="Date" name="date" type="date" min={today} value={form.date} onChange={change} error={errors.date} />
        <FormField label="Time" name="time" as="select" value={form.time} onChange={change} error={errors.time}>
          <option value="">Select…</option>
          {TIMES.map((t) => <option key={t} value={t} disabled={taken.includes(t)}>{t}{taken.includes(t) ? " (booked)" : ""}</option>)}
        </FormField>
        <FormField label="Notes (optional)" name="notes" as="textarea" rows="3" value={form.notes} onChange={change} error={errors.notes} />
        <button disabled={saving}>{saving ? "Booking…" : "Book appointment"}</button>
      </form>
    </section>
  );
}
