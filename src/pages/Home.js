import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ParallaxComponent } from "../components/ui/parallax-scrolling";
import Services from "../components/sections/Services";
import Testimonials from "../components/sections/Testimonials";
import { scrollToSection } from "../utils/scroll";

export default function Home() {
  const { user } = useAuth();
  const { state } = useLocation();
  const target = state?.scrollTo;

  // Arrived from another page (e.g. Login) via a navbar section link.
  useEffect(() => {
    if (!target) return undefined;
    const timer = setTimeout(() => scrollToSection(target), 250);
    return () => clearTimeout(timer);
  }, [target]);

  if (user) return <Navigate to={user.role === "customer" ? "/services" : "/admin"} replace />;

  return (
    <div id="home">
      <ParallaxComponent />
      <Services />
      <Testimonials />
    </div>
  );
}