import { useState } from "react";
import { motion } from "motion/react";

const shuffle = (n) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export function RandomLetterSwap({
  label,
  className = "",
  staggerDuration = 0.03,
  transition = { type: "spring", duration: 0.6 },
}) {
  const letters = Array.from(label);
  const [hovered, setHovered] = useState(false);
  const [order, setOrder] = useState(() => shuffle(letters.length));

  return (
    <span
      className={`inline-flex ${className}`}
      onMouseEnter={() => {
        setOrder(shuffle(letters.length)); // new random order every hover
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="inline-flex">
        {letters.map((ch, i) => {
          const t = { ...transition, delay: order[i] * staggerDuration };
          const c = ch === " " ? "\u00A0" : ch;
          return (
            <span key={i} className="relative inline-block overflow-hidden">
              <motion.span className="inline-block" animate={{ y: hovered ? "-110%" : "0%" }} transition={t}>
                {c}
              </motion.span>
              <motion.span className="absolute left-0 top-0 inline-block" initial={{ y: "110%" }} animate={{ y: hovered ? "0%" : "110%" }} transition={t}>
                {c}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

export default RandomLetterSwap;