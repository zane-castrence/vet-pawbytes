import SectionHeading from "./SectionHeading";
import ReviewCard from "../ReviewCard";
import ReviewArc from "../ui/review-arc";
import testimonials from "../../data/testimonials";

// each review gets its own card color (see ReviewCard)
const colored = testimonials.map((t, i) => ({ ...t, tone: i }));

export default function Testimonials() {
  return (
    <section className="bg-white p-4 sm:p-8">
      <div className="relative min-h-[860px] overflow-hidden rounded-[20px] bg-[#2A3BD9] lg:min-h-[1230px]">
        {/* one continuous organic line, both ends run off the card edges */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 1230"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-120 760 C150 420 480 330 640 560 S980 860 1120 560 S1360 300 1560 480"
            stroke="#D9F25C"
            strokeWidth="90"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative z-10 px-6 pt-14 text-center text-white lg:pt-20">
          <SectionHeading bold="What people say" light="about us" />
        </div>

        {/* photo frame placeholder, drop your photo or paw art in later */}
        <div className="absolute left-1/2 top-[260px] z-10 h-[460px] w-[240px] -translate-x-1/2 rounded-[36px] border-[10px] border-[#F06AA6] bg-[#E5E7EB] lg:top-[300px] lg:h-[680px] lg:w-[340px]" />

        <div className="absolute inset-x-0 bottom-10 z-20">
          <ReviewArc
            items={colored}
            renderItem={(t) => <ReviewCard item={t} />}
          />
        </div>
      </div>
    </section>
  );
}