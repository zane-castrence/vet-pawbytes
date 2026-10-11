export function formatDate(date) {
  const d = new Date(`${date}T00:00`);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}