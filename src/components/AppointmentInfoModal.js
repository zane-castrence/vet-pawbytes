import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import FlipCard from "./ui/flip-card";
import { formatDate } from "../utils/format";
import { durationOf, formatDuration, formatTimeRange } from "../utils/time";

// same flat colors as the appointment card photo placeholder
const BANDS = ["#F06AA6", "#D9F25C", "#8CC8FF", "#7FD1B0"];

const LABEL = "text-[12px] font-semibold uppercase tracking-[0.4px] text-[#4B5563]";

function Row({ label, className = "", children }) {
  return (
    <div className={className}>
      <dt className={LABEL}>{label}</dt>
      <dd className="mt-0.5 break-words text-[14px] font-semibold text-[#1F2937]">{children}</dd>
    </div>
  );
}

function Front({ appointment: a, photo, color, onBroken }) {
  const when = new Date(`${a.date}T00:00`);
  const valid = !Number.isNaN(when.getTime());
  const month = valid ? when.toLocaleString("en", { month: "short" }).toUpperCase() : "";
  const day = valid ? when.getDate() : "";

  return (
    <div className="flex h-full flex-col p-3">
      <div className="relative h-[290px] shrink-0 overflow-hidden rounded-[8px]" style={{ backgroundColor: color }}>
        {photo ? (
          <img src={photo} alt={a.petName} className="h-full w-full object-cover" onError={onBroken} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[96px] font-extrabold text-[#1F2937]/70" aria-hidden="true">
            {a.petName?.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={a.status} />
        </div>
        <div className="absolute right-3 top-3 flex items-center text-[12px] font-bold">
          <span className="rounded-l-md bg-white px-2.5 py-1.5 text-[#1F2DB0]">{month}</span>
          <span className="rounded-r-md bg-[#2A3BD9] px-2.5 py-1.5 text-white">{day}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-5">
        <div>
          <h3 className="text-[26px] font-extrabold leading-tight tracking-tight">{a.petName}</h3>
          <p className="mt-1 text-[15px] text-[#4B5563]">
            {a.service}
            {a.species ? ` · ${a.species}` : ""}
          </p>
        </div>
        <p className="flex items-center justify-between text-[13px] font-semibold text-[#2A3BD9]">
          Hover or tap for details
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </p>
      </div>
    </div>
  );
}

function Back({ appointment: a, ownerEmail, photo, color, onBroken }) {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: color }}>
          {photo ? (
            <img src={photo} alt="" className="h-full w-full object-cover" onError={onBroken} />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[20px] font-extrabold text-[#1F2937]/70" aria-hidden="true">
              {a.petName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#2A3BD9]">Appointment details</p>
          <h3 className="truncate text-[20px] font-extrabold leading-tight tracking-tight">
            {a.petName}
            {a.species && <span className="ml-2 text-[14px] font-semibold text-[#4B5563]">{a.species}</span>}
          </h3>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#D8DEE3] pt-4">
        <Row label="Owner" className="col-span-2">
          {a.ownerName}
          {ownerEmail && <span className="block text-[13px] font-normal text-[#4B5563]">{ownerEmail}</span>}
        </Row>
        <Row label="Service">{a.service}</Row>
        <Row label="Veterinarian">{a.vet}</Row>
        <Row label="Date">{formatDate(a.date)}</Row>
        <Row label="Time">{formatTimeRange(a)}</Row>
        <Row label="Status"><StatusBadge status={a.status} /></Row>
        <Row label="Length">{formatDuration(durationOf(a))}</Row>
      </dl>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-[8px] bg-[#F9FAFB] px-3 py-2 text-[14px]">
        <span className="font-semibold">Notes: </span>
        <span className="text-[#4B5563]">{a.notes || "No notes added."}</span>
      </div>
    </div>
  );
}

// Popup for admin and staff. ownerEmail is optional (only admins load customer accounts).
export default function AppointmentInfoModal({ appointment, ownerEmail, onClose }) {
  const [brokenUrl, setBrokenUrl] = useState("");
  const photo = appointment.petPhoto && brokenUrl !== appointment.petPhoto ? appointment.petPhoto : "";
  const color = BANDS[(appointment.petName?.charCodeAt(0) || 0) % BANDS.length];
  const onBroken = () => setBrokenUrl(appointment.petPhoto);

  return (
    <Modal title="Appointment info" subtitle={`${appointment.petName} · ${appointment.ownerName}`} onClose={onClose}>
      <FlipCard
        label={`Appointment info for ${appointment.petName}. Press Enter to flip the card.`}
        front={<Front appointment={appointment} photo={photo} color={color} onBroken={onBroken} />}
        back={<Back appointment={appointment} ownerEmail={ownerEmail} photo={photo} color={color} onBroken={onBroken} />}
      />
    </Modal>
  );
}