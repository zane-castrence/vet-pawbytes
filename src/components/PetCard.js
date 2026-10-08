import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Cake, Check, Pencil, Weight } from "lucide-react";

const BADGE = {
  "Up to date": "bg-[#D1FAE5] text-[#047857]",
  Overdue: "bg-[#FEE2E2] text-[#B91C1C]",
  Unknown: "bg-[#E5E7EB] text-[#4B5563]",
};

const SPRING = { type: "spring", stiffness: 400, damping: 28, mass: 0.6 };
const SHADOW = "0px 8px 24px rgba(28,51,46,0.12)";
const NO_SHADOW = "0px 0px 0px rgba(28,51,46,0)";

const container = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)", boxShadow: NO_SHADOW },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    boxShadow: NO_SHADOW,
    transition: SPRING,
  },
  hover: { y: -4, scale: 1.02, boxShadow: SHADOW, transition: SPRING },
};

const media = {
  visible: { scale: 1 },
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const content = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...SPRING, staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15, scale: 0.95, filter: "blur(2px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 400, damping: 25, mass: 0.5 },
  },
};

const letter = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", damping: 8, stiffness: 200, mass: 0.8 },
  },
};

const FADE =
  "linear-gradient(to top, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 40%, rgba(255,255,255,0.35) 70%, rgba(255,255,255,0) 100%)";
const BLUR_MASK = "linear-gradient(to top, #000 40%, transparent)";

const age = (b) => {
  if (!b) return "";
  const d = new Date(b);
  const n = new Date();
  let m = (n.getFullYear() - d.getFullYear()) * 12 + n.getMonth() - d.getMonth();
  if (n.getDate() < d.getDate()) m--;
  if (m < 1) return "Under 1 mo";
  if (m < 12) return `${m} mo`;
  const y = Math.floor(m / 12);
  return `${y} yr${y > 1 ? "s" : ""}`;
};

export function AddPetCard({ onClick, label = "Add a pet", className = "h-[300px]" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-figtree flex w-full items-center justify-center rounded-[20px] border-2 border-dashed border-[#D8DEE3] text-[15px] font-semibold text-[#075985] transition-colors hover:border-[#0369A1] hover:bg-[#F0F9FF] ${className}`}
    >
      + {label}
    </button>
  );
}

export default function PetCard({ pet, selected = false, onSelect, onEdit }) {
  const reduce = useReducedMotion();
  const [brokenUrl, setBrokenUrl] = useState("");
  const pickable = !!onSelect;
  const photoUrl = pet.photoUrl || pet.photo;
  const showPhoto = !!photoUrl && brokenUrl !== photoUrl;
  const status = pet.vaccinationStatus || "Unknown";

  const key = (e) => {
    if (pickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect();
    }
  };

  const stats = [
    { icon: Cake, text: age(pet.birthday) },
    { icon: Weight, text: pet.weightKg ? `${pet.weightKg} kg` : "" },
  ].filter((s) => s.text);

  return (
    <motion.div
      variants={container}
      initial={reduce ? false : "hidden"}
      animate="visible"
      whileHover={reduce ? undefined : "hover"}
      whileTap={pickable && !reduce ? { scale: 0.98 } : undefined}
      role={pickable ? "button" : undefined}
      tabIndex={pickable ? 0 : undefined}
      aria-pressed={pickable ? selected : undefined}
      onClick={onSelect}
      onKeyDown={key}
      className={`font-figtree relative w-full overflow-hidden rounded-[20px] border bg-white text-left text-[#1F2937] ${
        pickable ? "h-[300px] cursor-pointer" : "h-[380px]"
      } ${selected ? "border-[#0369A1] ring-2 ring-[#E0F2FE]" : "border-[#D8DEE3]"}`}
    >
      {/* Full cover photo, or placeholder when missing or broken */}
      {showPhoto ? (
        <motion.img
          src={photoUrl}
          alt={pet.name}
          variants={media}
          referrerPolicy="no-referrer"
          onError={() => setBrokenUrl(photoUrl)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <motion.div
          variants={media}
          className="absolute inset-0 flex items-start justify-center bg-[#E5E7EB] pt-12 text-[88px] font-extrabold leading-none text-[#9CA3AF]"
        >
          {pet.name.charAt(0).toUpperCase()}
        </motion.div>
      )}

      {/* Fade + soft blur so the text stays readable */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 backdrop-blur-md"
        style={{ WebkitMaskImage: BLUR_MASK, maskImage: BLUR_MASK }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%]"
        style={{ background: FADE }}
      />

      {selected && (
        <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#0369A1] text-white">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
      )}
      <span
        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[12px] font-semibold ${BADGE[status] || BADGE.Unknown}`}
      >
        {status}
      </span>

      <motion.div variants={content} className="absolute inset-x-0 bottom-0 space-y-3 p-5">
        <motion.div variants={item} className="flex items-center gap-2">
          <motion.h3
            className="text-[24px] font-extrabold leading-tight tracking-tight"
            variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
          >
            {reduce
              ? pet.name
              : pet.name.split("").map((l, i) => (
                  <motion.span key={i} variants={letter} className="inline-block">
                    {l === " " ? "\u00A0" : l}
                  </motion.span>
                ))}
          </motion.h3>
          {status === "Up to date" && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
        </motion.div>

        <motion.p variants={item} className="text-[14px] leading-relaxed text-[#4B5563]">
          {pet.species}
          {pet.breed ? ` · ${pet.breed}` : ""}
        </motion.p>

        {stats.length > 0 && (
          <motion.div variants={item} className="flex items-center gap-5">
            {stats.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[#4B5563]">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-[14px] font-semibold text-[#1F2937]">{text}</span>
              </div>
            ))}
          </motion.div>
        )}

        {onEdit && (
          <motion.div variants={item} className="pt-1">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1F2937] text-[14px] font-semibold text-white transition-colors hover:bg-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              Edit
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}