import { Link, Navigate, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { Card, buttonClass, PAGE_CLASS } from "../components/ui/app-controls";
import { formatDate } from "../utils/format";
import { formatTimeRange } from "../utils/time";

export default function BookingConfirmation() {
  const { state } = useLocation();
  const a = state?.appointment;
  if (!a) return <Navigate to="/services" replace />;

  const rows = [
    ["Pet", `${a.petName}${a.species ? ` (${a.species})` : ""}`],
    ["Service", a.service],
    ["Veterinarian", a.vet],
    ["When", `${formatDate(a.date)}, ${formatTimeRange(a)}`],
    ...(a.notes ? [["Notes", a.notes]] : []),
  ];

  return (
    <section className={PAGE_CLASS}>
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D1FAE5] text-[#047857]" aria-hidden="true">
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-[32px] font-extrabold leading-tight tracking-tight text-[#1F2937]">Request sent</h1>
          <p className="mt-1 text-[15px] text-[#4B5563]">The clinic will review your request.</p>
          <div className="mt-3"><StatusBadge status={a.status} /></div>
        </div>

        <Card className="mt-8">
          <dl className="divide-y divide-[#D8DEE3]">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
                <dt className="w-32 shrink-0 text-[13px] font-semibold uppercase tracking-[0.4px] text-[#4B5563]">{label}</dt>
                <dd className="text-[15px] font-semibold text-[#1F2937]">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/my-appointments" className={buttonClass("primary")}>View my appointments</Link>
          <Link to="/book" className={buttonClass("secondary")}>Book another visit</Link>
        </div>
      </div>
    </section>
  );
}