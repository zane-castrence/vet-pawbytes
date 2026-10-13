import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

/**
 * Apple-style calendar picker: a month grid in a small card, with a month and year
 * dropdown on the title.
 *
 * Converted from the 21st.dev "Apple Calendar Picker" (see Credits). PawBytes changes:
 * JS instead of TypeScript, design-system colors, radius and font, light theme only,
 * the time inputs are gone (the time range slider picks the time), and it takes a
 * `value` ("YYYY-MM-DD"), `min`, `max` and `isDayDisabled` so closed days can be blocked.
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const BRAND = "#2A3BD9";

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayKey = () => {
  const d = new Date();
  return keyOf(d.getFullYear(), d.getMonth(), d.getDate());
};
const parseKey = (k) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k || "");
  return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null;
};
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
);
const DropdownArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
);

const NAV_BTN =
  "rounded-full p-1.5 text-[#2A3BD9] transition-colors hover:bg-[#EEF2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2A3BD9] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

function CalendarCard({ onClose, value, onSelect, min, max, isDayDisabled }) {
  const reduce = useReducedMotion();
  const start = parseKey(value) || parseKey(min) || parseKey(todayKey());
  const [year, setYear] = useState(start.y);
  const [month, setMonth] = useState(start.m);
  const [showDropdown, setShowDropdown] = useState(false);
  const cardRef = useRef(null);
  const today = todayKey();

  // Esc closes the calendar (or its month list) and nothing behind it
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      if (showDropdown) setShowDropdown(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, showDropdown]);

  // keyboard users land on the chosen day (or the first day they can pick)
  useEffect(() => {
    const el =
      cardRef.current?.querySelector('[data-selected="true"]') ||
      cardRef.current?.querySelector("[data-day]:not(:disabled)");
    el?.focus();
  }, []);

  const isDisabled = (k) => (min && k < min) || (max && k > max) || (isDayDisabled ? isDayDisabled(k) : false);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const prevY = month === 0 ? year - 1 : year;
  const prevM = month === 0 ? 11 : month - 1;
  const nextY = month === 11 ? year + 1 : year;
  const nextM = month === 11 ? 0 : month + 1;
  const prevBlocked = !!min && keyOf(prevY, prevM, getDaysInMonth(prevY, prevM)) < min;
  const nextBlocked = !!max && keyOf(nextY, nextM, 1) > max;
  const monthBlocked = (y, idx) =>
    (!!min && keyOf(y, idx, getDaysInMonth(y, idx)) < min) || (!!max && keyOf(y, idx, 1) > max);

  const prevMonth = () => {
    setMonth(prevM);
    setYear(prevY);
  };
  const nextMonth = () => {
    setMonth(nextM);
    setYear(nextY);
  };

  const pickDay = (k) => {
    onSelect(k);
    onClose();
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  for (let day = 1; day <= daysInMonth; day++) {
    const k = keyOf(year, month, day);
    const isSelected = k === value;
    const isToday = k === today;
    const off = isDisabled(k);
    days.push(
      <button
        key={k}
        type="button"
        data-day
        data-selected={isSelected}
        disabled={off}
        aria-pressed={isSelected}
        aria-label={new Date(year, month, day).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        onClick={() => pickDay(k)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2A3BD9] ${
          isSelected
            ? "bg-[#2A3BD9] font-semibold text-white"
            : off
              ? "cursor-not-allowed font-medium text-[#9CA3AF]"
              : `font-medium hover:bg-[#EEF2FF] ${isToday ? "font-bold text-[#2A3BD9]" : "text-[#1F2937]"}`
        }`}
      >
        {day}
      </button>,
    );
  }

  const selected = parseKey(value);
  const selectedLabel = selected
    ? new Date(selected.y, selected.m, selected.d).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })
    : "No date picked";

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1F2937]/20 p-4 font-figtree"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a date"
    >
      <motion.div
        ref={cardRef}
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative w-[310px] max-w-full overflow-hidden rounded-[20px] border border-[#D8DEE3] bg-white p-[18px] text-[#1F2937] shadow-[0_8px_24px_rgba(28,51,46,0.12)]"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            aria-expanded={showDropdown}
            className="flex items-center gap-1 rounded-[8px] text-[17px] font-semibold text-[#2A3BD9] transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A3BD9]"
          >
            <span>{MONTH_NAMES[month]} {year}</span>
            <span className={`transition-transform duration-200 motion-reduce:transition-none ${showDropdown ? "rotate-180" : "rotate-0"}`}>
              <DropdownArrowIcon />
            </span>
          </button>

          <div className="flex items-center gap-1">
            <button type="button" onClick={prevMonth} disabled={prevBlocked} aria-label="Previous month" className={NAV_BTN}>
              <ChevronLeftIcon />
            </button>
            <button type="button" onClick={nextMonth} disabled={nextBlocked} aria-label="Next month" className={NAV_BTN}>
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-[10px] font-bold tracking-wider text-[#4B5563]">{d}</div>
          ))}
        </div>

        {/* Days + month list */}
        <div className="relative mb-4 h-[252px]">
          <div className="absolute z-10 grid w-full grid-cols-7 content-start justify-items-center gap-y-1">{days}</div>

          {showDropdown && (
            <div className="absolute inset-0 z-30 flex flex-col rounded-[14px] bg-white/95 p-3 backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between border-b border-[#D8DEE3] pb-2">
                <button type="button" onClick={() => setYear((y) => y - 1)} disabled={!!min && keyOf(year - 1, 11, 31) < min} aria-label="Previous year" className={NAV_BTN}>
                  <ChevronLeftIcon />
                </button>
                <span className="text-[16px] font-bold">{year}</span>
                <button type="button" onClick={() => setYear((y) => y + 1)} disabled={!!max && keyOf(year + 1, 0, 1) > max} aria-label="Next year" className={NAV_BTN}>
                  <ChevronRightIcon />
                </button>
              </div>
              <div className="grid flex-1 grid-cols-3 gap-1.5 overflow-y-auto">
                {MONTH_NAMES.map((m, idx) => {
                  const on = idx === month;
                  const off = monthBlocked(year, idx);
                  return (
                    <button
                      key={m}
                      type="button"
                      disabled={off}
                      onClick={() => {
                        setMonth(idx);
                        setShowDropdown(false);
                      }}
                      className={`rounded-[8px] py-1.5 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2A3BD9] ${
                        on
                          ? "bg-[#2A3BD9] text-white"
                          : off
                            ? "cursor-not-allowed text-[#9CA3AF]"
                            : "text-[#1F2937] hover:bg-[#EEF2FF]"
                      }`}
                    >
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom row: the picked date and a shortcut to today */}
        <div className="flex items-center justify-between border-t border-[#D8DEE3] pt-4">
          <span className="text-[15px] font-semibold">{selectedLabel}</span>
          <button
            type="button"
            disabled={isDisabled(today)}
            onClick={() => pickDay(today)}
            style={{ color: BRAND }}
            className="h-8 rounded-[8px] px-3 text-[14px] font-semibold transition-colors hover:bg-[#EEF2FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2A3BD9] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Today
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

export default function AppleCalendarPicker({ isOpen, onClose, value, onSelect, min, max, isDayDisabled }) {
  // mounted only while open, so it always starts on the picked month
  if (!isOpen) return null;
  return (
    <CalendarCard onClose={onClose} value={value} onSelect={onSelect} min={min} max={max} isDayDisabled={isDayDisabled} />
  );
}