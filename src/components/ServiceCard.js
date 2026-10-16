import { useId } from "react";
import { Link } from "react-router-dom";
import { GlowCard } from "./ui/spotlight-card";

// Builds one path out of several ellipses.
const ellipses = (list) =>
  list
    .map(
      ([cx, cy, rx, ry]) =>
        `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}a${rx} ${ry} 0 1 0 ${
          2 * rx
        } 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`
    )
    .join("");

const scallop = ellipses([
  [50, 50, 30, 30],
  ...Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4;
    return [50 + 30 * Math.cos(angle), 50 + 30 * Math.sin(angle), 17, 17];
  }),
]);

const SHAPES = [
  {
    color: "#5AB4FF",
    d: "M6 12Q28 2 50 24Q72 2 94 12V54Q94 86 50 98Q6 86 6 54Z",
  },
  {
    color: "#F06AA6",
    d: ellipses([
      [25, 50, 19, 44],
      [50, 50, 19, 44],
      [75, 50, 19, 44],
    ]),
  },
  {
    color: "#D9F25C",
    d: ellipses([
      [50, 25, 25, 25],
      [50, 75, 25, 25],
      [25, 50, 25, 25],
      [75, 50, 25, 25],
      [50, 50, 24, 24],
    ]),
  },
  {
    color: "#3DAF8A",
    d: "M50 4C85 4 96 15 96 50C96 85 85 96 50 96C15 96 4 85 4 50C4 15 15 4 50 4Z",
  },
  {
    color: "#F2733F",
    d: ellipses([
      [33, 50, 27, 46],
      [67, 50, 27, 46],
    ]),
  },
  {
    color: "#2A3BD9",
    d: scallop,
  },
  {
    color: "#5AB4FF",
    d: "M50 5C67 5 77 15 77 29C91 29 96 39 96 52C96 70 84 82 68 82C62 93 54 97 43 94C34 92 29 85 27 78C13 76 5 67 5 54C5 40 14 31 27 29C28 15 36 5 50 5Z",
  },
  {
    color: "#F06AA6",
    d: "M50 5C61 5 68 12 72 22C83 19 93 25 95 36C98 47 91 54 84 59C91 66 91 77 83 85C75 93 64 91 57 85C50 94 38 96 29 89C20 82 21 71 27 64C16 61 9 53 10 42C11 30 20 24 31 25C34 13 40 5 50 5Z",
  },
];

// Per-service image framing.
// scale: image size
// x: horizontal movement
// y: vertical movement
const IMAGE_ADJUSTMENTS = [
  { scale: 0.98, x: 0, y: 6 },   // Check-up
  { scale: 1.02, x: 0, y: 10 },  // Vaccination
  { scale: 1.02, x: 7, y: 10 },  // Grooming
  { scale: 0.92, x: 0, y: 4 },   // Dental cleaning
  { scale: 0.9, x: 0, y: 7 },    // Surgery consult
  { scale: 0.96, x: 0, y: 5 },   // Emergency
  { scale: 0.8, x: 0, y: 13 },   // Deworming
  { scale: 0.88, x: 0, y: 11 },  // Other
];

function ServiceShape({ index, image }) {
  const id = useId().replace(/:/g, "");
  const shape = SHAPES[index % SHAPES.length];
  const adjustment = IMAGE_ADJUSTMENTS[index % IMAGE_ADJUSTMENTS.length];

  const imageSize = 100 * adjustment.scale;
  const imageX = (100 - imageSize) / 2 + adjustment.x;
  const imageY = (100 - imageSize) / 2 + adjustment.y;

  return (
    <div className="min-h-0">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`clip-${id}`}>
            <path d={shape.d} />
          </clipPath>
        </defs>

        <rect
          width="100"
          height="100"
          fill={shape.color}
          clipPath={`url(#clip-${id})`}
        />

        {image && (
          <image
            href={image}
            x={imageX}
            y={imageY}
            width={imageSize}
            height={imageSize}
            preserveAspectRatio="xMidYMid meet"
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