import { Link, NavLink } from "react-router-dom";
import {
  Archive,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LayoutGrid,
  PawPrint,
  Plus,
} from "lucide-react";
import AccountMenu from "../AccountMenu";

const CUSTOMER_LINKS = [
  { to: "/services", label: "Services", icon: LayoutGrid },
  { to: "/my-pets", label: "My pets", icon: PawPrint },
  { to: "/my-appointments", label: "My appointments", icon: CalendarDays },
  { to: "/archive", label: "Archive", icon: Archive },
];

const STAFF_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/archive", label: "Archive", icon: Archive },
];

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/stats", label: "Stats", icon: BarChart3 },
  { to: "/archive", label: "Archive", icon: Archive },
];

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9]";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors ${FOCUS} ${
    isActive
      ? "bg-white font-semibold text-[#1F2DB0]"
      : "font-medium text-[#4B5563] hover:bg-white/60 hover:text-[#1F2937]"
  }`;

export default function SidebarNav({ user, onLogout }) {
  const isCustomer = user?.role === "customer";
  const isAdmin = user?.role === "admin";

  const links = isCustomer
    ? CUSTOMER_LINKS
    : isAdmin
      ? ADMIN_LINKS
      : STAFF_LINKS;

  return (
    <div className="flex h-full w-[260px] flex-col p-3 font-figtree">
      <div className="mb-4 px-2 pt-2">
        <span className="text-[18px] font-extrabold tracking-tight text-[#1F2DB0]">
          PawBytes
        </span>
      </div>

      {isCustomer && (
        <Link
          to="/book"
          className={`mb-4 flex items-center justify-center gap-2 rounded-lg bg-[#D6347F] px-3 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE2A70] ${FOCUS}`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Book appointment
        </Link>
      )}

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={linkClass}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#2A3BD9]/15 pt-3">
        <AccountMenu user={user} onLogout={onLogout} variant="row" />
      </div>
    </div>
  );
}