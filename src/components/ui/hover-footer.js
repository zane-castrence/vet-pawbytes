import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";

export const TextHoverEffect = ({ text, duration, className = "" }) => {
    const svgRef = useRef(null);
    const inView = useInView(svgRef, {amount: 0.4 });
    const [cursor, setCursor] = useState({ x: 0, y: 0 });
    const [hovered, setHovered] = useState(false);
    const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

    useEffect(() => {
        if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setMaskPosition({
            cx: `${((cursor.x - rect.left) / rect.width) * 100}%`,
            cy: `${((cursor.y - rect.top) / rect.height) * 100}%`,
        });
        }
    }, [cursor]);

    const textProps = {
        x: "50%",
        y: "50%",
        textAnchor: "middle",
        dominantBaseline: "middle",
        fill: "transparent",
        fontFamily: "'Figtree', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 58,
    };

    return (
        <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 300 100"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
        className={`select-none cursor-pointer ${className}`}
        >
        <defs>
            <linearGradient
            id="textGradient"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="300"
            y2="0"
            >
            {hovered && (
                <>
                <stop offset="0%" stopColor="#0369A1" />
                <stop offset="25%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="75%" stopColor="#047857" />
                <stop offset="100%" stopColor="#8B5CF6" />
                </>
            )}
            </linearGradient>

        <motion.radialGradient
            id="revealMask"
            gradientUnits="userSpaceOnUse"
            r="20%"
            initial={{ cx: "50%", cy: "50%" }}
            animate={maskPosition}
            transition={{ duration: duration ?? 0, ease: "easeOut" }}
            >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="black" />
            </motion.radialGradient>
            <mask id="textMask">
            <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
            </mask>
        </defs>

        {/* faint outline, only visible while hovering */}
        <text
            {...textProps}
            stroke="#A7B6C2"
            strokeWidth="0.4"
            style={{ opacity: hovered ? 0.7 : 0 }}
        >
            {text}
        </text>

        {/* blue outline that draws itself in on load */}
        <motion.text
            {...textProps}
            stroke="#0369A1"
            strokeWidth="0.4"
            strokeDasharray={6000}
            initial={{ strokeDashoffset: 6000 }}
            animate={{ strokeDashoffset: inView ? 0 : 6000 }}
            transition={{ duration: 3, ease: "linear" }}
        >
            {text}
        </motion.text>

        {/* multi-color outline revealed under the cursor */}
        <text
            {...textProps}
            stroke="url(#textGradient)"
            strokeWidth="0.6"
            mask="url(#textMask)"
        >
            {text}
        </text>
        </svg>
    );
};

export const FooterBackground = () => (
    <div
        className="absolute inset-0 z-0"
        style={{
        background:
            "radial-gradient(125% 125% at 50% 10%, #FFFFFF 50%, #0369A133 100%)",
        }}
    />
);