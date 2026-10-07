import { motion, useReducedMotion } from "motion/react";

const WIDTHS = [24, 56, 88];

export default function StepProgress({ step, labels }) {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center gap-6">
        <motion.div
          className="absolute -left-2 top-1/2 h-6 -translate-y-1/2 rounded-full bg-[#047857]"
          initial={false}
          animate={{ width: WIDTHS[step - 1] }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
        />
        {labels.map((_, i) => (
          <span
            key={i}
            className={`relative z-10 h-2 w-2 rounded-full transition-colors ${i < step ? "bg-white" : "bg-[#D1D5DB]"}`}
          />
        ))}
      </div>
      <p className="text-[13px] font-medium text-[#4B5563]">
        Step {step} of {labels.length} · {labels[step - 1]}
      </p>
    </div>
  );
}