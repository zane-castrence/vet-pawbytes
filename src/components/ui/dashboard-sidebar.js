import { Link, NavLink } from "react-router-dom";
import { CalendarDays, LayoutDashboard, LayoutGrid, PawPrint, Plus } from "lucide-react";
import AccountMenu from "../AccountMenu";

const CUSTOMER_LINKS = [
  { to: "/services", label: "Services", icon: LayoutGrid },
  { to: "/my-pets", label: "My pets", icon: PawPrint },
  { to: "/my-appointments", label: "My appointments", icon: CalendarDays },
];

const STAFF_LINKS = [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }];

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1]";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${FOCUS} ${
    isActive
      ? "bg-[#E0F2FE] text-[#075985]"
      : "text-[#4B5563] hover:bg-white hover:text-[#1F2937]"
  }`;

export default function SidebarNav({ user, onLogout }) {
  const isCustomer = user?.role === "customer";
  const links = isCustomer ? CUSTOMER_LINKS : STAFF_LINKS;

  return (
    <div className="flex h-full w-[260px] flex-col p-3 font-figtree">
      <div className="mb-4 px-2 pt-2">
        <span className="text-[18px] font-extrabold tracking-tight text-[#075985]">
          PawBytes
        </span>
      </div>

      {isCustomer && (
        <Link
          to="/book"
          className={`mb-4 flex items-center justify-center gap-2 rounded-lg bg-[#047857] px-3 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#059669] ${FOCUS}`}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Book appointment
        </Link>
      )}

      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#D8DEE3] pt-3">
        <AccountMenu user={user} onLogout={onLogout} variant="row" />
      </div>
    </div>
  );
}