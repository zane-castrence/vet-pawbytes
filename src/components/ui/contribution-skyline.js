import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Grid3X3 } from "lucide-react";

const DAY_MS = 86400000;

const COLORS = [
  "#E5E7EB",
  "#D1FAE5",
  "#86EFAC",
  "#22C55E",
  "#15803D",
];

const BORDER = "#D8DEE3";
const MUTED = "#6B7280";
const TEXT = "#1F2937";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseDate = (value) => {
  if (!value) return NaN;

  if (typeof value === "number") {
    return Math.floor(value / DAY_MS) * DAY_MS;
  }

  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

    if (match) {
      return Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
      );
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return NaN;

  return Date.UTC(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
  );
};

const toKey = (value) => {
  const timestamp = parseDate(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : "";
};

const formatDate = (value, withYear = true) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

const formatMonth = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));

const getLevel = (count, max) => {
  if (count <= 0) return 0;
  if (!max) return 4;
  if (count >= max * 0.75) return 4;
  if (count >= max * 0.5) return 3;
  if (count >= max * 0.25) return 2;
  return 1;
};

const getEndDate = (data, endDate) => {
  if (endDate) return toKey(endDate);

  const validDates = data
    .map((item) => parseDate(item.date))
    .filter(Number.isFinite);

  if (!validDates.length) return toKey(Date.now());

  return toKey(Math.max(...validDates));
};

const buildGrid = (data, endDate) => {
  const counts = new Map();

  data.forEach((item) => {
    const key = toKey(item.date);
    const count = Number(item.count) || 0;

    if (!key || count <= 0) return;

    counts.set(key, (counts.get(key) || 0) + count);
  });

  const end = parseDate(endDate);
  const start = end - 364 * DAY_MS;
  const cells = [];

  for (let timestamp = start; timestamp <= end; timestamp += DAY_MS) {
    const date = toKey(timestamp);

    cells.push({
      date,
      count: counts.get(date) || 0,
      week: Math.floor(cells.length / 7),
      day: cells.length % 7,
    });
  }

  const max = Math.max(...cells.map((cell) => cell.count), 0);

  cells.forEach((cell) => {
    cell.level = getLevel(cell.count, max);
  });

  return {
    cells,
    weeks: Math.ceil(cells.length / 7),
    max,
  };
};

const getStreak = (cells, current = false) => {
  if (!cells.length) {
    return { days: 0, start: null, end: null };
  }

  if (current) {
    let end = cells.length - 1;

    while (end >= 0 && cells[end].count === 0) end -= 1;

    if (end < 0) {
      return { days: 0, start: null, end: null };
    }

    let start = end;

    while (start >= 0 && cells[start].count > 0) start -= 1;

    return {
      days: end - start,
      start: cells[start + 1].date,
      end: cells[end].date,
    };
  }

  let longest = { days: 0, start: null, end: null };
  let start = null;
  let days = 0;

  cells.forEach((cell) => {
    if (cell.count > 0) {
      if (days === 0) start = cell.date;

      days += 1;

      if (days > longest.days) {
        longest = {
          days,
          start,
          end: cell.date,
        };
      }
    } else {
      days = 0;
      start = null;
    }
  });

  return longest;
};

function Stat({ label, value, unit, sub }) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] leading-tight" style={{ color: MUTED }}>
        {label}
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span
          className="font-semibold tabular-nums"
          style={{
            color: "#16A34A",
            fontSize: 34,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          {value}
        </span>

        <span className="text-[14px]" style={{ color: TEXT }}>
          {unit}
        </span>
      </div>

      <div className="mt-1 truncate text-[12px]" style={{ color: MUTED }}>
        {sub}
      </div>
    </div>
  );
}

export default function ContributionSkyline({
  data = [],
  endDate,
  title,
  unit = "completed visit",
  unitPlural = "completed visits",
  className = "",
}) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);

  const [view, setView] = useState("3d");
  const [width, setWidth] = useState(0);
  const [activeLevel, setActiveLevel] = useState(-1);
  const [selected, setSelected] = useState(null);
  const [orbit, setOrbit] = useState({
    yaw: -35,
    pitch: 58,
  });

  const resolvedEndDate = useMemo(
    () => getEndDate(data, endDate),
    [data, endDate],
  );

  const model = useMemo(
    () => {
      const grid = buildGrid(data, resolvedEndDate);
      const total = grid.cells.reduce((sum, cell) => sum + cell.count, 0);
      const busiest = grid.cells.reduce(
        (best, cell) => (cell.count > best.count ? cell : best),
        { count: 0, date: null },
      );

      return {
        ...grid,
        total,
        activeDays: grid.cells.filter((cell) => cell.count > 0).length,
        busiest,
        longest: getStreak(grid.cells),
        current: getStreak(grid.cells, true),
      };
    },
    [data, resolvedEndDate],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const resize = () => setWidth(stage.clientWidth);

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  const cellSize = width < 640 ? 9 : width < 900 ? 12 : 16;
  const gap = width < 640 ? 2 : 3;
  const stageHeight = view === "3d" ? 360 : 250;

  const monthLabels = useMemo(() => {
    const labels = [];
    let previous = "";

    model.cells.forEach((cell) => {
      const month = formatMonth(cell.date);

      if (month !== previous) {
        labels.push({
          month,
          week: cell.week,
        });

        previous = month;
      }
    });

    return labels;
  }, [model.cells]);

  const handlePointerDown = (event) => {
    if (view !== "3d") return;

    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      yaw: orbit.yaw,
      pitch: orbit.pitch,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId || view !== "3d") {
      return;
    }

    setOrbit({
      yaw: clamp(
        drag.yaw + (event.clientX - drag.x) * 0.2,
        -70,
        -10,
      ),
      pitch: clamp(
        drag.pitch - (event.clientY - drag.y) * 0.15,
        40,
        72,
      ),
    });
  };

  const handlePointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const resetOrbit = () => {
    setOrbit({
      yaw: -35,
      pitch: 58,
    });
  };

  const heading =
    title ||
    `${model.total.toLocaleString()} ${
      model.total === 1 ? unit : unitPlural
    } in the last year`;

  return (
    <section
      className={`w-full rounded-[20px] border bg-white p-4 shadow-[0_8px_24px_rgba(28,51,46,0.12)] sm:p-5 ${className}`}
      style={{ borderColor: BORDER, color: TEXT }}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[18px] font-semibold tracking-tight sm:text-[20px]">
          {heading}
        </h2>

        <div
          className="inline-flex rounded-lg border p-1"
          style={{ borderColor: BORDER }}
          role="group"
          aria-label="Chart view"
        >
          <button
            type="button"
            aria-label="Flat heatmap"
            aria-pressed={view === "2d"}
            onClick={() => setView("2d")}
            className={`grid h-8 w-9 place-items-center rounded-md transition-colors ${
              view === "2d"
                ? "bg-[#1F2937] text-white"
                : "text-[#6B7280] hover:bg-[#EEF2FF]"
            }`}
          >
            <Grid3X3 className="h-4 w-4" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label="3D skyline"
            aria-pressed={view === "3d"}
            onClick={() => setView("3d")}
            className={`grid h-8 w-9 place-items-center rounded-md transition-colors ${
              view === "3d"
                ? "bg-[#1F2937] text-white"
                : "text-[#6B7280] hover:bg-[#EEF2FF]"
            }`}
          >
            <Box className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div
        className="rounded-[16px] border p-3 sm:p-4"
        style={{ borderColor: BORDER }}
      >
        <div
          ref={stageRef}
          className="relative overflow-hidden rounded-xl"
          style={{
            height: stageHeight,
            touchAction: view === "3d" ? "none" : "auto",
            cursor: view === "3d" ? "grab" : "default",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={resetOrbit}
        >
          <div
            className="absolute left-1/2 top-1/2 flex gap-[var(--cell-gap)] transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{
              "--cell-size": `${cellSize}px`,
              "--cell-gap": `${gap}px`,
              transform:
                view === "3d"
                  ? `translate(-50%, -43%) rotateX(${orbit.pitch}deg) rotateZ(${orbit.yaw}deg)`
                  : "translate(-50%, -50%)",
              transformStyle: "preserve-3d",
            }}
          >
            {Array.from({ length: model.weeks }, (_, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col gap-[var(--cell-gap)]"
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                {model.cells
                  .filter((cell) => cell.week === weekIndex)
                  .map((cell, index) => {
                    const dimmed =
                      activeLevel >= 0 && cell.level !== activeLevel;
                    const height =
                      cell.count > 0 && model.max > 0
                        ? 0.4 +
                          Math.pow(cell.count / model.max, 0.85) * 7.2
                        : 0.2;

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        aria-label={`${cell.count} completed visit${
                          cell.count === 1 ? "" : "s"
                        } on ${formatDate(cell.date)}`}
                        title={`${cell.count} completed visit${
                          cell.count === 1 ? "" : "s"
                        } on ${formatDate(cell.date)}`}
                        onClick={() =>
                          setSelected(
                            selected?.date === cell.date ? null : cell,
                          )
                        }
                        className={`h-[var(--cell-size)] w-[var(--cell-size)] shrink-0 rounded-[3px] border-0 p-0 transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9] ${
                          dimmed ? "opacity-20" : "opacity-100"
                        }`}
                        style={{
                          background: COLORS[cell.level],
                          transform:
                            view === "3d"
                              ? `translateZ(${height * 7}px)`
                              : "translateZ(0)",
                          transitionDelay: `${Math.min(
                            (weekIndex * 7 + index) * 2,
                            420,
                          )}ms`,
                          boxShadow:
                            view === "3d" && cell.count > 0
                              ? "2px 3px 0 rgba(31,41,55,0.16)"
                              : "inset 0 0 0 1px rgba(127,127,127,0.08)",
                        }}
                      />
                    );
                  })}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-4 text-[12px] text-[#6B7280] sm:gap-8 sm:text-[13px]">
            {monthLabels.map((label) => (
              <span key={`${label.month}-${label.week}`}>
                {label.month}
              </span>
            ))}
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 text-[12px] text-[#6B7280]">
            {view === "3d"
              ? "Drag to orbit · double-click to reset"
              : "Hover a day for details · click to select"}
          </div>
        </div>

        <div
          className="grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderColor: BORDER }}
        >
          <Stat
            label="1 year total"
            value={model.total.toLocaleString()}
            unit={model.total === 1 ? unit : unitPlural}
            sub={`${formatDate(model.cells[0].date)} — ${formatDate(
              model.cells[model.cells.length - 1].date,
            )}`}
          />

          <Stat
            label="Busiest day"
            value={model.busiest.count}
            unit={model.busiest.count === 1 ? unit : unitPlural}
            sub={
              model.busiest.date
                ? formatDate(model.busiest.date, false)
                : "—"
            }
          />

          <Stat
            label="Longest streak"
            value={model.longest.days}
            unit="days"
            sub={
              model.longest.start
                ? `${formatDate(model.longest.start, false)} — ${formatDate(
                    model.longest.end,
                    false,
                  )}`
                : "—"
            }
          />

          <Stat
            label="Current streak"
            value={model.current.days}
            unit="days"
            sub={
              model.current.start
                ? `${formatDate(model.current.start, false)} — ${formatDate(
                    model.current.end,
                    false,
                  )}`
                : "—"
            }
          />
        </div>

        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px]"
          style={{ color: MUTED }}
        >
          <span>{model.activeDays} active days</span>

          <div className="flex items-center gap-1.5">
            <span className="mr-1">Less</span>

            {COLORS.map((color, index) => (
              <button
                key={color}
                type="button"
                aria-label={`Highlight activity level ${index}`}
                aria-pressed={activeLevel === index}
                onClick={() =>
                  setActiveLevel(activeLevel === index ? -1 : index)
                }
                className="h-[11px] w-[11px] rounded-[2px] border-0 transition-transform hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9]"
                style={{ background: color }}
              />
            ))}

            <span className="ml-1">More</span>
          </div>
        </div>

        {selected && (
          <div
            className="mt-3 rounded-lg px-3 py-2 text-[13px]"
            style={{
              background: "#EEF2FF",
              color: TEXT,
            }}
          >
            <strong>{selected.count}</strong>{" "}
            {selected.count === 1 ? unit : unitPlural} on{" "}
            <strong>{formatDate(selected.date)}</strong>
          </div>
        )}
      </div>
    </section>
  );
}