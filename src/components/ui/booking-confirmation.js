import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";
import StatusBadge from "../StatusBadge";
import { Button } from "./app-controls";
import { formatDate } from "../../utils/format";
import { durationOf, formatDuration, formatTimeRange } from "../../utils/time";

// Two-panel confirmation window shown right after a customer books a visit.
// Left: "request sent" message and next actions. Right: summary of the appointment.
export default function BookingConfirmation({ appointment: a, onClose, onViewAll, onBookAnother }) {
  const reduce = useReducedMotion();
  const primaryRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    primaryRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows = [
    ["Pet", `${a.petName}${a.species ? ` (${a.species})` : ""}`],
    ["Service", a.service],
    ["Veterinarian", a.vet],
    ["Date", formatDate(a.date)],
    ["Time", formatTimeRange(a)],
    ...(a.notes ? [["Notes", a.notes]] : []),
  ];

  const fade = (delay) =>
    reduce
      ? { initial: false }
      : { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0, transition: { delay } } };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-figtree fixed inset-0 z-[100] flex items-center justify-center bg-[#1F2937]/30 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Appointment request sent"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[20px] border border-[#D8DEE3] bg-white text-[#1F2937] shadow-[0_8px_24px_rgba(28,51,46,0.12)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: confirmation */}
          <div className="flex flex-col items-center justify-center gap-3 bg-[#EEF2FF] p-8 text-center">
            <motion.span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5] text-[#047857]"
              aria-hidden="true"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
            >
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </motion.span>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight">Request sent</h2>
            <p className="max-w-[260px] text-[15px] text-[#4B5563]">
              The clinic will review your request. You will see the update on My appointments.
            </p>
            <StatusBadge status={a.status} />
            <div className="mt-4 flex w-full max-w-[260px] flex-col gap-2">
              <button
                ref={primaryRef}
                type="button"
                onClick={onViewAll}
                className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#047857] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#059669] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A3BD9]"
              >
                View my appointments
              </button>
              <Button variant="secondary" onClick={onBookAnother}>Book another visit</Button>
            </div>
          </div>

          {/* Right: summary */}
          <div className="relative p-8">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-[8px] text-[#4B5563] transition-colors hover:bg-[#EEF2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2A3BD9]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>

            <h3 className="text-[22px] font-extrabold tracking-tight">Appointment summary</h3>

            <dl className="mt-5 divide-y divide-[#D8DEE3]">
              {rows.map(([label, value], i) => (
                <motion.div
                  key={label}
                  {...fade(0.25 + i * 0.07)}
                  className="flex flex-col gap-0.5 py-3 first:pt-0 sm:flex-row sm:gap-4"
                >
                  <dt className="w-28 shrink-0 text-[13px] font-semibold uppercase tracking-[0.4px] text-[#4B5563]">{label}</dt>
                  <dd className="min-w-0 break-words text-[15px] font-semibold">{value}</dd>
                </motion.div>
              ))}
            </dl>

            <motion.div
              {...fade(0.25 + rows.length * 0.07 + 0.1)}
              className="mt-2 flex items-center justify-between border-t border-[#D8DEE3] pt-4"
            >
              <p className="text-[15px] font-semibold">Visit length</p>
              <p className="text-[22px] font-extrabold text-[#2A3BD9]">{formatDuration(durationOf(a))}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}