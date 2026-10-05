import { useEffect, useRef } from "react";

export default function ReviewArc({
  items,
  renderItem,
  cardWidth = 300,
  gap = 24,
  speed = 28, // px per second
  curve = 0.0001, // bigger = rounder arc
  height = 330,
}) {
  const els = useRef([]);
  const paused = useRef(false);

  // repeat the list so the ring is longer than the screen
  const all = [...items, ...items];
  const pitch = cardWidth + gap;
  const total = all.length * pitch;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let offset = 0;
    let last = performance.now();
    let raf;

    const render = () => {
      els.current.forEach((el, i) => {
        if (!el) return;
        // positive modulo so the loop never runs out
        let s = (((i * pitch + offset) % total) + total) % total;
        if (s > total / 2) s -= total;
        const y = curve * s * s;
        const rot = (Math.atan(2 * curve * s) * 180) / Math.PI;
        el.style.transform = `translate(${s}px, ${y}px) rotate(${rot}deg)`;
        el.style.opacity = Math.abs(s) > 1100 ? "0" : "1";
      });
    };

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused.current && !reduced) offset -= speed * dt;
      render();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pitch, total, speed, curve]);

  return (
    <div
      className="relative"
      style={{ height }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {all.map((item, i) => (
        <div
          key={i}
          ref={(el) => (els.current[i] = el)}
          aria-hidden={i >= items.length}
          className="absolute top-0 will-change-transform"
          style={{ width: cardWidth, left: "50%", marginLeft: -cardWidth / 2 }}
        >
          {renderItem(item, i)}
        </div>
      ))}
    </div>
  );
}