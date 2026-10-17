import { useRef, useState } from "react";

// Ported from the 21st.dev "3D Flip Card" (card-14), written in plain JS with no shadcn or cn().
// Desktop: hover flips it. Touch and keyboard: tap / Enter / Space flips it.
// The faces are kept flat on purpose: nested preserve-3d layers leak through the hidden
// face in Safari (mirrored text showing on the other side) and flicker while flipping.

const FACE = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

export default function FlipCard({
  front,
  back,
  label,
  heightClass = "h-[480px]",
  widthClass = "w-full max-w-[360px]",
  className = "",
}) {
  const [flipped, setFlipped] = useState(false);
  const lastPointer = useRef("mouse");

  const toggle = () => setFlipped((v) => !v);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={label}
      onPointerDown={(e) => { lastPointer.current = e.pointerType; }}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setFlipped(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setFlipped(false); }}
      onClick={() => { if (lastPointer.current !== "mouse") toggle(); }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className={`mx-auto cursor-pointer rounded-[20px] font-figtree [perspective:1600px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2A3BD9] ${heightClass} ${widthClass} ${className}`}
    >
      <div
        style={{ transformStyle: "preserve-3d" }}
        className={`relative h-full w-full rounded-[20px] transition-transform duration-700 ease-out motion-reduce:duration-0 ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div style={FACE} className="absolute inset-0 overflow-hidden rounded-[20px] border border-[#D8DEE3] bg-white text-[#1F2937]">
          {front}
        </div>
        <div style={FACE} className="absolute inset-0 overflow-hidden rounded-[20px] border border-[#D8DEE3] bg-white text-[#1F2937] [transform:rotateY(180deg)]">
          {back}
        </div>
      </div>
    </div>
  );
}