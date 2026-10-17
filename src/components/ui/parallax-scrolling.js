import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import "./parallax-scrolling.css";

const HERO_BACKGROUND =
  "https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-hero-background.png";
const HERO_FOREGROUND =
  "https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-hero-dog-removed-background.png";

// Same outer margin as the Testimonials card (p-4 on mobile, p-8 from sm up).
const FRAME_RADIUS = 20;
const marginForScreen = () => (window.innerWidth >= 640 ? 32 : 16);

export function ParallaxComponent() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = parallaxRef.current;
    const pin = root?.querySelector(".parallax__pin");
    const header = root?.querySelector(".parallax__header");
    const frame = root?.querySelector(".parallax__frame");
    const layersEl = root?.querySelector("[data-parallax-layers]");
    if (!pin || !header || !frame || !layersEl) return undefined;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      // No pin, no scroll animation: just show the finished rounded card.
      const setStatic = () => {
        header.style.padding = `${marginForScreen()}px`;
      };
      setStatic();
      frame.style.borderRadius = `${FRAME_RADIUS}px`;
      window.addEventListener("resize", setStatic);
      return () => {
        window.removeEventListener("resize", setStatic);
        header.style.padding = "";
        frame.style.borderRadius = "";
      };
    }

    // The wrapper (.parallax__pin) is pinned. The header and frame inside it
    // are animated, so GSAP never fights its own pin.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: "+=80%",
        pin: true,
        scrub: 0,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      header,
      { padding: 0 },
      { padding: () => marginForScreen(), duration: 1 },
      0
    );
    tl.fromTo(
      frame,
      { borderRadius: 0 },
      { borderRadius: FRAME_RADIUS, duration: 1 },
      0
    );

    [
      { layer: "1", yPercent: 20 },
      { layer: "3", yPercent: 20 },
      { layer: "4", yPercent: 6 },
    ].forEach(({ layer, yPercent }) => {
      tl.to(
        layersEl.querySelectorAll(`[data-parallax-layer="${layer}"]`),
        { yPercent, duration: 1 },
        0
      );
    });

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      tl.scrollTrigger?.kill();
      tl.kill();
      lenis.destroy();
      gsap.set([header, frame], { clearProps: "all" });
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <div className="parallax__pin">
        <section className="parallax__header">
          <div className="parallax__frame">
            <div data-parallax-layers className="parallax__layers">
              <img
                src={HERO_BACKGROUND}
                loading="eager"
                data-parallax-layer="1"
                alt=""
                className="parallax__layer-img parallax__layer-img--bg"
              />
              <div data-parallax-layer="3" className="parallax__layer-title">
                <h2 className="parallax__title">PawBytes</h2>
              </div>
              <img
                src={HERO_FOREGROUND}
                loading="eager"
                data-parallax-layer="4"
                alt="Dog"
                className="parallax__layer-img parallax__layer-img--fg"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ParallaxComponent;