import { useState } from "react";
import { Clock, Stethoscope } from "lucide-react";

// flat colors for the photo placeholder and footer, text stays dark for contrast
const BANDS = ["#F06AA6", "#D9F25C", "#8CC8FF", "#7FD1B0"];

const STATUS = {
  Pending: "bg-[#FFEDD5] text-[#9A3412]",
  Scheduled: "bg-[#D1FAE5] text-[#065F46]",
};

export default function AppointmentCard({ appointment, index = 0 }) {
  const { petName, species, service, date, time, vet, status, petPhoto } = appointment;
  const [brokenUrl, setBrokenUrl] = useState("");
  const color = BANDS[index % BANDS.length];
  const showPhoto = !!petPhoto && brokenUrl !== petPhoto;

  const when = new Date(`${date}T00:00`);
  const validDate = !Number.isNaN(when.getTime());
  const month = validDate ? when.toLocaleString("en", { month: "short" }).toUpperCase() : "";
  const day = validDate ? when.getDate() : "";

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-[20px] border border-[#D8DEE3] bg-white font-figtree transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(28,51,46,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* photo, or a colored placeholder with the pet's initial */}
      <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundColor: color }}>
        {showPhoto ? (
          <img
            src={petPhoto}
            alt={`${petName}`}
            className="h-full w-full object-cover"
            onError={() => setBrokenUrl(petPhoto)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[72px] font-extrabold text-[#1F2937]/70" aria-hidden="true">
            {petName?.charAt(0).toUpperCase()}
          </span>
        )}

        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[12px] font-semibold ${STATUS[status] || "bg-[#EEF1F3] text-[#374151]"}`}>
          {status}
        </span>
        <div className="absolute right-3 top-3 flex items-center text-[12px] font-bold">
          <span className="rounded-l-md bg-white px-2.5 py-1.5 text-[#1F2DB0]">{month}</span>
          <span className="rounded-r-md bg-[#2A3BD9] px-2.5 py-1.5 text-white">{day}</span>
        </div>
      </div>

      <div className="flex-1 p-5">
        <h3 className="text-[22px] font-extrabold tracking-tight text-[#1F2937]">{petName}</h3>
        <p className="mt-1 text-[14px] text-[#4B5563]">
          {service}
          {species ? ` · ${species}` : ""}
        </p>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-[#D8DEE3] px-5 py-3 text-[13px] font-semibold text-[#1F2937]">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-[#2A3BD9]" strokeWidth={1.75} />
          {time}
        </span>
        <span className="flex min-w-0 items-center gap-1.5">
          <Stethoscope className="h-4 w-4 shrink-0 text-[#2A3BD9]" strokeWidth={1.75} />
          <span className="truncate">{vet}</span>
        </span>
      </footer>
    </article>
  );
}