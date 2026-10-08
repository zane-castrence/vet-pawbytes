import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPets, createPet, updatePet, deletePet } from "../services/api";
import Alert from "../components/Alert";
import PetCard, { AddPetCard } from "../components/PetCard";
import PetModal from "../components/PetModal";

export default function MyPets() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState(null); // null | "new" | pet object
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () =>
    getPets(user.id)
      .then(setPets)
      .catch(() => setError("Couldn't load your pets."))
      .finally(() => setLoaded(true));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // throws on invalid input, PetForm shows the message
  const save = async (data) => {
    const editing = modal !== "new";
    if (editing) await updatePet(user.id, modal.id, data);
    else await createPet(user.id, data);
    setModal(null);
    setError("");
    setMessage(editing ? "Pet updated." : "Pet added.");
    load();
  };

  // called from the Edit window; throws so PetForm shows the message
  const remove = async (pet) => {
    await deletePet(user.id, pet.id);
    setModal(null);
    setError("");
    setMessage("Pet deleted.");
    load();
  };

  return (
    <section className="font-figtree mx-auto max-w-[1376px] px-4 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[40px] font-extrabold leading-none tracking-tight text-[#1F2937]">My pets</h1>
        {pets.length > 0 && (
          <button
            onClick={() => setModal("new")}
            className="h-11 rounded-full bg-[#047857] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#059669]"
          >
            Add pet
          </button>
        )}
      </div>

      <Alert className="mt-4 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[14px] font-medium text-[#B91C1C]">
        {error}
      </Alert>
      <Alert type="success" className="mt-4 rounded-[8px] border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-[14px] font-medium text-[#047857]">
        {message}
      </Alert>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loaded && pets.length === 0 && <AddPetCard label="Add your first pet" onClick={() => setModal("new")} />}
        {pets.map((p) => (
          <PetCard key={p.id} pet={p} onEdit={() => setModal(p)} />
        ))}
      </div>

      {modal && (
        <PetModal
          pet={modal === "new" ? null : modal}
          onSave={save}
          onDelete={remove}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  );
}