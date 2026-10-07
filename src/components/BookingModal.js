import { useEffect, useState } from "react";
import Modal from "./Modal";
import PetCard, { AddPetCard } from "./PetCard";
import PetForm from "./PetForm";
import FormField from "./FormField";
import Alert from "./Alert";
import StepProgress from "./ui/step-progress";

const LABELS = ["Pet", "Veterinarian", "Details"];
const AREA =
  "rounded-lg border border-[#D8DEE3] bg-white px-3 py-2 text-[15px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20 aria-[invalid=true]:border-red-500";
const primary =
  "h-11 rounded-[8px] bg-[#047857] px-8 text-[15px] font-semibold text-white transition-colors hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50";
const ghost = "h-11 rounded-[8px] border border-[#D8DEE3] px-6 text-[15px] font-semibold hover:bg-[#F9FAFB]";

const todayLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const label12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const Footer = ({ children }) => (
  <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#D8DEE3] pt-6 sm:flex-row sm:justify-end">
    {children}
  </div>
);

export default function BookingModal({
  loading, pets, services, vets, times, taken,
  form, errors, serverError, saving,
  onChange, onAddPet, onSubmit, onClose,
}) {
  const [step, setStep] = useState(1);
  const [adding, setAdding] = useState(false);

  // jump back to the step that has the error
  useEffect(() => {
    if (errors.petId || errors.petName || errors.species) setStep(1);
    else if (errors.vet) setStep(2);
  }, [errors]);

  const pick = (name, value) => onChange({ target: { name, value } });
  const showPetForm = pets.length === 0 || adding;

  const savePet = async (data) => {
    await onAddPet(data); // throws on bad input, PetForm shows the message
    setAdding(false);
    setStep(2);
  };

  return (
    <Modal title="Book an appointment" onClose={onClose} wide>
      <StepProgress step={step} labels={LABELS} />

      <Alert className="mt-5 rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-[14px] font-medium text-[#B91C1C]">
        {serverError}
      </Alert>

      <div className="mt-6">
        {loading && <p className="text-[15px] text-[#4B5563]">Loading…</p>}

        {/* STEP 1: pet */}
        {!loading && step === 1 &&
          (showPetForm ? (
            <>
              <p className="mb-4 text-[15px] text-[#4B5563]">
                {pets.length === 0 ? "Add your pet to get started." : "Add a new pet."}
              </p>
              <PetForm
                submitLabel="Save and continue"
                onSubmit={savePet}
                onCancel={pets.length ? () => setAdding(false) : undefined}
              />
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {pets.map((p) => (
                  <PetCard key={p.id} pet={p} selected={form.petId === p.id} onSelect={() => pick("petId", p.id)} />
                ))}
                <AddPetCard label="Add new pet" onClick={() => setAdding(true)} />
              </div>
              {errors.petId && <p role="alert" className="mt-2 text-xs text-red-600">{errors.petId}</p>}
              <Footer>
                <button type="button" className={ghost} onClick={onClose}>Cancel</button>
                <button type="button" className={primary} disabled={!form.petId} onClick={() => setStep(2)}>Next</button>
              </Footer>
            </>
          ))}

        {/* STEP 2: vet */}
        {!loading && step === 2 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {vets.map((v) => {
                const on = form.vet === v;
                return (
                  <button
                    type="button"
                    key={v}
                    onClick={() => pick("vet", v)}
                    className={`flex items-center gap-3 rounded-[20px] border p-4 text-left transition-colors ${
                      on ? "border-[#0369A1] bg-[#F0F9FF] ring-2 ring-[#E0F2FE]" : "border-[#D8DEE3] hover:border-[#0369A1]"
                    }`}
                  >
                    {/* photo placeholder */}
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-[18px] font-extrabold text-[#9CA3AF]">
                      {v.replace(/^Dr\.?\s*/i, "").charAt(0)}
                    </span>
                    <span className="text-[16px] font-semibold">{v}</span>
                  </button>
                );
              })}
            </div>
            {errors.vet && <p role="alert" className="mt-2 text-xs text-red-600">{errors.vet}</p>}
            <Footer>
              <button type="button" className={ghost} onClick={() => setStep(1)}>Back</button>
              <button type="button" className={primary} disabled={!form.vet} onClick={() => setStep(3)}>Next</button>
            </Footer>
          </>
        )}

        {/* STEP 3: details */}
        {!loading && step === 3 && (
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <p className="text-[14px] text-[#4B5563]">{form.petName} · {form.vet}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Service" name="service" as="select" theme="auth" value={form.service} onChange={onChange} error={errors.service}>
                <option value="">Select service</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </FormField>
              <FormField label="Date" name="date" type="date" theme="auth" min={todayLocal()} value={form.date} onChange={onChange} error={errors.date} />
            </div>
            <FormField label="Time" name="time" as="select" theme="auth" value={form.time} onChange={onChange} error={errors.time}>
              <option value="">Select time</option>
              {times.map((t) => (
                <option key={t} value={t} disabled={taken.includes(t) || (form.date === todayLocal() && t <= nowHHMM())}>
                  {label12(t)}{taken.includes(t) ? " (booked)" : ""}
                </option>
              ))}
            </FormField>
            <FormField
              label="Notes (optional)"
              name="notes"
              as="textarea"
              theme="auth"
              rows={3}
              maxLength={200}
              placeholder="Anything the vet should know"
              value={form.notes}
              onChange={onChange}
              error={errors.notes}
              className={AREA}
            />
            <Footer>
              <button type="button" className={ghost} onClick={() => setStep(2)}>Back</button>
              <button type="submit" className={primary} disabled={saving}>
                {saving ? "Booking…" : "Confirm booking"}
              </button>
            </Footer>
          </form>
        )}
      </div>
    </Modal>
  );
}