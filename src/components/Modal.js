import { useEffect } from "react";

export default function Modal({ title, subtitle, onClose, wide = false, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="font-figtree fixed inset-0 z-[100] flex items-center justify-center bg-[#1F2937]/30 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`max-h-[90vh] w-full ${wide ? "max-w-2xl" : "max-w-xl"} overflow-y-auto rounded-[20px] border border-[#D8DEE3] bg-white p-6 text-[#1F2937] shadow-[0_8px_24px_rgba(28,51,46,0.12)] sm:p-8`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-extrabold leading-tight tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-[15px] text-[#4B5563]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 shrink-0 rounded-[8px] text-[22px] leading-none text-[#4B5563] hover:bg-[#F0F9FF]"
          >
            ×
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}