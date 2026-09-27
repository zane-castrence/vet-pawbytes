import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BrowseServices from "./pages/BrowseServices";
import BookAppointment from "./pages/BookAppointment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyAppointments from "./pages/MyAppointments";
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
    </Router>
  );
}

export default App;