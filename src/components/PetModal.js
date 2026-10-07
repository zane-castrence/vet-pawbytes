import Modal from "./Modal";
import PetForm from "./PetForm";

export default function PetModal({ pet, onSave, onClose }) {
  return (
    <Modal title={pet ? `Edit ${pet.name}` : "Add a pet"} onClose={onClose} wide>
      <PetForm
        initial={pet}
        submitLabel={pet ? "Save changes" : "Add pet"}
        onSubmit={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}