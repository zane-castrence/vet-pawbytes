const Appointment = require("../models/Appointment");
const Pet = require("../models/Pet");
const { fail } = require("../utils/httpError");
const { TEAM } = require("../middleware/auth");

const isTeam = (user) => TEAM.includes(user.role);
const newestFirst = (a, b) => new Date(b.archivedAt || 0) - new Date(a.archivedAt || 0);

// Archived records only. Customers see their own, the clinic team sees every archived appointment.
exports.list = async (req, res) => {
  const team = isTeam(req.user);
  const [appointments, pets] = await Promise.all([
    Appointment.find({ ...(team ? {} : { userId: req.user._id }), archived: true }),
    team ? [] : Pet.find({ ownerId: req.user._id, archived: true })
  ]);
  res.json({ appointments: appointments.sort(newestFirst), pets: pets.sort(newestFirst) });
};

const apply = async (doc, archived) => {
  doc.archived = archived;
  doc.archivedAt = archived ? new Date() : undefined;
  await doc.save();
  return doc;
};

// PUT /api/archive/appointments/:id  { archived: true | false }
exports.setAppointment = async (req, res) => {
  const a = await Appointment.findById(req.params.id);
  if (!a) fail("Appointment not found.", 404);
  if (!isTeam(req.user) && String(a.userId) !== String(req.user._id)) fail("You do not have permission to do that.", 403);
  const archived = Boolean(req.body?.archived);
  if (archived && !["Completed", "Cancelled"].includes(a.status))
    fail("Only completed or cancelled appointments can be archived.", 409);
  res.json(await apply(a, archived));
};

// PUT /api/archive/pets/:id  { archived: true | false }
exports.setPet = async (req, res) => {
  const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!pet) fail("Pet profile not found.", 404);
  const archived = Boolean(req.body?.archived);
  if (archived && await Appointment.exists({ petId: String(pet._id), status: { $in: ["Pending", "Scheduled"] } }))
    fail("This pet has a pending or scheduled appointment. Cancel or complete it before archiving the profile.", 409);
  res.json(await apply(pet, archived));
};
