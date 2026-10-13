import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AppointmentForm, { STATUSES } from "../components/AppointmentForm";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import DataTable from "../components/ui/data-table";
import {
  Button, Card, Pill, SearchInput, Segmented, StatTile, PageHeader,
  PAGE_CLASS, H2_CLASS, INPUT_CLASS, ALERT_ERROR, ALERT_SUCCESS
} from "../components/ui/app-controls";
import { formatDate } from "../utils/format";
import { formatTimeRange } from "../utils/time";
import {
  addClinicCatalogItem, createAppointment, createTeamAccount, deleteAppointment, deleteCustomer,
  getAllAppointments, getClinicCatalog, getClinicTeamAvailability, getCustomers,
  removeClinicCatalogItem, setCustomerActive, setCustomerRole, setTeamAvailability, updateAppointment
} from "../services/api";

const localDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const isTeam = (c) => c.role === "staff" || c.role === "veterinarian";
const emptyStaff = { name: "", email: "", password: "", role: "staff" };

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [team, setTeam] = useState([]);
  const [catalog, setCatalog] = useState({ services: [], vets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState(isAdmin ? "overview" : "requests");
  const [accountSection, setAccountSection] = useState("customers");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [bookingCustomerId, setBookingCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [accountSearch, setAccountSearch] = useState("");
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [catalogInputs, setCatalogInputs] = useState({ services: "", vets: "" });

  const tabs = isAdmin
    ? [["overview", "Overview"], ["requests", "Approval requests"], ["appointments", "Appointments"], ["customers", "Manage accounts"], ["clinic", "Clinic setup"]]
    : [["requests", "Approval requests"], ["appointments", "Schedule"]];

  const load = async () => {
    try {
      const [appts, people, cat, teamList] = await Promise.all([
        getAllAppointments(),
        isAdmin ? getCustomers() : [],
        isAdmin ? getClinicCatalog() : { services: [], vets: [] },
        getClinicTeamAvailability()
      ]);
      setAppointments(appts); setCustomers(people); setCatalog(cat); setTeam(teamList);
      setError("");
    } catch { setError("Couldn't load the workspace. Please try again."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    // auto-refresh appointments every 15 seconds so new requests show up
    const timer = setInterval(() => getAllAppointments().then(setAppointments).catch(() => {}), 15000);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Runs an action, shows a success/error message, then reloads everything
  const run = async (action, success, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setError(""); setMessage("");
    try { await action(); setMessage(success); await load(); }
    catch (err) { setError(err.message || "Something went wrong. Please try again."); }
  };

  const today = localDate();
  const active = (a) => ["Pending", "Scheduled"].includes(a.status);
  const pending = appointments.filter((a) => a.status === "Pending");
  const confirmed = appointments.filter((a) => a.status === "Scheduled" && a.date >= today);
  const todays = appointments.filter((a) => active(a) && a.date === today);
  const customerAccounts = customers.filter((c) => !isTeam(c));
  const staffAccounts = customers.filter(isTeam);
  const ownAvailable = team.find((m) => m.id === user.id)?.available ?? true;

  const q = search.trim().toLowerCase();
  const visibleAppointments = appointments.filter((a) =>
    (statusFilter === "All" || a.status === statusFilter) &&
    (!q || [a.petName, a.ownerName, a.service, a.vet].some((v) => (v || "").toLowerCase().includes(q)))
  );
  const aq = accountSearch.trim().toLowerCase();
  const matchAccount = (c) => `${c.name} ${c.email}`.toLowerCase().includes(aq);
  const countFor = (id) => appointments.filter((a) => a.userId === id).length;

  const setStatus = (a, status) => run(
    () => updateAppointment(a.id, { ...a, status }),
    status === "Scheduled" ? "Appointment approved and confirmed."
      : status === "Completed" ? "Visit marked as completed."
      : "Appointment request declined."
  );

  const saveAppointment = async (data) => {
    if (editing) await updateAppointment(editing.id, data);
    else if (bookingCustomerId) await createAppointment(bookingCustomerId, data);
    else throw new Error("Choose a customer account for this appointment.");
    setMessage(editing ? "Appointment updated." : "Appointment booked for customer.");
    setEditing(null); setCreating(false); setBookingCustomerId("");
    await load();
  };

  const toggleStaffRole = (c) => run(
    () => setCustomerRole(c.id, isTeam(c) ? "customer" : "staff"),
    `Clinic access updated. ${c.name} must sign in again for the change to take effect.`
  );

  const addStaff = (e) => {
    e.preventDefault();
    run(async () => { await createTeamAccount(user.id, staffForm); setStaffForm(emptyStaff); setCreatingStaff(false); }, "Clinic account created.");
  };

  const addCatalog = (e, type) => {
    e.preventDefault();
    run(async () => { await addClinicCatalogItem(type, catalogInputs[type]); setCatalogInputs({ ...catalogInputs, [type]: "" }); }, "Added.");
  };

  const closeBooking = () => { setCreating(false); setBookingCustomerId(""); };

  // ---------- tables ----------
  const appointmentColumns = [
    {
      key: "pet", label: "Pet",
      render: (a) => (<><p className="font-bold">{a.petName}</p>{a.species && <p className="text-[13px] text-[#4B5563]">{a.species}</p>}</>)
    },
    {
      key: "customer", label: "Customer",
      render: (a) => (
        <>
          <p className="font-semibold">{a.ownerName}</p>
          {isAdmin && <p className="text-[13px] text-[#4B5563]">{customers.find((c) => c.id === a.userId)?.email || "account unavailable"}</p>}
        </>
      )
    },
    { key: "service", label: "Service" },
    { key: "vet", label: "Veterinarian" },
    {
      key: "when", label: "Date & time",
      render: (a) => (<><p className="font-semibold">{formatDate(a.date)}</p><p className="text-[13px] text-[#4B5563]">{formatTimeRange(a)}</p></>)
    },
    { key: "status", label: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions", label: "", className: "text-right",
      render: (a) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {a.status === "Pending" && (
            <>
              <Button size="sm" onClick={() => setStatus(a, "Scheduled")}>Approve</Button>
              <Button size="sm" variant="danger" onClick={() => setStatus(a, "Cancelled")}>Decline</Button>
            </>
          )}
          {a.status === "Scheduled" && <Button size="sm" variant="secondary" onClick={() => setStatus(a, "Completed")}>Complete visit</Button>}
          {isAdmin && (
            <>
              <Button size="icon" variant="secondary" aria-label={`Edit ${a.petName}'s appointment`} onClick={() => { setEditing(a); setCreating(false); }}>
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </Button>
              <Button size="icon" variant="danger" aria-label={`Delete ${a.petName}'s appointment`}
                onClick={() => run(() => deleteAppointment(a.id), "Appointment deleted.", `Delete ${a.petName}'s appointment on ${a.date}?`)}>
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const accountStatus = (c) => <Pill tone={c.active ? "green" : "gray"}>{c.active ? "Active" : "Paused"}</Pill>;
  const nameCell = (c) => <p className="font-bold">{c.name}</p>;

  const customerColumns = [
    { key: "name", label: "Name", render: nameCell },
    { key: "email", label: "Email", className: "text-[#4B5563]" },
    { key: "status", label: "Status", render: accountStatus },
    { key: "count", label: "Appointments", render: (c) => countFor(c.id) },
    {
      key: "actions", label: "", className: "text-right",
      render: (c) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => toggleStaffRole(c)}>Make staff</Button>
          <Button size="sm" variant="secondary" onClick={() => run(() => setCustomerActive(c.id, !c.active), `Account ${c.active ? "paused" : "restored"}.`)}>
            {c.active ? "Pause account" : "Restore account"}
          </Button>
          <Button size="icon" variant="danger" aria-label={`Delete ${c.name}`}
            onClick={() => run(() => deleteCustomer(c.id), "Customer account and appointments deleted.", `Delete ${c.name}'s account and all associated appointments? This cannot be undone.`)}>
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </div>
      )
    }
  ];

  const staffColumns = [
    { key: "name", label: "Name", render: nameCell },
    { key: "email", label: "Email", className: "text-[#4B5563]" },
    { key: "role", label: "Role", className: "capitalize" },
    { key: "status", label: "Access", render: accountStatus },
    {
      key: "available", label: "Availability",
      render: (s) => { const on = s.active && s.isAvailable; return <Pill tone={on ? "blue" : "gray"}>{on ? "Available" : "Unavailable"}</Pill>; }
    },
    { key: "count", label: "Appointments", render: (s) => countFor(s.id) },
    {
      key: "actions", label: "", className: "text-right",
      render: (s) => {
        const on = s.active && s.isAvailable;
        return (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Button size="sm" variant="secondary" disabled={!s.active}
              onClick={() => run(() => setTeamAvailability(user.id, s.id, !s.isAvailable), `${s.name} availability updated.`)}>
              {on ? "Set unavailable" : "Mark available"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => run(() => setCustomerActive(s.id, !s.active), `Account ${s.active ? "paused" : "restored"}.`)}>
              {s.active ? "Pause access" : "Restore access"}
            </Button>
            <Button size="sm" variant="danger" onClick={() => toggleStaffRole(s)}>Remove clinic role</Button>
          </div>
        );
      }
    }
  ];

  const tabOptions = tabs.map(([id, label]) => ({ id, label, count: id === "requests" && pending.length > 0 ? pending.length : undefined }));
  const title = isAdmin ? "Admin workspace" : user.role === "veterinarian" ? "Veterinarian workspace" : "Staff workspace";

  return (
    <section className={PAGE_CLASS}>
      <PageHeader
        title={title}
        subtitle={isAdmin ? "Keep appointments, customer accounts, and clinic options up to date." : "Review customer appointment requests and manage the clinic schedule."}
        actions={
          <div className="flex items-center gap-3 rounded-[20px] border border-[#D8DEE3] bg-white py-2 pl-4 pr-2">
            <span className={`h-2.5 w-2.5 rounded-full ${ownAvailable ? "bg-[#059669]" : "bg-[#9CA3AF]"}`} aria-hidden="true" />
            <span className="text-[14px] font-semibold text-[#1F2937]">{ownAvailable ? "Available to customers" : "Marked unavailable"}</span>
            <Button size="sm" variant="secondary"
              onClick={() => run(() => setTeamAvailability(user.id, user.id, !ownAvailable), "Your availability was updated.")}>
              {ownAvailable ? "Set unavailable" : "Set available"}
            </Button>
          </div>
        }
      />

      <Alert className={ALERT_ERROR}>{error}</Alert>
      <Alert type="success" className={ALERT_SUCCESS}>{message}</Alert>

      <Segmented label="Workspace sections" options={tabOptions} value={tab}
        onChange={(id) => { setTab(id); setEditing(null); setCreating(false); }} />

      {/* edit + book windows */}
      {isAdmin && editing && (
        <Modal wide title="Edit appointment" subtitle={`${editing.petName} · ${editing.ownerName}`} onClose={() => setEditing(null)}>
          <AppointmentForm key={editing.id} initial={editing} canManageStatus onSubmit={saveAppointment} onCancel={() => setEditing(null)} />
        </Modal>
      )}
      {isAdmin && creating && (
        <Modal wide title="Book for customer" subtitle="Pick a customer account, then fill in the visit." onClose={closeBooking}>
          <div className="mb-5 flex flex-col">
            <label htmlFor="booking-customer" className="mb-1.5 text-[13px] font-medium text-[#374151]">Customer account</label>
            <select id="booking-customer" className={`${INPUT_CLASS} h-11`} value={bookingCustomerId} onChange={(e) => setBookingCustomerId(e.target.value)}>
              <option value="">Select a customer account</option>
              {customerAccounts.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
            </select>
          </div>
          {bookingCustomerId && (
            <AppointmentForm key={bookingCustomerId} initial={{ ownerName: customers.find((c) => c.id === bookingCustomerId)?.name || "" }}
              onSubmit={saveAppointment} onCancel={closeBooking} />
          )}
        </Modal>
      )}

      <div className="mt-6">
        {loading ? <p className="text-[15px] text-[#4B5563]">Loading workspace…</p> : (
          <>
            {/* ===== Approval requests ===== */}
            {tab === "requests" && (
              <div>
                <h2 className={H2_CLASS}>Approval requests ({pending.length})</h2>
                <p className="mb-4 mt-1 text-[15px] text-[#4B5563]">Bookings wait here until a staff member or admin approves or declines them. New requests refresh automatically.</p>
                {pending.length === 0 ? (
                  <div className="rounded-[20px] border-2 border-dashed border-[#2A3BD9]/30 bg-[#EEF2FF] p-6 text-[15px] text-[#4B5563]">
                    You're all caught up. New requests will appear here.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {pending.map((a) => (
                      <Card key={a.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[22px] font-extrabold tracking-tight">{a.petName}</h3>
                            <p className="text-[14px] text-[#4B5563]">{a.ownerName}{a.species ? ` · ${a.species}` : ""}</p>
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                        <dl className="mt-4 grid grid-cols-3 gap-3 text-[14px]">
                          <div><dt className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#4B5563]">Service</dt><dd className="font-semibold">{a.service}</dd></div>
                          <div><dt className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#4B5563]">Vet</dt><dd className="font-semibold">{a.vet}</dd></div>
                          <div><dt className="text-[12px] font-semibold uppercase tracking-[0.4px] text-[#4B5563]">Requested</dt><dd className="font-semibold">{formatDate(a.date)}, {formatTimeRange(a)}</dd></div>
                        </dl>
                        {a.notes && <p className="mt-4 rounded-[8px] bg-[#F9FAFB] px-3 py-2 text-[14px] text-[#4B5563]"><span className="font-semibold text-[#1F2937]">Notes: </span>{a.notes}</p>}
                        <div className="mt-5 flex flex-wrap gap-2">
                          {!isAdmin && a.userId === user.id ? (
                            <p className="text-[14px] text-[#4B5563]">This is your own booking request. Another staff member or an admin must review it.</p>
                          ) : (
                            <>
                              <Button onClick={() => setStatus(a, "Scheduled")}><Check className="h-4 w-4" strokeWidth={2} />Approve</Button>
                              <Button variant="danger" onClick={() => setStatus(a, "Cancelled")}><X className="h-4 w-4" strokeWidth={2} />Decline</Button>
                            </>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== Overview + Appointments ===== */}
            {(tab === "overview" || tab === "appointments") && (
              <div>
                {tab === "overview" && (
                  <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatTile highlight label="Pending approval" value={pending.length} hint="Requests needing review" />
                    <StatTile label="Confirmed visits" value={confirmed.length} hint="Upcoming appointments" />
                    <StatTile label="Today's visits" value={todays.length} hint={today} />
                    <StatTile label="Customer accounts" value={customerAccounts.length} hint={`${customerAccounts.filter((c) => !c.active).length} paused`} />
                    <StatTile label="Clinic team" value={staffAccounts.filter((s) => s.active).length} hint={`${staffAccounts.filter((s) => !s.active).length} paused, ${staffAccounts.length} total`} />
                  </div>
                )}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className={H2_CLASS}>
                    {tab === "overview" ? "Recent appointments" : "All appointments"}
                    <span className="ml-2 text-[15px] font-semibold text-[#4B5563]">{visibleAppointments.length} total</span>
                  </h2>
                  {tab === "overview"
                    ? <Button variant="secondary" onClick={() => setTab("appointments")}>Manage appointments</Button>
                    : isAdmin && <Button onClick={() => { setCreating(true); setBookingCustomerId(""); }}><Plus className="h-4 w-4" strokeWidth={2} />Book for customer</Button>}
                </div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <SearchInput label="Search appointments" placeholder="Search pet, owner, service, or vet" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <select aria-label="Filter by status" className={INPUT_CLASS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    {["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <DataTable columns={appointmentColumns} rows={tab === "overview" ? visibleAppointments.slice(0, 6) : visibleAppointments}
                  empty="No appointments match these filters." />
              </div>
            )}

            {/* ===== Manage accounts (admin) ===== */}
            {isAdmin && tab === "customers" && (
              <div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Segmented label="Account type" value={accountSection}
                    onChange={(id) => { setAccountSection(id); setCreatingStaff(false); }}
                    options={[{ id: "customers", label: "Customers", count: customerAccounts.length }, { id: "staff", label: "Clinic team", count: staffAccounts.length }]} />
                  {accountSection === "staff" && (
                    <Button onClick={() => setCreatingStaff(!creatingStaff)}>
                      {creatingStaff ? <><X className="h-4 w-4" strokeWidth={2} />Close form</> : <><Plus className="h-4 w-4" strokeWidth={2} />Create clinic account</>}
                    </Button>
                  )}
                </div>

                {accountSection === "staff" && creatingStaff && (
                  <Card className="mb-4">
                    <form onSubmit={addStaff} className="grid gap-4 sm:grid-cols-2">
                      <h3 className="text-[18px] font-extrabold sm:col-span-2">Create a clinic account</h3>
                      <input className={`${INPUT_CLASS} h-11`} aria-label="Full name" placeholder="Full name" required minLength="2" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                      <input className={`${INPUT_CLASS} h-11`} aria-label="Email" type="email" placeholder="Email" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
                      <input className={`${INPUT_CLASS} h-11`} aria-label="Initial password" type="password" placeholder="Initial password (6+ characters)" required minLength="6" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
                      <select className={`${INPUT_CLASS} h-11`} aria-label="Clinic role" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                        <option value="staff">Staff</option><option value="veterinarian">Veterinarian</option>
                      </select>
                      {staffForm.role === "veterinarian" && <p className="text-[13px] text-[#4B5563] sm:col-span-2">This name will also be added to the booking veterinarian options.</p>}
                      <div className="sm:col-span-2"><Button type="submit">Create clinic account</Button></div>
                    </form>
                  </Card>
                )}

                <div className="mb-4">
                  <SearchInput label="Search accounts" placeholder="Search by name or email" value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} />
                </div>

                {accountSection === "staff"
                  ? <DataTable columns={staffColumns} rows={staffAccounts.filter(matchAccount)} empty="No clinic team accounts match." />
                  : <DataTable columns={customerColumns} rows={customerAccounts.filter(matchAccount)} empty="No customer accounts match." />}
              </div>
            )}

            {/* ===== Clinic setup (admin) ===== */}
            {isAdmin && tab === "clinic" && (
              <div>
                <h2 className={H2_CLASS}>Clinic setup</h2>
                <p className="mb-4 mt-1 text-[15px] text-[#4B5563]">Manage the services and veterinarians customers can pick when booking. Keep at least one in each list.</p>
                <div className="grid gap-4 lg:grid-cols-2">
                  {[["services", "Services", "Add a service"], ["vets", "Veterinarians", "Add a veterinarian"]].map(([type, label, placeholder]) => (
                    <Card key={type}>
                      <h3 className="text-[18px] font-extrabold">{label} <span className="text-[#4B5563]">({catalog[type].length})</span></h3>
                      <form onSubmit={(e) => addCatalog(e, type)} className="mt-4 flex gap-2">
                        <input className={`${INPUT_CLASS} min-w-0 flex-1`} aria-label={placeholder} placeholder={placeholder} maxLength="60"
                          value={catalogInputs[type]} onChange={(e) => setCatalogInputs({ ...catalogInputs, [type]: e.target.value })} />
                        <Button type="submit">Add</Button>
                      </form>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {catalog[type].map((v) => (
                          <li key={v} className="flex items-center gap-1 rounded-full bg-[#EEF2FF] py-1 pl-3 pr-1 text-[14px] font-semibold text-[#1F2DB0]">
                            {v}
                            <button type="button" aria-label={`Remove ${v}`} onClick={() => run(() => removeClinicCatalogItem(type, v), "Removed.")}
                              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#DCE5FF]">
                              <X className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}