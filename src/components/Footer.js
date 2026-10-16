import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FooterBackground, TextHoverEffect } from "./ui/hover-footer";

const FOOTER_LOGO =
  "https://res.cloudinary.com/y029hvzd/image/upload/pawbytes-logo-text.svg";

const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", to: "/" },
      { label: "Services", to: "/services" },
      { label: "Book an Appointment", to: "/book" },
    ],
  },
  {
    title: "Helpful Links",
    links: [
      { label: "FAQs", to: "#" },
      { label: "Support", to: "#" },
      { label: "Credits", to: "/credits" },
    ],
  },
];

const contactInfo = [
  { text: "hello@pawbytes.com", href: "mailto:hello@pawbytes.com" },
  { text: "+63 900 000 0000", href: "tel:+639000000000" },
  { text: "Your clinic address here" },
];

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
];

export default function Footer() {
  const { pathname } = useLocation();

  if (["/login", "/signup"].includes(pathname)) return null;

  return (
    <footer className="font-figtree relative m-8 h-fit overflow-hidden rounded-[20px] border border-[#D8DEE3] text-[#4B5563]">
      <div className="relative z-40 mx-auto max-w-7xl p-14">
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-16">
          <div className="flex items-start">
            <Link to="/" aria-label="PawBytes home">
              <img
                src={FOOTER_LOGO}
                alt="PawBytes"
                className="h-auto w-40 object-contain"
              />
            </Link>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-6 text-lg font-semibold text-[#1F2937]">
                {section.title}
              </h4>

              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="transition-colors hover:text-[#2A3BD9]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-6 text-lg font-semibold text-[#1F2937]">
              Contact Us
            </h4>

            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li key={index}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="transition-colors hover:text-[#2A3BD9]"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-8 border-t border-[#D8DEE3]" />

        <div className="flex flex-col items-center justify-between space-y-4 text-sm md:flex-row md:space-y-0">
          <div className="flex space-x-6">
            {socialLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="transition-colors hover:text-[#2A3BD9]"
              >
                {label}
              </a>
            ))}
          </div>

          <p>&copy; {new Date().getFullYear()} PawBytes. All rights reserved.</p>
        </div>
      </div>

      <div className="hidden h-72 md:flex lg:h-96">
        <TextHoverEffect text="PawBytes" className="z-50" />
      </div>

      <FooterBackground />
    </footer>
  );
}