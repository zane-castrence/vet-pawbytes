import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isCustomer = user?.role === "customer";

  return (
    <header>
      <nav className="flex gap-4">
        <Link to="/">PawBytes</Link>
        <Link to="/credits">Credits</Link>
        {!user && <Link to="/login">Log in</Link>}
        {!user && <Link to="/signup">Sign up</Link>}
        {isCustomer && <Link to="/services">Services</Link>}
        {isCustomer && <Link to="/book">Book</Link>}
        {isCustomer && <Link to="/my-pets">My pets</Link>}
        {isCustomer && <Link to="/my-appointments">My appointments</Link>}
        {user && !isCustomer && <Link to="/admin">Dashboard</Link>}
        {user && <button onClick={() => { logout(); navigate("/login"); }}>Log out ({user.name})</button>}
      </nav>
    </header>
  );
}
