const THEMES = {
  light: { label: "", input: "", error: "" },
  auth: {
    label: "mb-1.5 text-[13px] font-medium text-[#374151]",
    input:
      "h-11 rounded-lg border border-[#D8DEE3] bg-white px-3 text-[15px] text-[#1F2937] outline-none placeholder:text-[#9CA3AF] focus:border-[#0369A1] focus:ring-2 focus:ring-[#0369A1]/20 aria-[invalid=true]:border-red-500",
    error: "mt-1 text-xs text-red-600",
  },
};

export default function FormField({ label, error, as: Tag = "input", theme = "light", children, ...props }) {
  const t = THEMES[theme];
  return (
    <div className="flex flex-col">
      <label htmlFor={props.name} className={t.label}>{label}</label>
      <Tag id={props.name} aria-invalid={!!error} className={t.input} {...props}>{children}</Tag>
      {error && <small role="alert" className={t.error}>{error}</small>}
    </div>
  );
}