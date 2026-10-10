import { useId } from "react";
import { Link } from "react-router-dom";
import { GlowCard } from "./ui/spotlight-card";

// builds one path out of several ellipses (they merge into one blob shape)
const ellipses = (list) =>
    list
        .map(
        ([cx, cy, rx, ry]) =>
            `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`
        )
        .join("");

const scallop = ellipses([
    [50, 50, 30, 30],
    ...Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return [50 + 30 * Math.cos(a), 50 + 30 * Math.sin(a), 17, 17];
    }),
]);

// Placeholder shapes in PawBytes colors. Swap or edit freely.
const SHAPES = [
    { color: "#5AB4FF", d: "M6 12Q28 2 50 24Q72 2 94 12V54Q94 86 50 98Q6 86 6 54Z" }, // shield, sky
    { color: "#F06AA6", d: ellipses([[25, 50, 19, 44], [50, 50, 19, 44], [75, 50, 19, 44]]) }, // three lobes, pink
    { color: "#D9F25C", d: ellipses([[50, 25, 25, 25], [50, 75, 25, 25], [25, 50, 25, 25], [75, 50, 25, 25], [50, 50, 24, 24]]) }, // flower, lime
    { color: "#3DAF8A", d: "M50 4C85 4 96 15 96 50C96 85 85 96 50 96C15 96 4 85 4 50C4 15 15 4 50 4Z" }, // squircle, mint
    { color: "#F2733F", d: ellipses([[33, 50, 27, 46], [67, 50, 27, 46]]) }, // twin ovals, orange
    { color: "#2A3BD9", d: scallop }, // scalloped blob, cobalt
];

function ServiceShape({ index, image }) {
    const id = useId().replace(/:/g, "");
    const shape = SHAPES[index % SHAPES.length];

    return (
        <div className="min-h-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
            <clipPath id={`clip-${id}`}>
                <path d={shape.d} />
            </clipPath>
            </defs>
            <rect width="100" height="100" fill={shape.color} clipPath={`url(#clip-${id})`} />
            {image && (
            <image
                href={image}
                width="100"
                height="100"
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#clip-${id})`}
            />
            )}
        </svg>
        </div>
    );
}

export default function ServiceCard({ name, index = 0, image }) {
  return (
    <Link
        to={`/book?service=${encodeURIComponent(name)}`}
        aria-label={`Book ${name}`}
        className="block rounded-[20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2A3BD9]"
        >
        <GlowCard
            customSize
            backdrop="#E9EFFB"
            className="aspect-[3/4.4] w-full cursor-pointer"
        >
            <ServiceShape index={index} image={image} />
            <p className="text-xl font-bold text-[#1F2937]">{name}</p>
        </GlowCard>
    </Link>
  );
}