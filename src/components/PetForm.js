import { useState } from "react";
import FormField from "./FormField";
import Alert from "./Alert";

const EMPTY = {
  name: "", species: "", breed: "", sex: "", birthday: "",
  weightKg: "", vaccinationStatus: "Unknown", allergies: "", medicalNotes: "",
  photoUrl: "",
};
const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Other"];
const AREA =
  "rounded-lg border border-[#D8DEE3] bg-white px-3 py-2 text-[15px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:border-[#2A3BD9] focus:ring-2 focus:ring-[#2A3BD9]/20";
const today = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

// onDelete is optional: pass it only when editing an existing pet
export default function PetForm({ initial, submitLabel = "Save pet", onSubmit, onCancel, onDelete }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(Object.keys(EMPTY).map((k) => [k, initial?.[k] ?? EMPTY[k]]))
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // validation lives in api.js and throws one readable message
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err.message);
      setConfirming(false);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Alert className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[14px] font-medium text-[#B91C1C]">
        {error}
      </Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Pet name" name="name" theme="auth" value={form.name} onChange={change} />
        <FormField label="Species" name="species" as="select" theme="auth" value={form.species} onChange={change}>
          <option value="">Select…</option>
          {SPECIES.map((s) => <option key={s}>{s}</option>)}
        </FormField>
        <FormField label="Breed" name="breed" theme="auth" value={form.breed} onChange={change} />
        <FormField label="Sex" name="sex" as="select" theme="auth" value={form.sex} onChange={change}>
          <option value="">Select…</option>
          <option>Female</option>
          <option>Male</option>
        </FormField>
        <FormField label="Birthdate" name="birthday" type="date" theme="auth" max={today()} value={form.birthday} onChange={change} />
        <FormField label="Weight (kg)" name="weightKg" type="number" step="0.1" theme="auth" value={form.weightKg} onChange={change} />
        <FormField label="Vaccination" name="vaccinationStatus" as="select" theme="auth" value={form.vaccinationStatus} onChange={change}>
          <option>Up to date</option>
          <option>Overdue</option>
          <option>Unknown</option>
        </FormField>
        <FormField label="Allergies" name="allergies" theme="auth" value={form.allergies} onChange={change} />
      </div>
      <FormField
        label="Photo URL (optional)"
        name="photoUrl"
        type="url"
        theme="auth"
        placeholder="https://…"
        value={form.photoUrl}
        onChange={change}
      />
      <FormField
        label="Medical notes"
        name="medicalNotes"
        as="textarea"
        theme="auth"
        rows={3}
        value={form.medicalNotes}
        onChange={change}
        className={AREA}
      />

      {confirming ? (
        <div className="flex flex-col gap-3 border-t border-[#D8DEE3] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] font-medium text-[#1F2937]">
            Delete {initial?.name}? This can't be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="h-11 rounded-[8px] border border-[#D8DEE3] px-6 text-[15px] font-semibold hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="h-11 rounded-[8px] bg-[#B91C1C] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#991B1B] disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-3 border-t border-[#D8DEE3] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-[14px] font-semibold text-[#B91C1C] hover:underline"
              >
                Delete pet
              </button>
            )}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="h-11 rounded-[8px] border border-[#D8DEE3] px-6 text-[15px] font-semibold hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-[8px] bg-[#047857] px-8 text-[15px] font-semibold text-white transition-colors hover:bg-[#059669] disabled:opacity-60"
            >
              {saving ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}