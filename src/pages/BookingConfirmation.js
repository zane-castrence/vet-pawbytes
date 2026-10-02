<<<<<<< HEAD
export default function BookingConfirmation() {
  return <div>Booking Confirmation</div>;
}
=======
import { Link, Navigate, useLocation } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";

export default function BookingConfirmation() {
  const { state } = useLocation();
  const a = state?.appointment;
  if (!a) return <Navigate to="/services" replace />;

  return (
    <section>
      <h1>Request sent</h1>
      <p>The clinic will review your request. <StatusBadge status={a.status} /></p>
      <dl>
        <dt>Pet</dt><dd>{a.petName} ({a.species})</dd>
        <dt>Service</dt><dd>{a.service}</dd>
        <dt>Veterinarian</dt><dd>{a.vet}</dd>
        <dt>When</dt><dd>{a.date} at {a.time}</dd>
        {a.notes && <><dt>Notes</dt><dd>{a.notes}</dd></>}
      </dl>
      <Link to="/my-appointments">View my appointments</Link>
    </section>
  );
}
>>>>>>> origin/arsi
