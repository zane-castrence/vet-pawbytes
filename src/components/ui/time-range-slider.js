import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button, INPUT_CLASS } from "./app-controls";
import {
  MAX_MINUTES, STEP, findConflict, formatDuration, label12, toMinutes, toTime,
} from "../../utils/time";

/**
 * Two-handle time range slider with a start and end input underneath.
 *
 * Converted from the 21st.dev "Price Range Slider" (see Credits). PawBytes changes: JS instead
 * of TypeScript, no Radix, NumberFlow or shadcn button (pointer events and the app Button
 * instead, so nothing new to install), design-system colors, and the values are times of day:
 * drag either handle, drag the bar to move the whole visit, click the track, use the arrow
 * keys, or type the times. Booked ranges show under the track and turn the bar red when the
 * chosen time overlaps them.
 *
 * Props: start, end ("HH:mm"), open, close ("HH:mm"), busy [{ start, end }], earliest (minutes,
 * the earliest allowed start today), suggested (minutes), isDefault, onChange({ time, endTime }),
 * onReset(), serviceLabel, error.
 */

const BRAND = "#2A3BD9";
const DANGER = "#B91C1C";
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

export default function TimeRangeSlider({
  start,
  end,
  open,
  close,
  busy = [],
  earliest = 0,
  suggested = 30,
  isDefault = false,
  onChange,
  onReset,
  serviceLabel,
  error,
}) {
  const openM = toMinutes(open);
  const closeM = toMinutes(close);
  const span = closeM - openM;
  const lo = Math.max(openM, Math.ceil(earliest / STEP) * STEP);
  const noSlots = lo + STEP > closeM;
  const parsedStart = toMinutes(start);
  const sM = Number.isFinite(parsedStart) ? parsedStart : lo;
  const parsedEnd = toMinutes(end);
  const eM = Number.isFinite(parsedEnd) ? parsedEnd : Math.min(closeM, sM + suggested);
  const conflict = findConflict(busy, sM, eM);
  const color = conflict ? DANGER : BRAND;
  const pct = (m) => ((m - openM) / span) * 100;

  const trackRef = useRef(null);
  const drag = useRef(null);
  const [preview, setPreview] = useState(null);
  const [draft, setDraft] = useState({ start, end });
  useEffect(() => setDraft({ start, end }), [start, end]);

  const snap = (m) => clamp(Math.round((m - openM) / STEP) * STEP + openM, openM, closeM);
  const valueAt = (x) => {
    const r = trackRef.current.getBoundingClientRect();
    return snap(openM + ((x - r.left) / r.width) * span);
  };

  // mode: "start" | "end" | "move". `v` is the pointer value, `offset` keeps the grab point.
  const place = (mode, v, offset = 0) => {
    const t = v - offset;
    let s = sM;
    let e = eM;
    if (mode === "start") {
      s = clamp(t, lo, e - STEP);
      if (e - s > MAX_MINUTES) s = e - MAX_MINUTES;
    } else if (mode === "end") {
      e = clamp(t, s + STEP, closeM);
      if (e - s > MAX_MINUTES) e = s + MAX_MINUTES;
    } else {
      const len = e - s;
      s = clamp(t, lo, closeM - len);
      e = s + len;
    }
    if (s !== sM || e !== eM) onChange({ time: toTime(s), endTime: toTime(e) });
  };

  const down = (ev) => {
    if (noSlots || ev.button > 0) return;
    const v = valueAt(ev.clientX);
    const thumb = ev.target.closest?.("[data-thumb]")?.dataset.thumb;
    let mode = thumb;
    let offset = 0;
    if (thumb) offset = v - (thumb === "start" ? sM : eM);
    else if (v > sM && v < eM) {
      mode = "move";
      offset = v - sM;
    } else mode = v <= sM ? "start" : "end";
    drag.current = { mode, offset };
    ev.currentTarget.setPointerCapture(ev.pointerId);
    place(mode, v, offset);
  };
  const move = (ev) => {
    if (drag.current) place(drag.current.mode, valueAt(ev.clientX), drag.current.offset);
    else if (ev.pointerType === "mouse" && !noSlots) setPreview(valueAt(ev.clientX));
  };
  const up = (ev) => {
    drag.current = null;
    if (ev.currentTarget.hasPointerCapture(ev.pointerId)) ev.currentTarget.releasePointerCapture(ev.pointerId);
  };

  const keyFor = (which) => (ev) => {
    const delta = { ArrowLeft: -STEP, ArrowDown: -STEP, ArrowRight: STEP, ArrowUp: STEP, PageDown: -60, PageUp: 60 }[ev.key];
    const cur = which === "start" ? sM : eM;
    let v;
    if (delta) v = cur + delta;
    else if (ev.key === "Home") v = which === "start" ? lo : sM + STEP;
    else if (ev.key === "End") v = which === "start" ? eM - STEP : closeM;
    else return;
    ev.preventDefault();
    place(which, v, 0);
  };

  // typed times: applied on blur or Enter
  const commitStart = () => {
    const m = toMinutes(draft.start);
    if (!Number.isFinite(m)) return setDraft({ start, end });
    const s = clamp(snap(m), lo, closeM - STEP);
    const e = Math.min(closeM, s + (eM - sM));
    onChange({ time: toTime(s), endTime: toTime(e) });
    setDraft({ start: toTime(s), end: toTime(e) });
  };
  const commitEnd = () => {
    const m = toMinutes(draft.end);
    if (!Number.isFinite(m)) return setDraft({ start, end });
    const e = clamp(snap(m), sM + STEP, Math.min(closeM, sM + MAX_MINUTES));
    onChange({ time: toTime(sM), endTime: toTime(e) });
    setDraft({ start: toTime(sM), end: toTime(e) });
  };
  const onEnter = (commit) => (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      commit();
    }
  };

  // hour labels under the track, about four of them
  const stepH = Math.max(1, Math.ceil(span / 60 / 4));
  const ticks = [];
  for (let m = Math.ceil(openM / 60) * 60; m <= closeM; m += 60 * stepH) ticks.push(m);

  // the hover preview shades the gap between the nearest handle and the pointer
  let ghost = null;
  if (preview !== null && !drag.current) {
    if (preview < sM) ghost = { left: pct(preview), width: pct(sM) - pct(preview) };
    else if (preview > eM) ghost = { left: pct(eM), width: pct(preview) - pct(eM) };
  }

  const renderThumb = (which, m) => (
    <div
      role="slider"
      tabIndex={noSlots ? -1 : 0}
      data-thumb={which}
      aria-label={which === "start" ? "Start time" : "End time"}
      aria-valuemin={which === "start" ? lo : sM + STEP}
      aria-valuemax={which === "start" ? eM - STEP : closeM}
      aria-valuenow={m}
      aria-valuetext={label12(toTime(m))}
      aria-orientation="horizontal"
      onKeyDown={keyFor(which)}
      className="group absolute top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center outline-none active:cursor-grabbing"
      style={{ left: `${pct(m)}%` }}
    >
      <span
        className="block h-5 w-5 rounded-full border-2 bg-white shadow-[0_8px_24px_rgba(28,51,46,0.12)] transition-transform group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-[#2A3BD9]/40 motion-reduce:transition-none"
        style={{ borderColor: color }}
      />
    </div>
  );

  return (
    <div role="group" aria-label="Appointment time" className={`space-y-4 ${noSlots ? "opacity-60" : ""}`}>
      {/* Header: label, chosen range, reset */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#374151]">Time</p>
          <p className="mt-1 text-[20px] font-extrabold leading-tight tabular-nums text-[#1F2937]">
            {label12(toTime(sM))} <span className="font-semibold text-[#4B5563]">{"\u2013"}</span> {label12(toTime(eM))}
          </p>
          <p className="mt-0.5 text-[13px] text-[#4B5563]">
            {formatDuration(eM - sM)}
            {serviceLabel ? ` \u00B7 suggested ${formatDuration(suggested)} for ${serviceLabel}` : ""}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onReset} disabled={isDefault || noSlots} aria-label="Reset to the suggested time">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Reset
        </Button>
      </div>

      {/* Slider */}
      <div className="space-y-1">
        <div className="mx-3">
          <div
            ref={trackRef}
            className="relative h-11 touch-none select-none"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={() => setPreview(null)}
          >
            <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#E5E7EB]" />
            {ghost && ghost.width > 0 && (
              <div
                className="pointer-events-none absolute top-1/2 z-[1] h-2 -translate-y-1/2 rounded-full bg-[#2A3BD9]/25 transition-[left,width] duration-75 motion-reduce:transition-none"
                style={{ left: `${ghost.left}%`, width: `${ghost.width}%` }}
              />
            )}
            <div
              className="absolute top-1/2 z-10 h-2 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing"
              style={{ left: `${pct(sM)}%`, width: `${pct(eM) - pct(sM)}%`, background: color }}
            />
            {/* booked ranges */}
            {busy.map((b) => {
              const bs = clamp(toMinutes(b.start), openM, closeM);
              const be = clamp(toMinutes(b.end), openM, closeM);
              if (!(be > bs)) return null;
              return (
                <div
                  key={`${b.start}-${b.end}`}
                  title={`Booked ${label12(b.start)} \u2013 ${label12(b.end)}`}
                  className="pointer-events-none absolute top-[calc(50%+12px)] h-1.5 rounded-full bg-[#FCA5A5]"
                  style={{ left: `${pct(bs)}%`, width: `${pct(be) - pct(bs)}%` }}
                />
              );
            })}
            {renderThumb("start", sM)}
            {renderThumb("end", eM)}
          </div>

          <div className="relative mt-1 h-4 select-none text-[11px] font-medium text-[#4B5563]">
            {ticks.map((m) => (
              <span key={m} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${pct(m)}%` }}>
                {label12(toTime(m)).replace(":00", "")}
              </span>
            ))}
          </div>
        </div>
        {busy.length > 0 && (
          <p className="flex items-center gap-1.5 text-[12px] text-[#4B5563]">
            <span className="h-1.5 w-4 rounded-full bg-[#FCA5A5]" aria-hidden="true" />
            Already booked with this veterinarian
          </p>
        )}
      </div>

      {/* Typed times (optional) */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col text-[13px] font-medium text-[#374151]">
          <span className="mb-1.5">Start</span>
          <input
            type="time"
            step={STEP * 60}
            min={open}
            max={close}
            disabled={noSlots}
            value={draft.start || ""}
            onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
            onBlur={commitStart}
            onKeyDown={onEnter(commitStart)}
            className={`${INPUT_CLASS} h-11 w-full text-[15px]`}
          />
        </label>
        <label className="flex flex-col text-[13px] font-medium text-[#374151]">
          <span className="mb-1.5">End</span>
          <input
            type="time"
            step={STEP * 60}
            min={open}
            max={close}
            disabled={noSlots}
            value={draft.end || ""}
            onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
            onBlur={commitEnd}
            onKeyDown={onEnter(commitEnd)}
            className={`${INPUT_CLASS} h-11 w-full text-[15px]`}
          />
        </label>
      </div>

      {noSlots && (
        <p role="alert" className="text-[13px] font-medium text-[#B91C1C]">
          The clinic has no more openings today. Pick another date.
        </p>
      )}
      {!noSlots && conflict && (
        <p role="alert" className="text-[13px] font-medium text-[#B91C1C]">
          That overlaps a booking ({label12(conflict.start)} {"\u2013"} {label12(conflict.end)}).{" "}
          <button type="button" onClick={onReset} className="underline underline-offset-2 hover:no-underline">
            Use the next free time
          </button>
        </p>
      )}
      {error && <small role="alert" className="block text-xs text-red-600">{error}</small>}
    </div>
  );
}