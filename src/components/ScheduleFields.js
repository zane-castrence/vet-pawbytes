import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import AppleCalendarPicker from "./ui/apple-calendar-picker";
import TimeRangeSlider from "./ui/time-range-slider";
import { getBusyRanges } from "../services/api";
import { getClinicSettings, suggestedMinutes } from "../services/clinicSettings";
import { findFreeRange, nextQuarter, toMinutes, toTime } from "../utils/time";

const pad = (n) => String(n).padStart(2, "0");
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const TRIGGER =
  "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[#D8DEE3] bg-white px-3 text-left text-[15px] text-[#1F2937] outline-none transition-colors hover:border-[#2A3BD9] focus:border-[#2A3BD9] focus:ring-2 focus:ring-[#2A3BD9]/20 data-[invalid=true]:border-red-500";

/**
 * Date + time range for an appointment: a calendar picker for the day and a range slider
 * for the time. The slider starts on the service's suggested length at the first free time
 * and keeps whatever the person drags it to.
 *
 * onPatch receives partial form fields: { date } or { time, endTime }.
 * allowPast: let past dates be picked (admin editing a completed visit).
 * checkConflicts: warn about overlaps with this vet's other bookings (pending and scheduled only).
 */
export default function ScheduleFields({
  service,
  vet,
  date,
  time,
  endTime,
  ignoreId,
  allowPast = false,
  checkConflicts = true,
  errors = {},
  onPatch,
}) {
  const [busy, setBusy] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // an existing appointment keeps its time until the service changes
  const [custom, setCustom] = useState(() => !!time);
  const prevService = useRef(service);

  const { open, close } = getClinicSettings();
  const openM = toMinutes(open);
  const closeM = toMinutes(close);
  const suggested = service ? suggestedMinutes(service) : 30;
  const today = todayKey();
  const earliest = date === today && !allowPast ? nextQuarter() : 0;
  const ready = !!(service && vet && date);

  useEffect(() => {
    if (!date || !vet) {
      setBusy([]);
      return undefined;
    }
    let alive = true;
    getBusyRanges(date, vet, ignoreId)
      .then((r) => alive && setBusy(r))
      .catch(() => alive && setBusy([]));
    return () => {
      alive = false;
    };
  }, [date, vet, ignoreId]);

  const visibleBusy = checkConflicts ? busy : [];

  // latest values for the effect below, so it only reruns when the inputs that matter change
  const latest = useRef({});
  latest.current = { custom, time, endTime, onPatch, visibleBusy, openM, closeM, suggested, earliest };

  const applyDefault = () => {
    const c = latest.current;
    const r = findFreeRange(c.visibleBusy, { open: c.openM, close: c.closeM, minutes: c.suggested, earliest: c.earliest });
    if (r.start !== toMinutes(c.time) || r.end !== toMinutes(c.endTime)) {
      c.onPatch({ time: toTime(r.start), endTime: toTime(r.end) });
    }
  };
  const applyRef = useRef(applyDefault);
  applyRef.current = applyDefault;

  useEffect(() => {
    const c = latest.current;
    const serviceChanged = prevService.current !== service;
    prevService.current = service;
    if (serviceChanged) setCustom(false);
    if (!ready) return;
    // saved before time ranges existed: add an end time from the suggested length
    if (c.time && !c.endTime && !serviceChanged) {
      const s = toMinutes(c.time);
      c.onPatch({ endTime: toTime(Math.min(c.closeM, s + c.suggested)) });
      return;
    }
    if (c.custom && !serviceChanged) return;
    applyRef.current();
  }, [ready, service, date, vet, busy, suggested, openM, closeM, earliest, checkConflicts]);

  const reset = () => {
    setCustom(false);
    applyRef.current();
  };

  const dateLabel = date
    ? new Date(`${date}T00:00`).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : "Select date";

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor="schedule-date" className="mb-1.5 text-[13px] font-medium text-[#374151]">Date</label>
        <button
          id="schedule-date"
          type="button"
          data-invalid={!!errors.date}
          aria-haspopup="dialog"
          onClick={() => setCalendarOpen(true)}
          className={TRIGGER}
        >
          <span className={date ? "" : "text-[#9CA3AF]"}>{dateLabel}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-[#4B5563]" strokeWidth={1.75} />
        </button>
        {errors.date && <small role="alert" className="mt-1 text-xs text-red-600">{errors.date}</small>}
      </div>

      {ready ? (
        <TimeRangeSlider
          start={time}
          end={endTime}
          open={open}
          close={close}
          busy={visibleBusy}
          earliest={earliest}
          suggested={suggested}
          serviceLabel={service}
          isDefault={!custom}
          error={errors.time}
          onChange={(range) => {
            setCustom(true);
            onPatch(range);
          }}
          onReset={reset}
        />
      ) : (
        <div>
          <p className="text-[13px] font-medium text-[#374151]">Time</p>
          <p className="mt-1 text-[14px] text-[#4B5563]">
            Choose {[!service && "a service", !vet && "a veterinarian", !date && "a date"].filter(Boolean).join(", ").replace(/, ([^,]*)$/, " and $1")} to pick a time.
          </p>
          {errors.time && <small role="alert" className="mt-1 block text-xs text-red-600">{errors.time}</small>}
        </div>
      )}

      <AppleCalendarPicker
        isOpen={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        value={date}
        min={allowPast ? undefined : today}
        onSelect={(k) => onPatch({ date: k })}
      />
    </div>
  );
}