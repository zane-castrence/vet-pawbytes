import { motion, useReducedMotion } from "motion/react";

const BADGE = {
  "Up to date": "bg-[#D1FAE5] text-[#047857]",
  Overdue: "bg-[#FEE2E2] text-[#B91C1C]",
  Unknown: "bg-[#E5E7EB] text-[#4B5563]",
};

const SPRING = { type: "spring", stiffness: 400, damping: 28, mass: 0.6 };

const card = {
  hidden: { opacity: 0, y: 20, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { ...SPRING, staggerChildren: 0.07, delayChildren: 0.05 },
  },
  hover: { y: -4, scale: 1.02, transition: SPRING },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING, stiffness: 400, damping: 25 } },
};

const photo = {
  visible: { scale: 1 },
  hover: { scale: 1.08, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

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

export function AddPetCard({ onClick, label = "Add a pet" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-figtree flex min-h-[220px] w-full items-center justify-center rounded-[20px] border-2 border-dashed border-[#D8DEE3] text-[15px] font-semibold text-[#075985] transition-colors hover:border-[#0369A1] hover:bg-[#F0F9FF]"
    >
      + {label}
    </button>
  );
}

export default function PetCard({ pet, selected = false, onSelect, onEdit, onDelete }) {
  const reduce = useReducedMotion();
  const pickable = !!onSelect;

  const key = (e) => {
    if (pickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div
      variants={card}
      initial={reduce ? false : "hidden"}
      animate="visible"
      whileHover={reduce ? undefined : "hover"}
      whileTap={pickable && !reduce ? { scale: 0.98 } : undefined}
      role={pickable ? "button" : undefined}
      tabIndex={pickable ? 0 : undefined}
      aria-pressed={pickable ? selected : undefined}
      onClick={onSelect}
      onKeyDown={key}
      className={`font-figtree flex flex-col rounded-[20px] border bg-white p-3 text-left text-[#1F2937] ${
        pickable ? "cursor-pointer" : ""
      } ${selected ? "border-[#0369A1] ring-2 ring-[#E0F2FE]" : "border-[#D8DEE3]"}`}
    >
      {/* photo placeholder, swap for pet.photoUrl later */}
      <motion.div variants={item} className="overflow-hidden rounded-[14px]">
        <motion.div
          variants={photo}
          className="flex h-24 items-center justify-center bg-[#E5E7EB] text-[44px] font-extrabold text-[#9CA3AF]"
        >
          {pet.name.charAt(0).toUpperCase()}
        </motion.div>
      </motion.div>

      <div className="px-1 pb-1 pt-3">
        <motion.h3 variants={item} className="text-[20px] font-extrabold leading-tight tracking-tight">
          {pet.name}
        </motion.h3>
        <motion.p variants={item} className="mt-0.5 text-[14px] text-[#4B5563]">
          {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
        </motion.p>
        <motion.p variants={item} className="mt-2 text-[14px] text-[#4B5563]">
          {[age(pet.birthday), pet.weightKg ? `${pet.weightKg} kg` : ""].filter(Boolean).join(" · ")}
        </motion.p>
        <motion.span
          variants={item}
          className={`mt-3 inline-block rounded-full px-3 py-1 text-[12px] font-semibold ${BADGE[pet.vaccinationStatus] || BADGE.Unknown}`}
        >
          {pet.vaccinationStatus || "Unknown"}
        </motion.span>
      </div>

      {(onEdit || onDelete) && (
        <motion.div variants={item} className="mt-2 flex gap-2 border-t border-[#D8DEE3] px-1 pt-3">
          {onEdit && (
            <button type="button" onClick={onEdit} className="h-9 flex-1 rounded-[8px] border border-[#D8DEE3] text-[14px] font-semibold hover:bg-[#F0F9FF]">
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" onClick={onDelete} className="h-9 flex-1 rounded-[8px] border border-[#D8DEE3] text-[14px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2]">
              Delete
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}