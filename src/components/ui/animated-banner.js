import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const getTimeParts = (target) => {
  const diff = Math.max(0, target - Date.now());
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

const pad = (n) => String(n).padStart(2, "0");

function Countdown({ target, label }) {
  const [parts, setParts] = useState(() => getTimeParts(target));

  useEffect(() => {
    setParts(getTimeParts(target));
    const timer = window.setInterval(() => setParts(getTimeParts(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const segments = [
    ["d", parts.days],
    ["h", parts.hours],
    ["m", parts.minutes],
    ["s", parts.seconds],
  ];

  return (
    <div className="mt-6">
      {label && <p className="mb-2 text-[13px] font-semibold text-white/80">{label}</p>}
      <div className="flex items-center gap-2 font-figtree tabular-nums" role="timer" aria-label={label}>
        {segments.map(([unit, value]) => (
          <span key={unit} className="rounded-lg bg-white/15 px-2.5 py-1.5 text-[18px] font-bold text-white">
            {pad(value)}
            <span className="ml-0.5 text-[12px] font-medium text-white/70">{unit}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Placeholder art (flat shapes, no gradients). Pass imageSrc to show a photo instead.
function BannerArt() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="200" height="200" fill="#F06AA6" />
      <circle cx="60" cy="150" r="70" fill="#D9F25C" />
      <circle cx="150" cy="60" r="55" fill="#5AB4FF" />
      <circle cx="165" cy="165" r="30" fill="#F2733F" />
    </svg>
  );
}

export default function AnimatedBanner({
  title,
  subtitle,
  ctaLabel = "Explore",
  href = "/",
  imageSrc,
  deadline, // Date, number or date string. Shows a ticking countdown.
  deadlineLabel,
  className = "",
}) {
  const target = deadline === undefined ? NaN : new Date(deadline).getTime();

  return (
    <div className={`grid overflow-hidden rounded-[20px] bg-[#2A3BD9] font-figtree md:grid-cols-[3fr_2fr] ${className}`}>
      <div className="flex flex-col items-start justify-center p-6 text-white md:p-10">
        <h1 className="text-balance text-[32px] font-extrabold leading-tight tracking-tight md:text-[40px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-md text-pretty text-[16px] leading-6 text-white/85">{subtitle}</p>
        )}

        {!Number.isNaN(target) && <Countdown target={target} label={deadlineLabel} />}

        <Link
          to={href}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#D9F25C] px-4 py-2.5 text-[14px] font-semibold text-[#1F2937] transition-colors hover:bg-[#C8E544] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A3BD9]"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>

      <div className="h-44 md:h-auto">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <BannerArt />
        )}
      </div>
    </div>
  );
}