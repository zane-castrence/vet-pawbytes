import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAppointments, updateAppointment, deleteAppointment } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";
import DataTable from "../components/ui/data-table";
import { Button, Segmented, PageHeader, buttonClass, PAGE_CLASS, ALERT_ERROR, ALERT_SUCCESS } from "../components/ui/app-controls";
import { formatDate } from "../utils/format";

const FILTERS = ["All", "Pending", "Scheduled", "Completed", "Cancelled"];

export default function MyAppointments() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  const load = async () => {
    try { setItems(await getAppointments(user.id)); setError(""); }
    catch { setError("Couldn't load appointments. Refresh to try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = async (a) => {
    if (!window.confirm(`Cancel ${a.petName}'s appointment on ${a.date}?`)) return;
    try { await updateAppointment(a.id, { ...a, status: "Cancelled" }); setMessage("Appointment cancelled."); load(); }
    catch (err) { setError(err.message); }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete this record for ${a.petName}?`)) return;
    try { await deleteAppointment(a.id); setMessage("Appointment deleted."); load(); }
    catch (err) { setError(err.message); }
  };

  const visible = items.filter((a) => filter === "All" || a.status === filter);
  const options = FILTERS.map((s) => ({
    id: s,
    label: s,
    count: s === "All" ? items.length : items.filter((a) => a.status === s).length,
  }));

  const columns = [
    {
      key: "pet",
      label: "Pet",
      render: (a) => (
        <>
          <p className="font-bold">{a.petName}</p>
          {a.species && <p className="text-[13px] text-[#4B5563]">{a.species}</p>}
        </>
      ),
    },
    { key: "service", label: "Service" },
    { key: "vet", label: "Veterinarian" },
    {
      key: "when",
      label: "Date & time",
      render: (a) => (
        <>
          <p className="font-semibold">{formatDate(a.date)}</p>
          <p className="text-[13px] text-[#4B5563]">{a.time}</p>
        </>
      ),
    },
    { key: "status", label: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (a) => (
        <>
          {["Pending", "Scheduled"].includes(a.status) && <Button variant="danger" size="sm" onClick={() => cancel(a)}>Cancel</Button>}
          {["Completed", "Cancelled"].includes(a.status) && <Button variant="danger" size="sm" onClick={() => remove(a)}>Delete</Button>}
        </>
      ),
    },
  ];

  return (
    <section className={PAGE_CLASS}>
      <PageHeader
        title="My appointments"
        subtitle="Every visit for your pets, past and upcoming."
        actions={<Link to="/book" className={buttonClass("primary")}>Book a visit</Link>}
      />
      <Alert className={ALERT_ERROR}>{error}</Alert>
      <Alert type="success" className={ALERT_SUCCESS}>{message}</Alert>

      <Segmented label="Filter by status" options={options} value={filter} onChange={setFilter} />

      <div className="mt-5">
        {loading ? (
          <p className="text-[15px] text-[#4B5563]">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-[20px] border-2 border-dashed border-[#2A3BD9]/30 bg-[#EEF2FF] p-6 text-[15px] text-[#4B5563]">
            No appointments yet.{" "}
            <Link to="/book" className="font-semibold text-[#2A3BD9] underline underline-offset-2">Schedule a visit</Link>
          </div>
        ) : (
          <DataTable columns={columns} rows={visible} empty="No appointments match this filter." />
        )}
      </div>
    </section>
  );
}