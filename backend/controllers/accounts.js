const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const Notification = require("../models/Notification");
const { fail } = require("../utils/httpError");
const { TEAM } = require("../middleware/auth");
const { getCatalog } = require("./clinic");

const isClinicTeamRole = (r) => r === "staff" || r === "veterinarian";

// Every non-admin user (staff and vets included).
exports.list = async (_req, res) => {
  const users = await User.find({ role: { $ne: "admin" } });
  res.json(users.map((u) => ({
    id: String(u._id), name: u.name, email: u.email, active: u.active !== false,
    role: isClinicTeamRole(u.role) ? u.role : "customer", isAvailable: u.isAvailable !== false
  })));
};

exports.createTeam = async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || typeof role !== "string")
    fail("Enter a name, email address, password, and clinic role.");
  if (!isClinicTeamRole(role)) fail("Choose Staff or Veterinarian as the clinic role.");
  const n = name.trim(), e = email.trim().toLowerCase();
  if (n.length < 2 || n.length > 100) fail("Enter the team member's full name (2–100 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) fail("Enter a valid email address.");
  if (e.length > 254) fail("Email address must be 254 characters or fewer.");
  if (password.length < 6) fail("Password must be at least 6 characters.");
  if (await User.exists({ email: e })) fail("An account with this email already exists.", 409);
  const staff = await User.create({ name: n, email: e, password: await bcrypt.hash(password, 10), role, active: true, isAvailable: true });
  if (role === "veterinarian") {
    const c = await getCatalog();
    if (!c.vets.some((v) => v.toLowerCase() === n.toLowerCase())) { c.vets.push(n); await c.save(); }
  }
  res.status(201).json({ id: String(staff._id), name: staff.name, email: staff.email, role: staff.role });
};

exports.teamAvailability = async (_req, res) => {
  const team = (await User.find({ role: { $in: TEAM } })).sort((a, b) => a.name.localeCompare(b.name));
  res.json(team.map((u) => ({ id: String(u._id), name: u.name, role: u.role, available: u.active !== false && u.isAvailable !== false })));
};

exports.setAvailability = async (req, res) => {
  const actor = req.user;
  if (!TEAM.includes(actor.role)) fail("Only clinic staff can update availability.", 403);
  const target = await User.findById(req.params.id).catch(() => null);
  if (!target || !TEAM.includes(target.role)) fail("Clinic team member not found.", 404);
  const canUpdate = String(actor._id) === String(target._id) || (actor.role === "admin" && isClinicTeamRole(target.role));
  if (!canUpdate) fail("You can only update your own availability.", 403);
  if (typeof req.body?.available !== "boolean") fail("Availability must be on or off.");
  target.isAvailable = req.body.available;
  await target.save();
  res.status(204).end();
};

const findManaged = async (id, message) => {
  const u = await User.findById(id).catch(() => null);
  if (!u || u.role === "admin") fail(message, 404);
  return u;
};

exports.setActive = async (req, res) => {
  const u = await findManaged(req.params.id, "Customer account not found.");
  u.active = Boolean(req.body?.active);
  await u.save();
  res.status(204).end();
};

exports.setRole = async (req, res) => {
  const { role } = req.body || {};
  if (!["staff", "veterinarian", "customer"].includes(role)) fail("Choose a valid account role.");
  const u = await findManaged(req.params.id, "Account not found.");
  u.role = role; u.isAvailable = true;
  await u.save();
  res.status(204).end();
};

exports.remove = async (req, res) => {
  const u = await findManaged(req.params.id, "Customer account not found.");
  await Promise.all([
    Appointment.deleteMany({ userId: u._id }),
    Pet.deleteMany({ ownerId: u._id }),
    Notification.deleteMany({ recipientId: u._id }),
    u.deleteOne()
  ]);
  res.status(204).end();
};
