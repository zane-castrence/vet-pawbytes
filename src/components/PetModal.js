import { useState } from "react";
import Modal from "./Modal";
import PetForm from "./PetForm";
import Alert from "./Alert";

export default function PetModal({ pet, onSave, onDelete, onArchive, onClose }) {
  const [error, setError] = useState("");

  const archive = async () => {
    if (!window.confirm(`Archive ${pet.name}? You can restore the profile from the Archive page.`)) return;
    setError("");
    try {
      await onArchive(pet);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title={pet ? `Edit ${pet.name}` : "Add a pet"} onClose={onClose} wide>
      <PetForm
        initial={pet}
        submitLabel={pet ? "Save changes" : "Add pet"}
        onSubmit={onSave}
        onCancel={onClose}
        onDelete={pet && onDelete ? () => onDelete(pet) : undefined}
      />

      {pet && onArchive && (
        <div className="mt-5 flex flex-col gap-2 rounded-[8px] bg-[#F9FAFB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] text-[#4B5563]">
            Not needed right now? Archive keeps the profile and its history.
          </p>
          <button
            type="button"
            onClick={archive}
            className="text-left text-[14px] font-semibold text-[#2A3BD9] hover:underline sm:text-right"
          >
            Archive pet
          </button>
        </div>
      )}

      <Alert className="mt-3 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[14px] font-medium text-[#B91C1C]">
        {error}
      </Alert>
    </Modal>
  );
}
