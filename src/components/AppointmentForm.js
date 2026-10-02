import { useEffect, useState } from "react";
import FormField from "./FormField";
import Alert from "./Alert";
import { validateAppointment } from "../utils/validators";
import { getClinicCatalog, getUnavailableTimes } from "../services/api";

export const STATUSES = ["Pending", "Scheduled", "Completed", "Cancelled"];
const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const TIMES = Array.from({ length: 19 }, (_, i) => {
  const m = 8 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});
const empty = { ownerName: "", petName: "", species: "", service: "", vet: "", date: "", time: "", notes: "", status: "Pending" };

// Used by admin/staff to book for a customer or edit an appointment
export default function AppointmentForm({ initial, onSubmit, onCancel, canManageStatus = false }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState({ services: [], vets: [] });
  const [taken, setTaken] = useState([]);
  const editing = !!initial?.id;

  useEffect(() => {
    getClinicCatalog().then(setCatalog).catch(() => setServerError("Couldn't load services and veterinarians."));
  }, []);

  useEffect(() => {
    if (!form.date || !form.vet) { setTaken([]); return; }
    getUnavailableTimes(form.date, form.vet, initial?.id).then(setTaken).catch(() => setTaken([]));
  }, [form.date, form.vet, initial?.id]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value, ...(name === "date" || name === "vet" ? { time: "" } : {}) });
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAppointment(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setServerError("");
    try { await onSubmit(form); }
    catch (err) { setServerError(err.message); }
    finally { setSaving(false); }
  };

  const options = (list) => list.map((o) => <option key={o}>{o}</option>);

  return (
    <form onSubmit={submit} noValidate className="grid gap-2">
      <h2>{editing ? "Edit appointment" : "Book for customer"}</h2>
      <Alert>{serverError}</Alert>
      <FormField label="Owner name" name="ownerName" value={form.ownerName} onChange={change} error={errors.ownerName} />
      <FormField label="Pet name" name="petName" value={form.petName} onChange={change} error={errors.petName} />
      <FormField label="Species" name="species" as="select" value={form.species} onChange={change} error={errors.species}>
        <option value="">Select…</option>{options(SPECIES)}
      </FormField>
      <FormField label="Service" name="service" as="select" value={form.service} onChange={change} error={errors.service}>
        <option value="">Select…</option>{options(catalog.services)}
      </FormField>
      <FormField label="Veterinarian" name="vet" as="select" value={form.vet} onChange={change} error={errors.vet}>
        <option value="">Select…</option>{options(catalog.vets)}
      </FormField>
      <FormField label="Date" name="date" type="date" value={form.date} onChange={change} error={errors.date} />
      <FormField label="Time" name="time" as="select" value={form.time} onChange={change} error={errors.time}>
        <option value="">Select…</option>
        {TIMES.map((t) => <option key={t} value={t} disabled={taken.includes(t)}>{t}{taken.includes(t) ? " (booked)" : ""}</option>)}
      </FormField>
      {canManageStatus && (
        <FormField label="Status" name="status" as="select" value={form.status} onChange={change}>{options(STATUSES)}</FormField>
      )}
      <FormField label="Notes (optional)" name="notes" as="textarea" rows="3" value={form.notes} onChange={change} error={errors.notes} />
      <div className="flex gap-2">
        <button disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Book appointment"}</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}