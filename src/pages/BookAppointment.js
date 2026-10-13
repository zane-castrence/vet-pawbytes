import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createAppointment, createPet, getClinicCatalog, getPets } from "../services/api";
import { validateAppointment } from "../utils/validators";
import { toMinutes } from "../utils/time";
import BookingModal from "../components/BookingModal";
import BrowseServices from "./BrowseServices";

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [catalog, setCatalog] = useState({ services: [], vets: [] });
  const [form, setForm] = useState({
    ownerName: user.name, petId: "", petName: "", species: "",
    service: params.get("service") || "", vet: "", date: "", time: "", endTime: "", notes: "", status: "Pending"
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

  const change = (e) => {
    const { name, value } = e.target;
    if (name === "petId") {
      const pet = pets.find((p) => p.id === value);
      setForm((f) => ({ ...f, petId: value, petName: pet?.name || "", species: pet?.species || "" }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // partial updates from the date picker and time slider
  const patch = (fields) => setForm((f) => ({ ...f, ...fields }));

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
      const duration = toMinutes(form.endTime) - toMinutes(form.time);
      const appointment = await createAppointment(user.id, { ...form, duration }, { requirePetProfile: true });
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
        form={form}
        errors={errors}
        serverError={serverError}
        saving={saving}
        onChange={change}
        onPatch={patch}
        onAddPet={addPet}
        onSubmit={submit}
        onClose={() => navigate("/services")}
      />
    </>
  );
}