import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPets, createPet, updatePet, deletePet } from "../services/api";
import FormField from "../components/FormField";
import Alert from "../components/Alert";

const empty = { name: "", species: "", breed: "", sex: "", birthday: "", weightKg: "", vaccinationStatus: "Unknown", allergies: "", medicalNotes: "" };
const SPECIES = ["Dog", "Cat", "Bird", "Rabbit", "Other"];

export default function MyPets() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => getPets(user.id).then(setPets).catch(() => setError("Couldn't load your pets."));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validation lives in services/api.js (validatePetDetails) and throws readable messages
  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      if (editingId) await updatePet(user.id, editingId, form);
      else await createPet(user.id, form);
      setMessage(editingId ? "Pet updated." : "Pet added.");
      setForm(empty); setEditingId(null); load();
    } catch (err) { setError(err.message); }
  };

  const edit = (pet) => { setEditingId(pet.id); setForm({ ...empty, ...pet }); };

  const remove = async (pet) => {
    if (!window.confirm(`Delete ${pet.name}'s profile?`)) return;
    try { await deletePet(user.id, pet.id); setMessage("Pet deleted."); load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <section>
      <h1>My pets</h1>
      <Alert>{error}</Alert>
      <Alert type="success">{message}</Alert>
      <form onSubmit={submit} className="grid gap-2">
        <FormField label="Pet name" name="name" value={form.name} onChange={change} />
        <FormField label="Species" name="species" as="select" value={form.species} onChange={change}>
          <option value="">Select…</option>{SPECIES.map((s) => <option key={s}>{s}</option>)}
        </FormField>
        <FormField label="Breed" name="breed" value={form.breed} onChange={change} />
        <FormField label="Sex" name="sex" as="select" value={form.sex} onChange={change}>
          <option value="">Select…</option><option>Female</option><option>Male</option>
        </FormField>
        <FormField label="Birthdate" name="birthday" type="date" value={form.birthday} onChange={change} />
        <FormField label="Weight (kg)" name="weightKg" type="number" step="0.1" value={form.weightKg} onChange={change} />
        <FormField label="Vaccination status" name="vaccinationStatus" as="select" value={form.vaccinationStatus} onChange={change}>
          <option>Up to date</option><option>Overdue</option><option>Unknown</option>
        </FormField>
        <FormField label="Allergies" name="allergies" value={form.allergies} onChange={change} />
        <FormField label="Medical notes" name="medicalNotes" as="textarea" rows="2" value={form.medicalNotes} onChange={change} />
        <div className="flex gap-2">
          <button>{editingId ? "Save changes" : "Add pet"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>
      {pets.length === 0 ? <p>No pets yet.</p> : (
        <ul>
          {pets.map((p) => (
            <li key={p.id} className="flex gap-4">
              <span>{p.name} · {p.species} · {p.breed} · {p.sex} · born {p.birthday}</span>
              <button onClick={() => edit(p)}>Edit</button>
              <button onClick={() => remove(p)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
