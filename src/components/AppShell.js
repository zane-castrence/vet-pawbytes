import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SidebarNav from "./ui/dashboard-sidebar";
import AccountMenu from "./AccountMenu";

const NO_SIDEBAR = ["/login", "/signup"];

const TITLES = {
  "/services": "Services",
  "/book": "Book appointment",
  "/confirmation": "Confirmation",
  "/my-appointments": "My appointments",
  "/my-pets": "My pets",
  "/admin": "Dashboard",
  "/settings": "Settings",
  "/credits": "Credits",
};

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const withSidebar = !!user && !NO_SIDEBAR.includes(pathname);

  // Guests, login and signup: normal layout
  if (!withSidebar) {
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden lg:bg-[#DCE5FF]">
      <aside
        className={`hidden shrink-0 overflow-hidden transition-[width] duration-300 motion-reduce:transition-none lg:block ${
          open ? "w-[260px]" : "w-0"
        }`}
      >
        <SidebarNav user={user} onLogout={handleLogout} />
      </aside>

      {/* The "main screen": rounded card that sits over the sidebar */}
      <div
        className={`relative min-w-0 lg:my-2 lg:mr-2 lg:flex-1 lg:overflow-y-auto lg:rounded-[20px] lg:bg-white lg:shadow-[0_8px_24px_rgba(28,51,46,0.12)] ${
          open ? "" : "lg:ml-2"
        }`}
      >
        {/* Top bar (desktop) */}
        <div className="sticky top-0 z-20 hidden h-14 shrink-0 items-center justify-between border-b border-[#D8DEE3] bg-white px-4 font-figtree lg:flex">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Hide sidebar" : "Show sidebar"}
              className="rounded-lg p-1.5 text-[#4B5563] transition-colors hover:bg-[#EEF2FF] hover:text-[#1F2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9]"
            >
              {open ? (
                <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.75} />
              ) : (
                <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.75} />
              )}
            </button>
            <span className="text-[14px] font-semibold text-[#1F2937]">
              {TITLES[pathname] || ""}
            </span>
          </div>

          <AccountMenu user={user} onLogout={handleLogout} variant="avatar" />
        </div>

        <div className="lg:hidden">
          <Navbar />
        </div>
        <main>{children}</main>
        <div className="lg:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}