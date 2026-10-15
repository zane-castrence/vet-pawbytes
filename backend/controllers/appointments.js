const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const User = require("../models/User");
const { fail } = require("../utils/httpError");
const { TEAM } = require("../middleware/auth");
const { notify, activeTeamIds } = require("./notifications");
const { getSettings } = require("../utils/settings");
const { OPEN, findConflict, validateTimes, conflictMessage } = require("../utils/appointments");

const EDITABLE = ["ownerName", "petName", "species", "petPhoto", "service", "vet", "date", "time", "endTime", "duration", "notes", "status"];
const STATUSES = ["Pending", "Scheduled", "Completed", "Cancelled"];
const TIME_FIELDS = ["date", "vet", "time", "endTime"];
const label = (a) => `${a.petName}'s appointment on ${a.date} at ${a.time}`;
const byDateTime = (list) => list.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
const pick = (src, keys) => Object.fromEntries(keys.filter((k) => src[k] !== undefined).map((k) => [k, src[k]]));
const isTeam = (user) => TEAM.includes(user.role);
const str = (v) => (typeof v === "string" ? v.trim() : "");

exports.mine = async (req, res) => res.json(byDateTime(await Appointment.find({ userId: req.user._id })));
exports.all = async (_req, res) => res.json(byDateTime(await Appointment.find()));

// Times only, never names or pet details.
exports.busy = async (req, res) => {
  const { date, vet, ignoreId } = req.query;
  const rows = await Appointment.find({
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    vet, date, status: { $in: OPEN }
  }).sort({ time: 1 }).lean();
  res.json(rows.map((a) => ({ start: a.time, end: a.endTime })));
};

exports.create = async (req, res) => {
  const body = req.body || {};

  // Customers always book for themselves. Clinic team may book for a customer (userId in the body).
  let owner = req.user;
  if (isTeam(req.user) && body.userId) {
    owner = await User.findById(body.userId).catch(() => null);
    if (!owner) fail("Customer account not found.", 404);
  }

  if (body.requirePetProfile && !body.petId) fail("Choose one of your saved pet profiles before booking.");

  const data = { ...pick(body, EDITABLE) };
  if (body.petId) {
    const pet = await Pet.findOne({ _id: body.petId, ownerId: owner._id }).catch(() => null);
    if (!pet) fail("That pet profile could not be found in your account.", 404);
    Object.assign(data, { petId: String(pet._id), petName: pet.name, species: pet.species, petPhoto: pet.photoUrl || "", ownerName: owner.name });
  }

  data.ownerName = str(data.ownerName);
  data.petName = str(data.petName);
  if (!data.ownerName) fail("Enter the owner's name.");
  if (!data.petName) fail("Enter the pet's name.");
  if (!data.species) fail("Choose a species.");
  if (!data.service) fail("Choose a service.");
  if (!data.vet) fail("Choose a veterinarian.");
  if (typeof data.notes === "string" && data.notes.length > 200) fail("Notes must be 200 characters or fewer.");

  data.status = "Pending"; // always Pending on create, even when an admin creates it
  data.duration = validateTimes(data, await getSettings());
  if (await findConflict(data)) fail(conflictMessage(data.vet), 409);

  const item = await Appointment.create({ ...data, userId: owner._id });
  await notify(await activeTeamIds(), {
    appointmentId: item._id, title: "New appointment request", type: "request",
    message: `${item.ownerName} requested ${label(item)}.`
  });
  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const existing = await Appointment.findById(req.params.id);
  if (!existing) fail("Appointment not found.", 404);
  const team = isTeam(req.user);
  if (!team && String(existing.userId) !== String(req.user._id)) fail("You do not have permission to do that.", 403);

  // The frontend sends the whole object back. Only whitelisted fields are ever applied.
  let changes = pick(req.body || {}, EDITABLE);
  if (!team) {
    // Customers can only cancel their own booking.
    if (changes.status && changes.status !== existing.status && changes.status !== "Cancelled") fail("You do not have permission to do that.", 403);
    changes = changes.status ? { status: changes.status } : {};
  }
  if (changes.status && !STATUSES.includes(changes.status)) fail("Choose a valid status.");

  const previousStatus = existing.status;
  const merged = { ...existing.toObject(), ...changes };
  const timesChanged = TIME_FIELDS.some((f) => changes[f] !== undefined && changes[f] !== existing[f]);
  const reopened = OPEN.includes(merged.status) && !OPEN.includes(previousStatus);

  // Re-check hours and clashes only when the slot changed (or a closed booking is reopened).
  if (timesChanged) changes.duration = validateTimes(merged, await getSettings());
  if ((timesChanged || reopened) && OPEN.includes(merged.status) && merged.endTime) {
    if (await findConflict(merged, existing._id)) fail(conflictMessage(merged.vet), 409);
  }

  existing.set(changes);
  if (changes.status === "Completed" && previousStatus !== "Completed") existing.completedAt = new Date();
  await existing.save();

  if (changes.status && changes.status !== previousStatus && ["Scheduled", "Completed", "Cancelled"].includes(changes.status)) {
    const copy = {
      Scheduled: ["Appointment approved", `${label(existing)} was approved.`, "approved"],
      Completed: ["Visit completed", `${label(existing)} has been marked as completed.`, "completed"],
      Cancelled: ["Appointment canceled", `${label(existing)} was canceled.`, "cancelled"]
    }[changes.status];
    await notify([existing.userId, ...(await activeTeamIds())], { appointmentId: existing._id, title: copy[0], message: copy[1], type: copy[2] });
  }
  res.json(existing);
};

exports.remove = async (req, res) => {
  const a = await Appointment.findById(req.params.id);
  if (!a) fail("Appointment not found.", 404);
  if (!isTeam(req.user) && String(a.userId) !== String(req.user._id)) fail("You do not have permission to do that.", 403);
  await a.deleteOne();
  res.status(204).end();
};
