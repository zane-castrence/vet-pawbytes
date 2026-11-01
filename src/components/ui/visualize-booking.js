import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import StatusBadge from "../StatusBadge";
import { formatDate } from "../../utils/format";
import { formatTimeRange, toMinutes } from "../../utils/time";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const SPRING = { type: "spring", stiffness: 400, damping: 28, mass: 0.6 };
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9]";

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function Day({ cell, items, today, selected, onSelect, reduce }) {
  const [hovered, setHovered] = useState(false);

  if (!cell.inMonth) {
    return <div className="h-14 rounded-[8px] bg-[#F9FAFB]/60 sm:h-16" aria-hidden="true" />;
  }

  const count = items.length;
  const base = "relative flex h-14 items-center justify-center rounded-[8px] text-[14px] sm:h-16";
  const ring = today
    ? "ring-2 ring-[#2A3BD9]"
    : selected
      ? "ring-2 ring-[#1F2DB0]"
      : "";

  if (!count) {
    return (
      <div className={`${base} border border-[#D8DEE3] bg-[#F9FAFB] text-[#4B5563] ${ring}`}>
        {cell.day}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-pressed={selected}
      aria-label={`${cell.key}, ${count} appointment${count > 1 ? "s" : ""}`}
      className={`${base} ${ring} ${FOCUS} cursor-pointer font-semibold transition-colors ${
        selected ? "bg-[#DCE5FF] text-[#1F2DB0]" : "bg-[#EEF2FF] text-[#1F2937] hover:bg-[#DCE5FF]"
      }`}
    >
      {cell.day}
      <motion.span
        className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2A3BD9] px-1 text-[10px] font-bold text-white"
        animate={{ scale: hovered && !reduce ? 1.5 : 1 }}
        transition={reduce ? { duration: 0 } : SPRING}
      >
        {count}
      </motion.span>
    </button>
  );
}

// appointments: array from the API. showOwner: show the customer name (clinic team).
export default function VisualizeBooking({ appointments = [], showOwner = false }) {
  const reduce = useReducedMotion();
  const now = new Date();
  const todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());

  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [view, setView] = useState("calendar"); // "calendar" | "list"
  const [selected, setSelected] = useState(null);

  const byDate = useMemo(() => {
    const map = {};
    appointments.forEach((a) => {
      if (!a.date) return;
      (map[a.date] ||= []).push(a);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
    );
    return map;
  }, [appointments]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < first; i += 1) out.push({ inMonth: false, id: `lead-${i}` });
    for (let d = 1; d <= total; d += 1) {
      out.push({ inMonth: true, day: d, key: keyOf(cursor.y, cursor.m, d), id: `d-${d}` });
    }
    let tail = 0;
    while (out.length % 7 !== 0) {
      out.push({ inMonth: false, id: `tail-${tail}` });
      tail += 1;
    }
    return out;
  }, [cursor]);

  const monthPrefix = `${cursor.y}-${pad(cursor.m + 1)}-`;
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const listDays = useMemo(() => {
    const keys = Object.keys(byDate)
      .filter((k) => (selected ? k === selected : k.startsWith(monthPrefix)))
      .sort();
    return keys.map((k) => ({ key: k, items: byDate[k] }));
  }, [byDate, selected, monthPrefix]);

  const go = (delta) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  };

  const goToday = () => {
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
    setSelected(null);
  };

  const pick = (key) => {
    setSelected((cur) => (cur === key ? null : key));
    if (view === "calendar" && typeof window !== "undefined" && window.innerWidth < 1024) {
      setView("list");
    }
  };

  const toggleBtn = (id, Icon, label) => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      aria-pressed={view === id}
      aria-label={label}
      className={`rounded-[6px] p-1.5 transition-colors lg:hidden ${FOCUS} ${
        view === id ? "bg-white text-[#1F2DB0] shadow-sm" : "text-[#4B5563]"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  );

  const navBtn = "rounded-[8px] border border-[#D8DEE3] bg-white p-2 text-[#1F2937] transition-colors hover:bg-[#EEF2FF] " + FOCUS;

  return (
    <div className="grid gap-8 font-figtree lg:grid-cols-2">
      {/* Calendar */}
      <section className={view === "list" ? "hidden lg:block" : ""} aria-label="Calendar">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[26px] font-extrabold tracking-tight text-[#1F2937]">{monthLabel}</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={goToday} className={`${navBtn} px-3 text-[13px] font-semibold`}>
              Today
            </button>
            <button type="button" onClick={() => go(-1)} aria-label="Previous month" className={navBtn}>
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next month" className={navBtn}>
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <div className="flex gap-1 rounded-[8px] bg-[#EEF2FF] p-1 lg:hidden">
              {toggleBtn("calendar", CalendarDays, "Calendar view")}
              {toggleBtn("list", List, "List view")}
            </div>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="rounded-[8px] bg-[#EEF2FF] py-1 text-center text-[12px] font-semibold text-[#1F2DB0]"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => (
            <Day
              key={cell.id}
              cell={cell}
              items={cell.inMonth ? byDate[cell.key] || [] : []}
              today={cell.key === todayKey}
              selected={cell.key === selected}
              onSelect={pick}
              reduce={reduce}
            />
          ))}
        </div>
      </section>

      {/* Bookings list */}
      <section className={view === "calendar" ? "hidden lg:block" : ""} aria-label="Appointments">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[26px] font-extrabold tracking-tight text-[#1F2937]">
              {selected ? formatDate(selected) : "Appointments"}
            </h2>
            <p className="mt-1 text-[14px] text-[#4B5563]">
              {selected ? "Showing one day." : `Everything booked in ${monthLabel}.`}
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className={`${navBtn} px-3 text-[13px] font-semibold`}
            >
              Show month
            </button>
          )}
        </div>

        <div className="max-h-[620px] overflow-y-auto rounded-[20px] border border-[#D8DEE3] bg-white">
          {listDays.length === 0 ? (
            <p className="p-6 text-[14px] text-[#4B5563]">No appointments here.</p>
          ) : (
            <AnimatePresence initial={false}>
              {listDays.map(({ key, items }) => (
                <div key={key} className="border-b-2 border-[#D8DEE3] last:border-b-0">
                  {items.map((a, i) => (
                    <motion.article
                      key={a.id || `${key}-${i}`}
                      className="border-b border-[#D8DEE3] p-4 last:border-b-0"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reduce ? { duration: 0 } : { duration: 0.2, delay: Math.min(i, 6) * 0.04 }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3 text-[13px] font-semibold text-[#4B5563]">
                        <span>{formatDate(a.date)}</span>
                        <span>{formatTimeRange(a)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-[18px] font-extrabold tracking-tight text-[#1F2937]">
                            {a.petName || "Appointment"}
                          </h3>
                          <p className="mt-0.5 text-[14px] text-[#4B5563]">
                            {a.service}
                            {a.vet ? ` · ${a.vet}` : ""}
                          </p>
                          {showOwner && a.ownerName && (
                            <p className="mt-0.5 text-[13px] text-[#4B5563]">Owner: {a.ownerName}</p>
                          )}
                        </div>
                        <StatusBadge status={a.status} />
                      </div>
                    </motion.article>
                  ))}
                </div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}
