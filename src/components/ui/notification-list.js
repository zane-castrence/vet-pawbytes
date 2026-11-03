import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A3BD9]";

const SPRING = { type: "spring", stiffness: 400, damping: 28, mass: 0.6 };
const CARD_H = 52; // px, fixed so the stack overlap stays exact
const PEEK = 8; // px of each card peeking out while collapsed

// "just now", "5m", "2h", "3d", then a short date
export function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(t).toLocaleDateString("en", { month: "short", day: "numeric" });
}

const cardVariants = (i) => ({
  collapsed: { marginTop: i === 0 ? 0 : PEEK - CARD_H, scaleX: 1 - i * 0.05 },
  expanded: { marginTop: i === 0 ? 0 : 4, scaleX: 1 },
});

// items: newest first. unread: number. onSelect(n): card clicked. onViewAll(): footer clicked.
export default function NotificationList({ items = [], unread = 0, onSelect, onViewAll }) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const shown = items.slice(0, 3);

  const move = reduce ? 0 : 16;
  const transition = reduce ? { duration: 0 } : SPRING;
  const textTransition = reduce ? { duration: 0 } : { duration: 0.22, ease: "easeInOut" };

  return (
    <motion.div
      className="rounded-[20px] border border-[#2A3BD9]/15 bg-white/60 p-3 font-figtree"
      initial="collapsed"
      animate={expanded ? "expanded" : "collapsed"}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false);
      }}
    >
      {shown.length === 0 ? (
        <p
          className="flex items-center rounded-[8px] border border-[#D8DEE3] bg-white px-3 text-[13px] text-[#4B5563]"
          style={{ height: CARD_H }}
        >
          You're all caught up.
        </p>
      ) : (
        <div>
          {shown.map((n, i) => (
            <motion.button
              key={n.id}
              type="button"
              onClick={() => onSelect(n)}
              variants={cardVariants(i)}
              transition={transition}
              style={{ zIndex: shown.length - i, height: CARD_H }}
              className={`relative block w-full rounded-[8px] border border-[#D8DEE3] bg-white px-3 py-2 text-left transition-colors hover:bg-[#EEF2FF] ${FOCUS}`}
            >
              <span className="flex items-center gap-2">
                {!n.read && (
                  <>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#2A3BD9]" aria-hidden="true" />
                    <span className="sr-only">Unread.</span>
                  </>
                )}
                <span className="truncate text-[13px] font-semibold text-[#1F2937]">{n.title}</span>
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-[#4B5563]">
                {timeAgo(n.createdAt)} &bull; {n.message}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onViewAll}
        aria-label={`View all notifications, ${unread} unread`}
        className={`mt-3 flex w-full items-center gap-2 rounded-[8px] text-left ${FOCUS}`}
      >
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[12px] font-semibold ${
            unread > 0 ? "bg-[#2A3BD9] text-white" : "bg-[#D8DEE3] text-[#4B5563]"
          }`}
        >
          {unread}
        </span>
        <span className="grid">
          <motion.span
            className="col-start-1 row-start-1 text-[13px] font-semibold text-[#4B5563]"
            variants={{ collapsed: { opacity: 1, y: 0 }, expanded: { opacity: 0, y: -move } }}
            transition={textTransition}
          >
            Notifications
          </motion.span>
          <motion.span
            className="col-start-1 row-start-1 flex items-center gap-1 text-[13px] font-semibold text-[#1F2DB0]"
            variants={{ collapsed: { opacity: 0, y: move }, expanded: { opacity: 1, y: 0 } }}
            transition={textTransition}
            aria-hidden="true"
          >
            View all <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
          </motion.span>
        </span>
      </button>
    </motion.div>
  );
}
