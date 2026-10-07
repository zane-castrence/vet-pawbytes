import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createAppointment, createPet, getClinicCatalog, getPets, getUnavailableTimes } from "../services/api";
import { validateAppointment } from "../utils/validators";
import BookingModal from "../components/BookingModal";
import BrowseServices from "./BrowseServices";

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
  const [loaded, setLoaded] = useState(false);
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
      .catch(() => setServerError("Couldn't load your pets and services. Refresh to try again."))
      .finally(() => setLoaded(true));
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

  // saves a new pet from step 1 and selects it (throws on invalid input)
  const addPet = async (data) => {
    const pet = await createPet(user.id, data);
    setPets((list) => [...list, pet]);
    setForm((f) => ({ ...f, petId: pet.id, petName: pet.name, species: pet.species }));
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

  return (
    <>
      {/* shown blurred behind the modal */}
      <BrowseServices />
      <BookingModal
        loading={!loaded}
        pets={pets}
        services={catalog.services}
        vets={catalog.vets}
        times={TIMES}
        taken={taken}
        form={form}
        errors={errors}
        serverError={serverError}
        saving={saving}
        onChange={change}
        onAddPet={addPet}
        onSubmit={submit}
        onClose={() => navigate("/services")}
      />
    </>
  );
}