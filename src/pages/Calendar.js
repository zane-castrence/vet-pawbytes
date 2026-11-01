import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAppointments, getAllAppointments } from "../services/api";
import Alert from "../components/Alert";
import VisualizeBooking from "../components/ui/visualize-booking";
import { PageHeader, buttonClass, PAGE_CLASS, ALERT_ERROR } from "../components/ui/app-controls";

export default function Calendar() {
  const { user } = useAuth();
  const isCustomer = user.role === "customer";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const rows = isCustomer ? await getAppointments(user.id) : await getAllAppointments();
        if (live) { setItems(rows); setError(""); }
      } catch {
        if (live) setError("Couldn't load the calendar. Refresh to try again.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [isCustomer, user.id]);

  return (
    <div className={PAGE_CLASS}>
      <PageHeader
        title="Calendar"
        subtitle={isCustomer ? "Your visits by day." : "All clinic appointments by day."}
        actions={
          isCustomer && (
            <Link to="/book" className={buttonClass("primary")}>
              Book appointment
            </Link>
          )
        }
      />
      {error && <Alert className={ALERT_ERROR}>{error}</Alert>}
      {loading ? (
        <p className="text-[14px] text-[#4B5563]">Loading calendar...</p>
      ) : (
        <VisualizeBooking appointments={items} showOwner={!isCustomer} />
      )}
    </div>
  );
}
