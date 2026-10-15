// Clinic is in the Philippines. "Today" and "now" are judged in this timezone, not the server's.
const TZ = process.env.CLINIC_TIMEZONE || "Asia/Manila";

exports.nowInClinic = () => {
  const s = new Date().toLocaleString("sv-SE", { timeZone: TZ }); // "YYYY-MM-DD HH:mm:ss"
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
};

exports.toMin = (t) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t ?? ""));
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};
exports.toHHMM = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
exports.label12 = (t) => {
  const m = exports.toMin(t);
  if (!Number.isFinite(m)) return String(t ?? "");
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
