import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FooterBackground, TextHoverEffect } from "./ui/hover-footer";

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
        <footer className="font-figtree relative h-fit rounded-[20px] overflow-hidden m-8 border border-[#D8DEE3] text-[#4B5563]">
        <div className="max-w-7xl mx-auto p-14 z-40 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
            {/* Logo placeholder (swap for the real mark later) */}
            <div>
                <div className="w-12 h-12 rounded-[20px] bg-[#E5E7EB]" />
            </div>

            {footerLinks.map((section) => (
                <div key={section.title}>
                <h4 className="text-[#1F2937] text-lg font-semibold mb-6">
                    {section.title}
                </h4>
                <ul className="space-y-3">
                    {section.links.map((link) => (
                    <li key={link.label}>
                        <Link to={link.to} className="hover:text-[#0369A1] transition-colors">
                        {link.label}
                        </Link>
                    </li>
                    ))}
                </ul>
                </div>
            ))}

            <div>
                <h4 className="text-[#1F2937] text-lg font-semibold mb-6">Contact Us</h4>
                <ul className="space-y-3">
                {contactInfo.map((item, i) => (
                    <li key={i}>
                    {item.href ? (
                        <a href={item.href} className="hover:text-[#0369A1] transition-colors">
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

            <hr className="border-t border-[#D8DEE3] my-8" />

            <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
            <div className="flex space-x-6">
                {socialLinks.map(({ label, href }) => (
                <a key={label} href={href} className="hover:text-[#0369A1] transition-colors">
                    {label}
                </a>
                ))}
            </div>
            <p>&copy; {new Date().getFullYear()} PawBytes. All rights reserved.</p>
            </div>
        </div>

            {/* Oversized handwritten wordmark (large screens only) */}
            <div className="md:flex hidden h-72 lg:h-96">
                <TextHoverEffect text="PawBytes" className="z-50" />
            </div>

        <FooterBackground />
        </footer>
    );
}