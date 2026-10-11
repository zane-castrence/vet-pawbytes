import { Search } from "lucide-react";

// ---------- layout ----------
export const PAGE_CLASS = "mx-auto max-w-[1376px] px-4 py-6 font-figtree sm:px-8 sm:py-8";
export const H2_CLASS = "text-[22px] font-extrabold tracking-tight text-[#1F2937]";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-[#1F2937]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[15px] text-[#4B5563]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-[20px] border border-[#D8DEE3] bg-white p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function StatTile({ label, value, hint, highlight = false }) {
  return (
    <div
      className={`rounded-[20px] border p-5 ${
        highlight ? "border-[#2A3BD9] bg-[#2A3BD9] text-white" : "border-[#D8DEE3] bg-white text-[#1F2937]"
      }`}
    >
      <p className={`text-[13px] font-semibold ${highlight ? "text-white/80" : "text-[#4B5563]"}`}>{label}</p>
      <p className="mt-1 text-[40px] font-extrabold leading-none tracking-tight">{value}</p>
      {hint && <p className={`mt-2 text-[13px] ${highlight ? "text-white/80" : "text-[#4B5563]"}`}>{hint}</p>}
    </div>
  );
}

// ---------- buttons ----------
const VARIANTS = {
  primary: "bg-[#047857] text-white hover:bg-[#059669]",
  secondary: "border border-[#D8DEE3] bg-white text-[#1F2937] hover:bg-[#EEF2FF]",
  danger: "border border-[#FCA5A5] bg-white text-[#B91C1C] hover:bg-[#FEF2F2]",
  ghost: "text-[#4B5563] hover:bg-[#EEF2FF]",
};
const SIZES = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  icon: "h-8 w-8",
};

// use on <Link> too: <Link className={buttonClass("primary")}>
export const buttonClass = (variant = "primary", size = "md", extra = "") =>
  `inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[8px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A3BD9] disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;

export function Button({ variant, size, className = "", type = "button", ...props }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

// ---------- inputs ----------
export const INPUT_CLASS =
  "h-10 rounded-[8px] border border-[#D8DEE3] bg-white px-3 text-[14px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:border-[#2A3BD9] focus:ring-2 focus:ring-[#2A3BD9]/20";
export const TEXTAREA_CLASS =
  "rounded-[8px] border border-[#D8DEE3] bg-white px-3 py-2.5 text-[15px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:border-[#2A3BD9] focus:ring-2 focus:ring-[#2A3BD9]/20";

export function SearchInput({ label, value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4B5563]" strokeWidth={1.75} />
      <input
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${INPUT_CLASS} w-full pl-9`}
      />
    </div>
  );
}

// ---------- tabs / filters ----------
// options: [{ id, label, count? }]
export function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={`h-9 rounded-full px-4 text-[13px] font-semibold transition-colors ${
              on
                ? "bg-[#2A3BD9] text-white"
                : "border border-[#D8DEE3] bg-white text-[#4B5563] hover:bg-[#EEF2FF]"
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className={`ml-1.5 ${on ? "text-white/80" : "text-[#4B5563]/70"}`}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ---------- pills ----------
const PILL = {
  orange: "bg-[#FFEDD5] text-[#9A3412]",
  green: "bg-[#D1FAE5] text-[#065F46]",
  blue: "bg-[#DCE5FF] text-[#1F2DB0]",
  gray: "bg-[#EEF1F3] text-[#374151]",
};

export function Pill({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${PILL[tone]}`}>
      {children}
    </span>
  );
}

// ---------- alerts (pass as className to <Alert>) ----------
export const ALERT_ERROR = "mb-4 rounded-[8px] bg-[#FEE2E2] px-4 py-3 text-[14px] font-medium text-[#991B1B]";
export const ALERT_SUCCESS = "mb-4 rounded-[8px] bg-[#D1FAE5] px-4 py-3 text-[14px] font-medium text-[#065F46]";