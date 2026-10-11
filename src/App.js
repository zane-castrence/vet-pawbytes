import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BrowseServices from "./pages/BrowseServices";
import BookAppointment from "./pages/BookAppointment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyAppointments from "./pages/MyAppointments";
import MyPets from "./pages/MyPets";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStats from "./pages/AdminStats";
import Settings from "./pages/Settings";
import Credits from "./pages/Credits";

const customer = (page) => (
  <ProtectedRoute role="customer">{page}</ProtectedRoute>
);

const clinicTeam = (page) => (
  <ProtectedRoute role={["admin", "staff", "veterinarian"]}>
    {page}
  </ProtectedRoute>
);

const adminOnly = (page) => (
  <ProtectedRoute role="admin">{page}</ProtectedRoute>
);

function App() {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/services" element={customer(<BrowseServices />)} />
          <Route path="/book" element={customer(<BookAppointment />)} />
          <Route
            path="/confirmation"
            element={customer(<BookingConfirmation />)}
          />
          <Route
            path="/my-appointments"
            element={customer(<MyAppointments />)}
          />
          <Route path="/my-pets" element={customer(<MyPets />)} />

          <Route path="/admin" element={clinicTeam(<AdminDashboard />)} />
          <Route path="/admin/stats" element={adminOnly(<AdminStats />)} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default App;