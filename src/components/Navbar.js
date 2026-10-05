import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RandomLetterSwap } from "./ui/random-letter-swap";

const REFRACTION = true; // set to false to turn the bending effect off

// displacement map: flat gray in the middle, color-coded edges that bend the backdrop
const buildMap = (w, h) => {
  const e = Math.min(28, h / 2);
  const g = (id, x2, y2, c1, c2) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs>
    ${g("l", 1, 0, "rgb(255,128,128)", "rgb(128,128,128)")}
    ${g("r", 1, 0, "rgb(128,128,128)", "rgb(0,128,128)")}
    ${g("t", 0, 1, "rgb(128,128,255)", "rgb(128,128,128)")}
    ${g("b", 0, 1, "rgb(128,128,128)", "rgb(128,128,0)")}
  </defs>
  <rect width="${w}" height="${h}" fill="rgb(128,128,128)"/>
  <rect width="${e}" height="${h}" fill="url(#l)"/>
  <rect x="${w - e}" width="${e}" height="${h}" fill="url(#r)"/>
  <rect width="${w}" height="${e}" fill="url(#t)"/>
  <rect y="${h - e}" width="${w}" height="${e}" fill="url(#b)"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};

const isChromium = typeof navigator !== "undefined" && /Chrome/.test(navigator.userAgent);

const Divider = () => <span aria-hidden="true" className="h-4 w-px bg-current opacity-30" />;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isCustomer = user?.role === "customer";

  // white text only while the hero is behind the navbar, dark text everywhere else
  const [overHero, setOverHero] = useState(false);
  useEffect(() => {
    const check = () => {
      const hero = document.querySelector(".parallax__header");
      setOverHero(!!hero && hero.getBoundingClientRect().bottom > 70);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  const overlay = ["/", "/login", "/signup"].includes(pathname); // full-screen pages: no spacer

  const pillRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const links = !user
    ? [["Home", "/"], ["Services", "/services"], ["Log in", "/login"]]
    : isCustomer
    ? [["Services", "/services"], ["Book", "/book"], ["My pets", "/my-pets"], ["My appointments", "/my-appointments"]]
    : [["Dashboard", "/admin"]];

  const swap = (label) => (
    <RandomLetterSwap label={label} staggerDuration={0.025} transition={{ duration: 0.6, type: "spring" }} />
  );
  const items = links.map(([label, to]) => <Link key={to} to={to}>{swap(label)}</Link>);
  if (user) {
    items.push(
      <button key="logout" onClick={() => { logout(); navigate("/login"); }}>{swap("Log out")}</button>
    );
  }

  const refract = REFRACTION && isChromium && size.w > 0;
  const backdrop = `blur(4px) saturate(1.5)${refract ? " url(#pb-glass)" : ""}`;

  const glass = {
    background: overHero ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.55)",
    border: overHero ? "1px solid rgba(255,255,255,0.35)" : "1px solid #D8DEE3",
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(255,255,255,0.12)",
    transition: "background 0.3s, border-color 0.3s, color 0.3s",
  };

  const cta = "inline-flex h-11 shrink-0 items-center rounded-full bg-[#047857] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[#059669]";

  return (
    <>
    <header className={`font-figtree fixed inset-x-0 top-4 z-50 ${user ? "lg:hidden" : ""}`}>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="pb-glass" x="0" y="0" width={size.w} height={size.h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            {size.w > 0 && (
              <feImage href={buildMap(size.w, size.h)} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
            )}
            <feDisplacementMap in="SourceGraphic" in2="map" scale="26" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </svg>

        <div className="mx-auto flex max-w-[1376px] items-center justify-between gap-3 px-4 sm:px-8">
          {/* logo placeholder, swap for the real mark */}
          <Link to="/" aria-label="PawBytes home" className="h-11 w-11 shrink-0 rounded-[12px] bg-[#E5E7EB]" />

          <nav
            ref={pillRef}
            style={glass}
            className={`flex h-11 max-w-[60vw] items-center gap-4 overflow-x-auto rounded-full px-5 text-[14px] font-medium ${overHero ? "text-white" : "text-[#1F2937]"}`}
          >
            {items.map((node, i) => (
              <span key={i} className="flex shrink-0 items-center gap-4">
                {i > 0 && <Divider />}
                {node}
              </span>
            ))}
          </nav>

          {(!user || isCustomer) ? (
            <Link to="/book" className={cta}>Book now</Link>
          ) : (
            <span className="w-11 shrink-0" aria-hidden="true" />
          )}
        </div>
      </header>
      {!overlay && <div className={`h-24 ${user ? "lg:hidden" : ""}`} aria-hidden="true" />}
    </>
  );
}