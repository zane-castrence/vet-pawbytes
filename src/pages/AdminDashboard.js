<<<<<<< HEAD
export default function AdminDashboard() {
  return <div>Admin Dashboard</div>;
=======
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AppointmentForm, { STATUSES } from "../components/AppointmentForm";
import Alert from "../components/Alert";
import StatusBadge from "../components/StatusBadge";
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

  const appointmentRows = (list) => (
    <table>
      <thead><tr><th>Pet</th><th>Customer</th><th>Service</th><th>Veterinarian</th><th>Date &amp; time</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {list.map((a) => (
          <tr key={a.id}>
            <td>{a.petName} ({a.species})</td>
            <td>{a.ownerName}{isAdmin && ` · ${customers.find((c) => c.id === a.userId)?.email || "account unavailable"}`}</td>
            <td>{a.service}</td><td>{a.vet}</td><td>{a.date} {a.time}</td>
            <td><StatusBadge status={a.status} /></td>
            <td className="flex gap-2">
              {a.status === "Pending" && <><button onClick={() => setStatus(a, "Scheduled")}>Approve</button><button onClick={() => setStatus(a, "Cancelled")}>Decline</button></>}
              {a.status === "Scheduled" && <button onClick={() => setStatus(a, "Completed")}>Complete visit</button>}
              {isAdmin && <>
                <button onClick={() => { setEditing(a); setCreating(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                <button onClick={() => run(() => deleteAppointment(a.id), "Appointment deleted.", `Delete ${a.petName}'s appointment on ${a.date}?`)}>Delete</button>
              </>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section>
      <h1>{isAdmin ? "Admin workspace" : user.role === "veterinarian" ? "Veterinarian workspace" : "Staff workspace"}</h1>
      <p>{isAdmin ? "Keep appointments, customer accounts, and clinic options up to date." : "Review customer appointment requests and manage the clinic schedule."}</p>

      <p>
        Your availability: <strong>{ownAvailable ? "Available to customers" : "Marked unavailable"}</strong>{" "}
        <button type="button" onClick={() => run(() => setTeamAvailability(user.id, user.id, !ownAvailable), "Your availability was updated.")}>
          {ownAvailable ? "Set unavailable" : "Set available"}
        </button>
      </p>

      <Alert>{error}</Alert>
      <Alert type="success">{message}</Alert>

      <nav className="flex gap-2">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} onClick={() => { setTab(id); setEditing(null); setCreating(false); }}>
            {label}{id === "requests" && pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        ))}
      </nav>

      {isAdmin && editing && (
        <AppointmentForm key={editing.id} initial={editing} canManageStatus onSubmit={saveAppointment} onCancel={() => setEditing(null)} />
      )}

      {loading ? <p>Loading workspace…</p> : (
        <>
          {isAdmin && creating && (
            <>
              <label htmlFor="booking-customer">Book for customer</label>
              <select id="booking-customer" value={bookingCustomerId} onChange={(e) => setBookingCustomerId(e.target.value)}>
                <option value="">Select a customer account</option>
                {customerAccounts.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}
              </select>
              {bookingCustomerId && (
                <AppointmentForm key={bookingCustomerId} initial={{ ownerName: customers.find((c) => c.id === bookingCustomerId)?.name || "" }}
                  onSubmit={saveAppointment} onCancel={() => { setCreating(false); setBookingCustomerId(""); }} />
              )}
            </>
          )}

          {/* ===== Approval requests ===== */}
          {tab === "requests" && !editing && (
            <div>
              <h2>Appointment approval requests ({pending.length})</h2>
              <p>Customer bookings stay here until a staff member or admin approves or declines them. New requests refresh automatically.</p>
              {pending.length === 0 ? <p>You're all caught up. New requests will appear here.</p> : (
                <ul className="grid gap-2">
                  {pending.map((a) => (
                    <li key={a.id}>
                      <strong>{a.petName}</strong> <StatusBadge status={a.status} /><br />
                      {a.ownerName} · {a.species}<br />
                      Service: {a.service} · Vet: {a.vet} · Requested: {a.date} {a.time}
                      {a.notes && <><br />Customer notes: {a.notes}</>}
                      <div className="flex gap-2">
                        {!isAdmin && a.userId === user.id
                          ? <p>This is your own booking request. Another staff member or an admin must review it.</p>
                          : <><button onClick={() => setStatus(a, "Scheduled")}>Approve appointment</button><button onClick={() => setStatus(a, "Cancelled")}>Decline request</button></>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ===== Overview + Appointments ===== */}
          {(tab === "overview" || tab === "appointments") && !editing && !creating && (
            <div>
              {tab === "overview" && (
                <ul className="grid gap-2">
                  <li>Pending approval: <strong>{pending.length}</strong> (requests needing review)</li>
                  <li>Confirmed visits: <strong>{confirmed.length}</strong> (upcoming appointments)</li>
                  <li>Today's visits: <strong>{todays.length}</strong> ({today})</li>
                  <li>Customer accounts: <strong>{customerAccounts.length}</strong> ({customerAccounts.filter((c) => !c.active).length} paused)</li>
                  <li>Active clinic team: <strong>{staffAccounts.filter((s) => s.active).length}</strong> ({staffAccounts.filter((s) => !s.active).length} paused, {staffAccounts.length} total)</li>
                </ul>
              )}
              <h2>{tab === "overview" ? "Recent appointments" : "All appointments"}</h2>
              <div className="flex gap-2">
                <input aria-label="Search appointments" placeholder="Search pet, owner, service, or vet" value={search} onChange={(e) => setSearch(e.target.value)} />
                <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}
                </select>
                {tab === "overview"
                  ? <button type="button" onClick={() => setTab("appointments")}>Manage appointments →</button>
                  : isAdmin && <button type="button" onClick={() => { setCreating(true); setBookingCustomerId(""); }}>Book for customer</button>}
              </div>
              <p>{visibleAppointments.length} total</p>
              {visibleAppointments.length === 0 ? <p>No appointments match these filters.</p>
                : appointmentRows(tab === "overview" ? visibleAppointments.slice(0, 6) : visibleAppointments)}
            </div>
          )}

          {/* ===== Manage accounts (admin) ===== */}
          {isAdmin && tab === "customers" && (
            <div>
              <h2>Manage accounts</h2>
              <nav className="flex gap-2">
                <button type="button" aria-pressed={accountSection === "customers"} onClick={() => { setAccountSection("customers"); setCreatingStaff(false); }}>Customers ({customerAccounts.length})</button>
                <button type="button" aria-pressed={accountSection === "staff"} onClick={() => setAccountSection("staff")}>Clinic team ({staffAccounts.length})</button>
              </nav>
              {accountSection === "staff" && (
                <button type="button" onClick={() => setCreatingStaff(!creatingStaff)}>{creatingStaff ? "Close form" : "Create clinic account"}</button>
              )}
              {accountSection === "staff" && creatingStaff && (
                <form onSubmit={addStaff} className="grid gap-2">
                  <h3>Create a clinic account</h3>
                  <input aria-label="Full name" placeholder="Full name" required minLength="2" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                  <input aria-label="Email" type="email" placeholder="Email" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
                  <input aria-label="Initial password" type="password" placeholder="Initial password (6+ characters)" required minLength="6" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} />
                  <select aria-label="Clinic role" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}>
                    <option value="staff">Staff</option><option value="veterinarian">Veterinarian</option>
                  </select>
                  {staffForm.role === "veterinarian" && <small>This name will also be added to the booking veterinarian options.</small>}
                  <button>Create clinic account</button>
                </form>
              )}
              <input aria-label="Search accounts" placeholder="Search by name or email" value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} />

              {accountSection === "staff" ? (
                <ul className="grid gap-2">
                  {staffAccounts.filter(matchAccount).length === 0 && <li>No clinic team accounts match.</li>}
                  {staffAccounts.filter(matchAccount).map((s) => {
                    const available = s.active && s.isAvailable;
                    return (
                      <li key={s.id} className="flex gap-4">
                        <span>{s.name} · {s.email} · {s.role} · {s.active ? "Active" : "Paused"} · {available ? "Available" : "Unavailable"} · {countFor(s.id)} appointments</span>
                        <button disabled={!s.active} onClick={() => run(() => setTeamAvailability(user.id, s.id, !s.isAvailable), `${s.name} availability updated.`)}>{available ? "Set unavailable" : "Mark available"}</button>
                        <button onClick={() => run(() => setCustomerActive(s.id, !s.active), `Account ${s.active ? "paused" : "restored"}.`)}>{s.active ? "Pause access" : "Restore access"}</button>
                        <button onClick={() => toggleStaffRole(s)}>Remove clinic role</button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="grid gap-2">
                  {customerAccounts.filter(matchAccount).length === 0 && <li>No customer accounts match.</li>}
                  {customerAccounts.filter(matchAccount).map((c) => (
                    <li key={c.id} className="flex gap-4">
                      <span>{c.name} · {c.email} · {c.active ? "Active" : "Paused"} · {countFor(c.id)} appointments</span>
                      <button onClick={() => toggleStaffRole(c)}>Make staff</button>
                      <button onClick={() => run(() => setCustomerActive(c.id, !c.active), `Account ${c.active ? "paused" : "restored"}.`)}>{c.active ? "Pause account" : "Restore account"}</button>
                      <button onClick={() => run(() => deleteCustomer(c.id), "Customer account and appointments deleted.", `Delete ${c.name}'s account and all associated appointments? This cannot be undone.`)}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ===== Clinic setup (admin) ===== */}
          {isAdmin && tab === "clinic" && (
            <div>
              <h2>Clinic setup</h2>
              <p>Manage the services and veterinarians customers can pick when booking. Keep at least one in each list.</p>
              {[["services", "Services", "Add a service"], ["vets", "Veterinarians", "Add a veterinarian"]].map(([type, label, placeholder]) => (
                <div key={type}>
                  <h3>{label} ({catalog[type].length})</h3>
                  <form onSubmit={(e) => addCatalog(e, type)} className="flex gap-2">
                    <input aria-label={placeholder} placeholder={placeholder} maxLength="60" value={catalogInputs[type]} onChange={(e) => setCatalogInputs({ ...catalogInputs, [type]: e.target.value })} />
                    <button>Add</button>
                  </form>
                  <ul>
                    {catalog[type].map((v) => (
                      <li key={v} className="flex gap-4">{v}<button onClick={() => run(() => removeClinicCatalogItem(type, v), "Removed.")}>Remove</button></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
>>>>>>> origin/arsi
}