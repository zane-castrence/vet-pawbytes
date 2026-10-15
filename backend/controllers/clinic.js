const Catalog = require("../models/Catalog");
const Settings = require("../models/Settings");
const Appointment = require("../models/Appointment");
const { fail } = require("../utils/httpError");
const { DEFAULT_SERVICES, DEFAULT_VETS } = require("../utils/defaults");
const { getSettings } = require("../utils/settings");
const { toMin } = require("../utils/clinicTime");

const STEP = 15, MAX_MINUTES = 240;

// ---------- catalog ----------
const getCatalog = async () =>
  (await Catalog.findOne({ key: "main" })) || (await Catalog.create({ key: "main", services: DEFAULT_SERVICES, vets: DEFAULT_VETS }));
const catalogOut = (c) => ({ services: c.services, vets: c.vets });
const checkType = (t) => { if (t !== "services" && t !== "vets") fail("Unknown clinic list."); };

exports.getCatalog = getCatalog;
exports.catalog = async (_req, res) => res.json(catalogOut(await getCatalog()));

exports.addItem = async (req, res) => {
  const { type, value } = req.body || {};
  checkType(type);
  const item = String(value || "").trim();
  if (!item) fail("Enter a name first.");
  const c = await getCatalog();
  if (c[type].some((x) => x.toLowerCase() === item.toLowerCase())) fail("That entry already exists.", 409);
  c[type].push(item);
  await c.save();
  res.status(204).end();
};

exports.removeItem = async (req, res) => {
  const { type, value = "" } = req.query;
  checkType(type);
  const c = await getCatalog();
  if (c[type].length <= 1) fail("Keep at least one option available.");
  const field = type === "vets" ? "vet" : "service";
  if (await Appointment.exists({ status: { $in: ["Pending", "Scheduled"] }, [field]: value }))
    fail("This option is assigned to a pending or scheduled appointment. Reassign those appointments first.", 409);
  c[type] = c[type].filter((x) => x !== value);
  await c.save();
  res.status(204).end();
};

// ---------- settings ----------
exports.getSettings = async (_req, res) => res.json(await getSettings());

exports.saveSettings = async (req, res) => {
  const patch = req.body || {};
  const current = await getSettings();
  const next = {
    open: patch.open ?? current.open,
    close: patch.close ?? current.close,
    minutes: { ...current.minutes, ...(patch.minutes || {}) }
  };
  const isTime = (t) => /^\d{2}:\d{2}$/.test(String(t ?? "")) && Number.isFinite(toMin(t));
  if (!isTime(next.open) || !isTime(next.close)) fail("Enter the opening and closing time.");
  const o = toMin(next.open), c = toMin(next.close);
  if (o % STEP || c % STEP) fail(`Clinic hours must be on a ${STEP}-minute mark.`);
  if (c - o < 60) fail("The clinic must be open for at least one hour.");
  for (const [service, m] of Object.entries(next.minutes)) {
    const n = Number(m);
    if (!Number.isFinite(n) || n < STEP || n > MAX_MINUTES || n % STEP) fail(`${service}: enter ${STEP} to ${MAX_MINUTES} minutes, in steps of ${STEP}.`);
    if (service.includes(".") || service.startsWith("$")) fail(`${service}: a custom length can't be saved for names with a "." in them.`);
  }
  await Settings.findOneAndUpdate({ key: "main" }, { open: next.open, close: next.close, minutes: next.minutes }, { upsert: true });
  res.json(await getSettings());
};
