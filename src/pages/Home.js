import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ParallaxComponent } from "../components/ui/parallax-scrolling";
import Testimonials from "../components/sections/Testimonials";

export default function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "customer" ? "/services" : "/admin"} replace />;

  return (
    <div>
      <ParallaxComponent />
      <Testimonials />
    </div>
  );
}