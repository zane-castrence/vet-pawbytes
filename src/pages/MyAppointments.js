<<<<<<< HEAD
export default function MyAppointments() {
  return <div>My Appointments</div>;
}
=======
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAppointments, updateAppointment, deleteAppointment } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";

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

  return (
    <section>
      <h1>My appointments</h1>
      <Alert>{error}</Alert>
      <Alert type="success">{message}</Alert>
      <select aria-label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}>
        {["All", "Pending", "Scheduled", "Completed", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
      </select>
      {loading ? <p>Loading…</p> : visible.length === 0 ? <p>No appointments to show.</p> : (
        <ul className="grid gap-2">
          {visible.map((a) => (
            <li key={a.id} className="flex gap-4">
              <span>{a.petName} · {a.service} · {a.vet} · {a.date} {a.time}</span>
              <StatusBadge status={a.status} />
              {["Pending", "Scheduled"].includes(a.status) && <button onClick={() => cancel(a)}>Cancel</button>}
              {["Completed", "Cancelled"].includes(a.status) && <button onClick={() => remove(a)}>Delete</button>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
>>>>>>> origin/arsi
