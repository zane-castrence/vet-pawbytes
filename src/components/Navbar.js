import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RandomLetterSwap } from "./ui/random-letter-swap";
import { scrollToSection } from "../utils/scroll";
import GlassSurface from "./ui/glass-surface";

const HEADING_LOGO =
  "https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-main-logo.png";

const Divider = () => (
  <span aria-hidden="true" className="h-4 w-px bg-current opacity-30" />
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCustomer = user?.role === "customer";

  const [overHero, setOverHero] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const check = () => {
      const hero = document.querySelector(".parallax__header");
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > 70);

      const footer = document.querySelector("footer");
      setHidden(!!footer && footer.getBoundingClientRect().top < 70);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  const overlay = ["/", "/login", "/signup"].includes(pathname);

  const links = !user
    ? [
        ["Home", "/#home", "home"],
        ["Services", "/#services", "services"],
        ["Log in", "/login"],
      ]
    : isCustomer
      ? [
          ["Services", "/services"],
          ["Book", "/book"],
          ["My pets", "/my-pets"],
          ["My appointments", "/my-appointments"],
        ]
      : [["Dashboard", "/admin"]];

  const swap = (label) => (
    <RandomLetterSwap
      label={label}
      staggerDuration={0.025}
      transition={{ duration: 0.6, type: "spring" }}
    />
  );

  // Landing page links scroll to a section instead of opening a new page.
  const goToSection = (event, id) => {
    event.preventDefault();
    if (pathname === "/") scrollToSection(id);
    else navigate("/", { state: { scrollTo: id } });
  };

  const items = links.map(([label, to, section]) => (
    <Link
      key={to}
      to={to}
      onClick={section ? (event) => goToSection(event, section) : undefined}
    >
      {swap(label)}
    </Link>
  ));

  if (user) {
    items.push(
      <button
        key="logout"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        {swap("Log out")}
      </button>
    );
  }

  const tint = overHero
    ? "!bg-[rgba(255,255,255,0.10)] !border-[rgba(255,255,255,0.35)]"
    : "!bg-[rgba(255,255,255,0.55)] !border-[#D8DEE3]";

  const cta =
    "inline-flex h-11 shrink-0 items-center justify-self-end rounded-full bg-[#047857] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#059669]";

  return (
    <>
      <header
        className={`font-figtree fixed inset-x-0 top-4 z-50 transition-transform duration-300 ${
          hidden ? "pointer-events-none -translate-y-[200%]" : ""
        } ${user ? "lg:hidden" : ""}`}
      >
        <div className="mx-auto grid max-w-[1376px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-8">
          <Link
            to="/"
            aria-label="PawBytes home"
            className="flex h-11 w-11 shrink-0 items-center justify-center justify-self-start overflow-hidden rounded-[12px]"
          >
            <img
              src={HEADING_LOGO}
              alt="PawBytes"
              className="h-full w-full object-contain"
            />
          </Link>

          <GlassSurface
            width="auto"
            height={44}
            borderRadius={22}
            blur={11}
            displace={0.5}
            distortionScale={-120}
            redOffset={0}
            greenOffset={8}
            blueOffset={16}
            className={`max-w-[60vw] border ${tint}`}
          >
            <nav
              className={`flex max-w-full items-center gap-4 overflow-x-auto px-3 text-[14px] font-medium ${
                overHero ? "text-white" : "text-[#1F2937]"
              }`}
            >
              {items.map((node, i) => (
                <span
                  key={i}
                  className="flex shrink-0 items-center gap-4"
                >
                  {i > 0 && <Divider />}
                  {node}
                </span>
              ))}
            </nav>
          </GlassSurface>

          {!user || isCustomer ? (
            <Link to="/book" className={cta}>
              Book now
            </Link>
          ) : (
            <span
              className="w-11 shrink-0 justify-self-end"
              aria-hidden="true"
            />
          )}
        </div>
      </header>

      {!overlay && (
        <div
          className={`h-24 ${user ? "lg:hidden" : ""}`}
          aria-hidden="true"
        />
      )}
    </>
  );
}