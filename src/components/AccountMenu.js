import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]";

const ITEM =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] font-medium text-[#4B5563] transition-colors hover:bg-[#F0F9FF] hover:text-[#1F2937]";

// variant "row": full row for the sidebar (menu opens upward)
// variant "avatar": round avatar for the top bar (menu opens downward)
export default function AccountMenu({ user, onLogout, variant = "row" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const name = user?.name || user?.email || "Account";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const avatar = (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-[13px] font-bold text-[#047857]">
      {initial}
    </span>
  );

  return (
    <div ref={ref} className="relative font-figtree">
      {variant === "row" ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white ${FOCUS}`}
        >
          {avatar}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-[#1F2937]">
              {name}
            </span>
            <span className="block text-[12px] capitalize text-[#4B5563]">
              {user?.role}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#4B5563]" strokeWidth={1.75} />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`rounded-full ${FOCUS}`}
        >
          {avatar}
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute z-40 rounded-xl border border-[#D8DEE3] bg-white p-1.5 shadow-[0_8px_24px_rgba(28,51,46,0.12)] ${
            variant === "row"
              ? "bottom-full left-0 mb-2 w-full"
              : "right-0 top-full mt-2 w-60"
          }`}
        >
          <div className="px-3 py-2">
            <p className="truncate text-[13px] font-semibold text-[#1F2937]">{name}</p>
            <p className="truncate text-[12px] text-[#4B5563]">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-[#D8DEE3]" />
          <Link
            role="menuitem"
            to="/settings"
            onClick={() => setOpen(false)}
            className={`${ITEM} ${FOCUS}`}
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className={`${ITEM} ${FOCUS}`}
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}