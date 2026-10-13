// Time helpers shared by booking, the admin form and the stats page.
// Times are "HH:mm" (24 hour), dates are "YYYY-MM-DD".

export const STEP = 15; // minutes
export const MAX_MINUTES = 240; // longest single appointment
export const FALLBACK_MINUTES = 30; // length assumed for appointments saved before time ranges existed

export const toMinutes = (t) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t ?? ""));
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

export const toTime = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

// "13:30" -> "1:30 PM"
export const label12 = (t) => {
  const m = toMinutes(t);
  if (!Number.isFinite(m)) return String(t ?? "");
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

// 90 -> "1 hr 30 min"
export const formatDuration = (mins) => {
  if (!(mins > 0)) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  if (!m) return h === 1 ? "1 hr" : `${h} hrs`;
  return `${h} hr ${m} min`;
};

// End of an appointment in minutes. Older appointments only have a start time.
export const endMinutes = (a) => {
  const end = toMinutes(a?.endTime);
  if (Number.isFinite(end)) return end;
  const start = toMinutes(a?.time);
  return Number.isFinite(start) ? start + (Number(a?.duration) || FALLBACK_MINUTES) : NaN;
};

export const durationOf = (a) => {
  const s = toMinutes(a?.time);
  const e = endMinutes(a);
  return Number.isFinite(s) && Number.isFinite(e) && e > s ? e - s : FALLBACK_MINUTES;
};

// "9:00 AM - 10:30 AM" (just the start for appointments saved without an end)
export const formatTimeRange = (a) => {
  if (!a?.time) return "";
  const e = endMinutes(a);
  return Number.isFinite(e) && (a.endTime || a.duration)
    ? `${label12(a.time)} \u2013 ${label12(toTime(e))}`
    : label12(a.time);
};

// busy: [{ start: "HH:mm", end: "HH:mm" }]. Returns the first range that overlaps [s, e) or null.
export const findConflict = (busy, s, e) =>
  (busy || []).find((b) => s < toMinutes(b.end) && toMinutes(b.start) < e) || null;

// First free range of `minutes` that fits inside the clinic day. When nothing is free it parks at
// the earliest allowed spot (free: false) so the overlap warning can show.
export function findFreeRange(busy, { open, close, minutes, earliest = 0 }) {
  const lo = Math.max(open, Math.ceil(earliest / STEP) * STEP);
  const len = Math.min(minutes, close - open);
  for (let s = lo; s + len <= close; s += STEP) {
    if (!findConflict(busy, s, s + len)) return { start: s, end: s + len, free: true };
  }
  const s = Math.min(lo, Math.max(open, close - len));
  return { start: s, end: s + len, free: false };
}

// The next quarter hour after now, in minutes since midnight
export const nextQuarter = (d = new Date()) =>
  (Math.floor((d.getHours() * 60 + d.getMinutes()) / STEP) + 1) * STEP;