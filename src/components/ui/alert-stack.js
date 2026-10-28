import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";

// Dismissible alert stack. Wrap the app in <AlertStackProvider>, then in any
// component: const toast = useToast(); toast.success("Saved.");
// Also: toast.error(), toast.info(), toast.warning().

const MAX_VISIBLE = 4;
const DURATION = { success: 5000, info: 5000, warning: 7000, error: 8000 };

const VARIANTS = {
  success: { icon: CircleCheck, iconClass: "text-[#047857]", bar: "bg-[#059669]", role: "status" },
  info: { icon: Info, iconClass: "text-[#2A3BD9]", bar: "bg-[#2A3BD9]", role: "status" },
  warning: { icon: TriangleAlert, iconClass: "text-[#B45309]", bar: "bg-[#F2733F]", role: "status" },
  error: { icon: CircleAlert, iconClass: "text-[#B91C1C]", bar: "bg-[#B91C1C]", role: "alert" },
};

const AlertStackContext = createContext(null);

let nextId = 1;

export function AlertStackProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant, title, body) => {
    setToasts((list) => {
      // same alert fired again: replace the old one so it restarts its timer
      const rest = list.filter((t) => !(t.variant === variant && t.title === title && t.body === body));
      return [...rest, { id: nextId++, variant, title, body }].slice(-MAX_VISIBLE);
    });
  }, []);

  const api = useMemo(
    () => ({
      success: (title, body) => push("success", title, body),
      info: (title, body) => push("info", title, body),
      warning: (title, body) => push("warning", title, body),
      error: (title, body) => push("error", title, body),
    }),
    [push]
  );

  return (
    <AlertStackContext.Provider value={api}>
      {children}
      <AlertStack toasts={toasts} onDismiss={dismiss} />
    </AlertStackContext.Provider>
  );
}

export function useToast() {
  const api = useContext(AlertStackContext);
  if (!api) throw new Error("useToast must be used inside <AlertStackProvider>");
  return api;
}

function AlertStack({ toasts, onDismiss }) {
  const reduce = useReducedMotion();
  if (typeof document === "undefined") return null;

  // Portal to <body> so no transformed ancestor can break fixed positioning.
  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-4 top-4 z-[120] flex flex-col items-end gap-3 font-figtree sm:inset-x-auto sm:right-4 sm:w-[380px]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!reduce}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.96 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 48, scale: 0.96 }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
            className="pointer-events-auto w-full"
          >
            <AlertCard toast={toast} onDismiss={onDismiss} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function AlertCard({ toast, onDismiss }) {
  const { id, variant, title, body } = toast;
  const { icon: Icon, iconClass, bar, role } = VARIANTS[variant];
  const [paused, setPaused] = useState(false);
  const remaining = useRef(DURATION[variant]);

  // Auto-dismiss. Hovering or focusing the alert pauses the countdown.
  useEffect(() => {
    if (paused) return undefined;
    const startedAt = Date.now();
    const timer = setTimeout(() => onDismiss(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(1000, remaining.current - (Date.now() - startedAt));
    };
  }, [paused, id, onDismiss]);

  return (
    <div
      role={role}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative flex items-start gap-3 overflow-hidden rounded-[8px] border border-[#D8DEE3] bg-white py-3.5 pl-5 pr-3 shadow-[0_8px_24px_rgba(28,51,46,0.12)]"
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${bar}`} aria-hidden="true" />
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} strokeWidth={1.75} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[14px] font-semibold leading-snug text-[#1F2937]">{title}</span>
        {body && <span className="text-[13px] leading-snug text-[#4B5563]">{body}</span>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss alert"
        className="shrink-0 rounded-[8px] p-1 text-[#4B5563] transition-colors hover:bg-[#EEF2FF] hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9]"
      >
        <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  );
}
