import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "./SectionHeading";
import ServiceCard from "../ServiceCard";
import services from "../../data/services";

const LOGO =
  "https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-main-logo.png";

const GAP = 20;

export default function Services() {
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setEdge({
      start: track.scrollLeft <= 4,
      end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const move = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const step = card ? card.offsetWidth + GAP : track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full text-[20px] font-bold text-white transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-40";

  return (
    <section id="services" className="bg-white p-4 sm:p-8">
      <div className="relative overflow-hidden rounded-[20px] bg-[#2F8FEA] px-4 pb-12 pt-14 font-figtree sm:px-8 lg:min-h-[820px] lg:px-10 lg:pt-20">
        <div className="relative mx-auto w-fit text-center text-white">
          <SectionHeading bold="Services" light="of our clinic" />

          <span
            aria-hidden="true"
            className="absolute -left-28 top-2 hidden h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#F06AA6] p-2 lg:flex"
          >
            <img src={LOGO} alt="" className="h-full w-full object-contain" />
          </span>

          <span
            aria-hidden="true"
            className="absolute -right-40 top-4 hidden -rotate-[8deg] rounded-full bg-[#F2733F] px-6 py-2 text-[28px] font-extrabold uppercase tracking-tight text-white lg:block"
          >
            Woof
          </span>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => move(-1)}
            disabled={edge.start}
            className={`${arrow} bg-[#F06AA6]/70`}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next services"
            onClick={() => move(1)}
            disabled={edge.end}
            className={`${arrow} bg-[#E0457F]`}
          >
            →
          </button>
        </div>

        <div
          ref={trackRef}
          onScroll={update}
          className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service, index) => (
            <div
              key={service.name}
              data-card
              className="w-[72%] shrink-0 snap-start sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-60px)/4)]"
            >
              <ServiceCard
                name={service.name}
                index={index}
                image={service.image}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/book"
            className="inline-flex h-12 items-center rounded-full bg-[#E0457F] px-8 text-[16px] font-semibold text-white transition-colors hover:bg-[#C93A70] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Book now
          </Link>
        </div>
      </div>
    </section>
  );
}