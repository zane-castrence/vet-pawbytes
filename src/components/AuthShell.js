import { Link } from "react-router-dom";
import DotGridCanvas from "./ui/dot-grid-canvas";

export const ALERT_CLASS = "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700";

export function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-[#4B5563]">
      <span className="h-px flex-1 bg-[#D8DEE3]" /> or <span className="h-px flex-1 bg-[#D8DEE3]" />
    </div>
  );
}

export function AuthSection({ children }) {
  return <h2 className="mt-2 text-[11px] font-medium uppercase tracking-[0.4px] text-[#4B5563]">{children}</h2>;
}

export function AuthButton({ loading, children }) {
  return (
    <button
      disabled={loading}
      className="mt-1 h-11 w-full rounded-lg bg-[#047857] text-[15px] font-semibold text-white transition-colors hover:bg-[#059669] disabled:opacity-60"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function AuthLink({ to, children }) {
  return <Link to={to} className="font-semibold text-[#0369A1] hover:underline">{children}</Link>;
}

export default function AuthShell({ title, subtitle, wide = false, children, footer }) {
  return (
    <div className="font-figtree relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F9FAFB] px-4 py-12 text-[#1F2937]">
      <DotGridCanvas className="absolute inset-0 h-full w-full" />

      {/* vignette: fades the dots out behind the card (same idea as the 21st.dev original) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at center, rgba(249,250,251,0.95) 0%, rgba(249,250,251,0) 100%)",
        }}
      />

      <div
        className={`relative z-10 w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-[20px] border border-[#D8DEE3] bg-white p-8 shadow-[0_8px_24px_rgba(28,51,46,0.12)]`}
      >
        <div className="flex flex-col items-center text-center">
          {/* logo placeholder, swap for the real mark */}
          <div className="mb-4 h-11 w-11 rounded-[12px] bg-[#E5E7EB]" />
          <h1 className="text-[28px] font-bold leading-9">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-[#4B5563]">{subtitle}</p>}
        </div>

        <div className="mt-6">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-[#4B5563]">{footer}</div>}
      </div>
    </div>
  );
}