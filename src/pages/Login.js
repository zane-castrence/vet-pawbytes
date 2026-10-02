<<<<<<< HEAD
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
// npm install three

/* ─── design tokens — adjust these to match your final Figma palette ─── */
const colors = {
  bg: "#F4FAF7",
  card: "#FFFFFF",
  border: "#DCEEE4",
  green: "#2F7A57",
  greenSoft: "#E6F4EC",
  blue: "#2F6FA8",
  text: "#1F2A24",
  textMuted: "#6B7A72",
};

/* Optional: add this to the <head> of public/index.html for the exact font.
   Falls back to a clean system font if you skip it.
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"> */
const fontFamily = "'Manrope', system-ui, -apple-system, sans-serif";

/* Original 21st.dev animated dot-grid background, recolored to the
   site's green/blue palette instead of white-on-black. */
function ShaderBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let active = true;
    let renderer, geometry, material, scene, camera, animationId;

    const canvas = canvasRef.current;
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2) },
      u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
      u_colors: {
        value: [
          new THREE.Vector3(0.184, 0.478, 0.341),
          new THREE.Vector3(0.31, 0.639, 0.467),
          new THREE.Vector3(0.498, 0.769, 0.612),
          new THREE.Vector3(0.184, 0.435, 0.659),
          new THREE.Vector3(0.29, 0.561, 0.788),
          new THREE.Vector3(0.498, 0.702, 0.871),
        ],
      },
      u_total_size: { value: 20.0 },
      u_dot_size: { value: 6.0 },
      u_reverse: { value: 0 },
    };

    material = new THREE.ShaderMaterial({
      vertexShader: `
        precision mediump float;
        uniform vec2 u_resolution;
        out vec2 fragCoord;
        void main() {
          gl_Position = vec4(position, 1.0);
          fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
          fragCoord.y = u_resolution.y - fragCoord.y;
        }
      `,
      fragmentShader: `
        precision mediump float;
        in vec2 fragCoord;

        uniform float u_time;
        uniform float u_opacities[10];
        uniform vec3 u_colors[6];
        uniform float u_total_size;
        uniform float u_dot_size;
        uniform vec2 u_resolution;
        uniform int u_reverse;

        out vec4 fragColor;

        float PHI = 1.61803398874989484820459;
        float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
        }

        void main() {
            vec2 st = fragCoord.xy;
            st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
            st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

            float opacity = step(0.0, st.x) * step(0.0, st.y);

            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 3.0;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);

            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            float current_timing_offset = timing_offset_intro;
            opacity *= step(current_timing_offset, u_time * animation_speed_factor);
            opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
        }
      `,
      uniforms: uniforms,
      glslVersion: THREE.GLSL3,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      transparent: true,
    });

    geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const startTime = performance.now();
    const animate = () => {
      if (!active) return;
      animationId = requestAnimationFrame(animate);
      uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.u_resolution.value.set(window.innerWidth * 2, window.innerHeight * 2);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />;
}

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: "#FFFFFF",
  color: colors.text,
  fontSize: "0.9rem",
  outline: "none",
  fontFamily,
};

const primaryButtonStyle = {
  width: "100%",
  padding: "0.75rem",
  borderRadius: 10,
  border: "none",
  background: colors.green,
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
  fontFamily,
};

const googleButtonStyle = {
  width: "100%",
  padding: "0.68rem",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: "#FFFFFF",
  color: colors.text,
  fontWeight: 500,
  fontSize: "0.88rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  fontFamily,
};

const GoogleIcon = (
  <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Logo = (
  <div
    style={{
      width: 48,
      height: 48,
      borderRadius: "50%",
      background: colors.greenSoft,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "0.9rem",
    }}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill={colors.green}>
      <ellipse cx="12" cy="15.5" rx="6" ry="5" />
      <circle cx="5.5" cy="8.5" r="2.3" />
      <circle cx="10" cy="5.5" r="2.4" />
      <circle cx="14" cy="5.5" r="2.4" />
      <circle cx="18.5" cy="8.5" r="2.3" />
    </svg>
  </div>
);

const Footer = (
  <div style={{ marginTop: "1.1rem", fontSize: "0.75rem", color: colors.textMuted, lineHeight: 1.5, textAlign: "center" }}>
    By continuing, you agree to our{" "}
    <a href="#" style={{ color: colors.green }}>Terms of Service</a> and{" "}
    <a href="#" style={{ color: colors.green }}>Privacy Policy</a>.
  </div>
);

export default function Login() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: colors.bg,
        fontFamily,
      }}
    >
      <ShaderBackground />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "radial-gradient(circle at center, rgba(244,250,247,0.9) 0%, rgba(244,250,247,0) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: colors.card,
          borderRadius: 16,
          padding: "2.2rem",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 12px 32px rgba(47,122,87,0.12)",
          border: `1px solid ${colors.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {Logo}
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: colors.text, marginBottom: "0.3rem" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "0.88rem", color: colors.textMuted, marginBottom: "1.3rem" }}>
          Log in to manage your pet's appointments.
        </p>

        <form onSubmit={(e) => e.preventDefault()} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <input style={inputStyle} type="email" placeholder="Email address" required />
          <input style={inputStyle} type="password" placeholder="Password" required />
          <button type="submit" style={primaryButtonStyle}>Log In</button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", margin: "1rem 0" }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: "0.75rem", color: colors.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        <button style={googleButtonStyle}>
          {GoogleIcon}
          <span>Continue with Google</span>
        </button>

        <div style={{ marginTop: "1.3rem", fontSize: "0.85rem", color: colors.textMuted }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: colors.green, fontWeight: 600, textDecoration: "none" }}>
            Sign Up
          </Link>
        </div>

        {Footer}
      </div>
    </div>
  );
}
=======
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DemoAccounts from "../components/DemoAccounts";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import { validateAuth } from "../utils/validators";

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const isRegister = false;
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const home = (u) => (u.role === "customer" ? "/services" : "/admin");
  if (user) return <Navigate to={home(user)} replace />;
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const found = validateAuth(form, isRegister);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setServerError("");
    try {
      const u = await (isRegister ? register(form) : login(form));
      navigate(home(u));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1>{isRegister ? "Sign up" : "Log in"}</h1>
      <form onSubmit={submit} noValidate className="flex flex-col gap-2">
        <Alert>{serverError}</Alert>
        {isRegister && <FormField label="Full name" name="name" value={form.name} onChange={change} error={errors.name} />}
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} />
        <button disabled={loading}>{loading ? "Please wait…" : isRegister ? "Create account" : "Log in"}</button>
      </form>
      <p>{isRegister ? <>Have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/signup">Sign up</Link></>}</p>
       <DemoAccounts onPick={(email, password) => setForm({ email, password })} /> {/* DEMO: delete this line */}
    </section>
  );
}
>>>>>>> origin/arsi
