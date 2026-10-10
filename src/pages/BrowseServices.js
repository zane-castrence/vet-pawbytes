import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getClinicCatalog, getAppointments } from "../services/api";
import Alert from "../components/Alert";
import ServiceCard from "../components/ServiceCard";
import AnimatedBanner from "../components/ui/animated-banner";
import AppointmentCard from "../components/ui/appointment-card";

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
  const next = upcoming[0];

  return (
    <section className="mx-auto max-w-[1376px] px-4 py-6 font-figtree sm:px-8 sm:py-8">
      <AnimatedBanner
        title={`Good to see you, ${user.name.split(" ")[0]}.`}
        subtitle={
          next
            ? `Next up: ${next.petName}, ${next.service}, ${next.date} at ${next.time}.`
            : "Keep every check-up, vaccine, and tail wag on track."
        }
        deadline={next ? `${next.date}T${next.time}` : undefined}
        deadlineLabel="Next visit in"
        ctaLabel="Book a visit"
        href="/book"
      />
      <Alert className="mt-4 rounded-lg bg-[#FEE2E2] px-4 py-3 text-[14px] font-medium text-[#991B1B]">{error}</Alert>

      <h2 className="mt-10 text-[28px] font-extrabold tracking-tight text-[#1F2937]">Your pet's schedule</h2>
      {!appointments ? (
        <p className="mt-4 text-[15px] text-[#4B5563]">Loading your visits…</p>
      ) : upcoming.length === 0 ? (
        <div className="mt-4 rounded-[20px] border-2 border-dashed border-[#2A3BD9]/30 bg-[#EEF2FF] p-6 text-[15px] text-[#4B5563]">
          Nothing on the calendar yet.{" "}
          <Link to="/book" className="font-semibold text-[#2A3BD9] underline underline-offset-2">Schedule a visit</Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.slice(0, 4).map((a, i) => (
            <AppointmentCard key={a.id} appointment={a} index={i} />
          ))}
        </div>
      )}
      <Link to="/my-appointments" className="mt-4 inline-block text-[14px] font-semibold text-[#2A3BD9] underline underline-offset-2">
        View all appointments
      </Link>

      <h2 className="mt-10 text-[28px] font-extrabold tracking-tight text-[#1F2937]">Our services</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s, i) => (
          <ServiceCard key={s} name={s} index={i} />
        ))}
      </div>
    </section>
  );
}