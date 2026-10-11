import { Pill } from "./ui/app-controls";

const TONES = {
  Pending: "orange",
  Scheduled: "green",
  Completed: "blue",
  Cancelled: "gray",
};

export default function StatusBadge({ status }) {
  return <Pill tone={TONES[status] || "gray"}>{status}</Pill>;
}