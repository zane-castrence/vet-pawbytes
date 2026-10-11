import { useCallback, useEffect, useMemo, useState } from "react";
import ContributionSkyline from "../components/ui/contribution-skyline";
import { getAllAppointments } from "../services/api";
import {
  ALERT_ERROR,
  PAGE_CLASS,
  PageHeader,
} from "../components/ui/app-controls";

const normalizeStatus = (appointment) =>
  String(
    appointment.status ||
      appointment.state ||
      appointment.progress ||
      "",
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const isCompleted = (appointment) =>
  appointment.completed === true ||
  appointment.isCompleted === true ||
  [
    "completed",
    "complete",
    "done",
    "finished",
    "completevisit",
  ].includes(normalizeStatus(appointment));

export default function AdminStats() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await getAllAppointments();

      setAppointments(Array.isArray(result) ? result : []);
      setError("");
    } catch {
      setError("Couldn't load completed visit statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const interval = window.setInterval(load, 3000);

    const handleFocus = () => load();

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [load]);

  const completedVisits = useMemo(
    () =>
      appointments
        .filter(isCompleted)
        .filter((appointment) => appointment.date)
        .map((appointment) => ({
          date: appointment.date,
          count: 1,
        })),
    [appointments],
  );

  return (
    <section className={PAGE_CLASS}>
      <PageHeader
        title="Stats"
        subtitle="Track completed clinic visits across the last year."
      />

      {error && <p className={ALERT_ERROR}>{error}</p>}

      {loading ? (
        <p className="mt-6 text-[15px] text-[#4B5563]">
          Loading statistics…
        </p>
      ) : (
        <div className="mt-6">
          <ContributionSkyline
            data={completedVisits}
            title={`${completedVisits.length.toLocaleString()} completed visits in the last year`}
            unit="completed visit"
            unitPlural="completed visits"
          />
        </div>
      )}
    </section>
  );
}