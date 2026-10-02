import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getClinicCatalog, getAppointments } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Alert from "../components/Alert";
import ServiceCard from "../components/ServiceCard";

const localDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Customer overview: greeting, upcoming visits, and the clinic's services
export default function BrowseServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getClinicCatalog(), getAppointments(user.id)])
      .then(([catalog, appts]) => { setServices(catalog.services); setAppointments(appts); })
      .catch(() => setError("Couldn't load your overview. Refresh to try again."));
  }, [user.id]);

  const upcoming = (appointments || []).filter((a) => ["Pending", "Scheduled"].includes(a.status) && a.date >= localDate());

  return (
    <section className="mx-auto max-w-[1376px] px-8 py-8">
      <h1>Good to see you, {user.name.split(" ")[0]}.</h1>
      <p>Keep every check-up, vaccine, and tail wag on track.</p>
      <Link to="/book">Book a visit</Link>
      <Alert>{error}</Alert>

      <h2>Your pet's schedule</h2>
      {!appointments ? <p>Loading your visits…</p> : upcoming.length === 0 ? (
        <p>Nothing on the calendar yet. <Link to="/book">Schedule a visit</Link></p>
      ) : (
        <ul className="grid gap-2">
          {upcoming.slice(0, 4).map((a) => (
            <li key={a.id} className="flex gap-4">
              <span><strong>{a.petName}</strong> ({a.species}) · {a.service} · {a.date} {a.time} · with {a.vet}</span>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
      <Link to="/my-appointments">View all appointments</Link>

      <h2>Our services</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <ServiceCard key={s} name={s} index={i} />
        ))}
      </div>
    </section>
  );
}