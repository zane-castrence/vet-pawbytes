<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
>>>>>>> origin/arsi
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BrowseServices from "./pages/BrowseServices";
import BookAppointment from "./pages/BookAppointment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyAppointments from "./pages/MyAppointments";
<<<<<<< HEAD
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/services" element={<BrowseServices />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/confirmation" element={<BookingConfirmation />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
=======
import MyPets from "./pages/MyPets";
import AdminDashboard from "./pages/AdminDashboard";

const customer = (page) => <ProtectedRoute role="customer">{page}</ProtectedRoute>;

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/services" element={customer(<BrowseServices />)} />
          <Route path="/book" element={customer(<BookAppointment />)} />
          <Route path="/confirmation" element={customer(<BookingConfirmation />)} />
          <Route path="/my-appointments" element={customer(<MyAppointments />)} />
          <Route path="/my-pets" element={customer(<MyPets />)} />
          <Route path="/admin" element={<ProtectedRoute role={["admin", "staff", "veterinarian"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
>>>>>>> origin/arsi
    </Router>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> origin/arsi
