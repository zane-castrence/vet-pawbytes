import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  deleteAppointment, deletePet, getArchive, setAppointmentArchived, setPetArchived
} from "../services/api";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import DataTable from "../components/ui/data-table";
import { useToast } from "../components/ui/alert-stack";
import {
  Button, Segmented, PageHeader, PAGE_CLASS, ALERT_ERROR
} from "../components/ui/app-controls";
import { formatDate } from "../utils/format";
import { formatTimeRange } from "../utils/time";

const archivedOn = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "";

export default function Archive() {
  const { user } = useAuth();
  const toast = useToast();
  const isCustomer = user.role === "customer";
  const canDelete = isCustomer || user.role === "admin";

  const [data, setData] = useState({ appointments: [], pets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("appointments");

  const load = async () => {
    try { setData(await getArchive()); setError(""); }
    catch { setError("Couldn't load the archive. Refresh to try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs an action, shows a success/error message, then reloads the archive
  const run = async (action, success, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    try { await action(); toast.success(success); await load(); }
    catch (err) { toast.error(err.message || "Something went wrong. Please try again."); }
  };

  const actions = (restore, remove) => (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button size="sm" variant="secondary" onClick={restore}>Restore</Button>
      {canDelete && (
        <Button size="icon" variant="danger" aria-label="Delete permanently" onClick={remove}>
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      )}
    </div>
  );

  const appointmentColumns = [
    {
      key: "pet", label: "Pet",
      render: (a) => (<><p className="font-bold">{a.petName}</p>{a.species && <p className="text-[13px] text-[#4B5563]">{a.species}</p>}</>)
    },
    ...(isCustomer ? [] : [{ key: "ownerName", label: "Customer", className: "font-semibold" }]),
    { key: "service", label: "Service" },
    { key: "vet", label: "Veterinarian" },
    {
      key: "when", label: "Date & time",
      render: (a) => (<><p className="font-semibold">{formatDate(a.date)}</p><p className="text-[13px] text-[#4B5563]">{formatTimeRange(a)}</p></>)
    },
    { key: "status", label: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "archivedAt", label: "Archived", className: "text-[#4B5563]", render: (a) => archivedOn(a.archivedAt) },
    {
      key: "actions", label: "", className: "text-right",
      render: (a) => actions(
        () => run(() => setAppointmentArchived(a.id, false), "Appointment restored to the active list."),
        () => run(() => deleteAppointment(a.id), "Appointment deleted permanently.", `Permanently delete ${a.petName}'s appointment on ${a.date}? This cannot be undone.`)
      )
    }
  ];

  const petColumns = [
    {
      key: "pet", label: "Pet",
      render: (p) => (<><p className="font-bold">{p.name}</p><p className="text-[13px] text-[#4B5563]">{[p.species, p.breed].filter(Boolean).join(" · ")}</p></>)
    },
    { key: "vaccinationStatus", label: "Vaccination" },
    { key: "archivedAt", label: "Archived", className: "text-[#4B5563]", render: (p) => archivedOn(p.archivedAt) },
    {
      key: "actions", label: "", className: "text-right",
      render: (p) => actions(
        () => run(() => setPetArchived(p.id, false), `${p.name} restored to My pets.`),
        () => run(() => deletePet(user.id, p.id), "Pet deleted permanently.", `Permanently delete ${p.name}'s profile? This cannot be undone.`)
      )
    }
  ];

  const showPets = isCustomer && tab === "pets";
  const options = [
    { id: "appointments", label: "Appointments", count: data.appointments.length },
    { id: "pets", label: "Pets", count: data.pets.length }
  ];

  return (
    <section className={PAGE_CLASS}>
      <PageHeader
        title="Archive"
        subtitle={isCustomer
          ? "Finished visits and pet profiles you put away. Restore them any time."
          : "Completed and cancelled appointments moved out of the active schedule. Stats still count archived visits."}
      />
      <Alert className={ALERT_ERROR}>{error}</Alert>

      {isCustomer && <Segmented label="Archived records" options={options} value={tab} onChange={setTab} />}

      <div className="mt-5">
        {loading ? (
          <p className="text-[15px] text-[#4B5563]">Loading…</p>
        ) : showPets ? (
          <DataTable columns={petColumns} rows={data.pets} empty="No archived pets. Archive a pet from its Edit window." />
        ) : (
          <DataTable columns={appointmentColumns} rows={data.appointments} empty="No archived appointments yet." />
        )}
      </div>
    </section>
  );
}
