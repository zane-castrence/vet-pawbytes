import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllAppointments } from "../services/api";
import Alert from "../components/Alert";
import ContributionSkyline, { buildGrid, dayMs } from "../components/ui/contribution-skyline";
import { ALERT_ERROR, PAGE_CLASS, PageHeader } from "../components/ui/app-controls";

const pad = (n) => String(n).padStart(2, "0");
const localKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Any stored date -> "YYYY-MM-DD", or "" when it can't be read
const toDateKey = (value) => {
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  if (value == null || value === "") return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : localKey(d);
};

const isCompleted = (a) => String(a?.status || "").trim().toLowerCase() === "completed";

// Admin only (the route is already restricted in App.js)
export default function AdminStats() {
  const [dates, setDates] = useState(null); // null = still loading
  const [unreadable, setUnreadable] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const all = await getAllAppointments();
      const done = (Array.isArray(all) ? all : []).filter(isCompleted);
      const keys = done.map((a) => toDateKey(a.date)).filter(Boolean).sort();
      // keep the same array when nothing changed so the graph isn't rebuilt on every refresh
      setDates((prev) => (prev && prev.join() === keys.join() ? prev : keys));
      setUnreadable(done.length - keys.length);
      setError("");
    } catch {
      setError("Couldn't load completed visit statistics.");
      setDates((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, [load]);

  const data = useMemo(() => (dates || []).map((date) => ({ date, count: 1 })), [dates]);

  // The year ends today (or on the latest completed visit if one is dated later)
  const today = localKey(new Date());
  const endDate = dates && dates.length && dates[dates.length - 1] > today ? dates[dates.length - 1] : today;

  // Completed visits that fall before the one-year window
  const older = useMemo(() => {
    if (!data.length) return 0;
    const shown = buildGrid(data, dayMs(endDate)).cells.reduce((sum, c) => sum + c.count, 0);
    return data.length - shown;
  }, [data, endDate]);

  return (
    <section className={PAGE_CLASS}>
      <PageHeader title="Stats" subtitle="Completed clinic visits over the last year." />

      <Alert className={ALERT_ERROR}>{error}</Alert>

      {dates === null ? (
        <p className="text-[15px] text-[#4B5563]">Loading statistics…</p>
      ) : (
        <>
          <ContributionSkyline
            data={data}
            endDate={endDate}
            fullAt={8}
            unit="completed visit"
            unitPlural="completed visits"
          />
          {(older > 0 || unreadable > 0) && (
            <p className="mt-4 text-[13px] text-[#4B5563]">
              {older > 0 && `${older} older completed ${older === 1 ? "visit is" : "visits are"} outside the one-year view. `}
              {unreadable > 0 && `${unreadable} completed ${unreadable === 1 ? "visit has" : "visits have"} no readable date.`}
            </p>
          )}
        </>
      )}
    </section>
  );
}