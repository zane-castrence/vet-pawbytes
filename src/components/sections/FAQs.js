import { useState } from "react";
import SectionHeading from "./SectionHeading";
import faqs from "../../data/faqs";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? -1 : index));
  };

  return (
    <section id="faq" className="bg-white p-4 sm:p-8">
      <div className="relative overflow-hidden rounded-[20px] bg-white pb-10 pt-16 font-figtree sm:pb-16 sm:pt-24 lg:pt-28">
        <div className="absolute right-[8%] top-12 hidden h-24 w-24 rotate-[-12deg] rounded-full bg-[#F06AA6] lg:block">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl text-white">
            ✦
          </span>
        </div>

        <div className="absolute left-6 top-8 rounded-full border-2 border-[#F06AA6] px-5 py-1 text-sm font-medium text-[#E0457F] sm:left-12 sm:top-12">
          FAQ
        </div>

        <div className="px-4 text-center text-[#1F2937] sm:px-8 lg:px-10">
          <div className="relative mx-auto inline-block max-w-4xl">
            <SectionHeading bold="Frequently asked" light="questions" />

            <span className="absolute -left-16 bottom-1 hidden -rotate-[10deg] rounded-full bg-[#3DAF8A] px-5 py-2 text-xl font-extrabold text-[#D9F25C] sm:block lg:-left-32">
              Meow
            </span>
          </div>
        </div>

        <div className="mt-16 w-full space-y-3 sm:mt-20">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="w-full overflow-hidden rounded-[28px] bg-[#DCEEFF]"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-7 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E0457F] sm:px-10 sm:py-8"
                >
                  <span className="max-w-3xl font-figtree text-[clamp(1.35rem,2.5vw,2.15rem)] font-extrabold leading-tight text-[#1F2937]">
                    {faq.question}
                  </span>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-4xl font-light leading-none text-[#E0457F]"
                  >
                    {isOpen ? "×" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-8 sm:px-10 sm:pb-9">
                    <p className="max-w-3xl font-figtree text-base leading-relaxed text-[#4B5563] sm:text-lg">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}