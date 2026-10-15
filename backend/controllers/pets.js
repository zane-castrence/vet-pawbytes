const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");
const validatePet = require("../utils/validatePet");
const { fail } = require("../utils/httpError");

exports.list = async (req, res) => {
  const pets = await Pet.find({ ownerId: req.user._id });
  res.json(pets.sort((a, b) => a.name.localeCompare(b.name)));
};

exports.create = async (req, res) => {
  if (req.user.role !== "customer") fail("Only an active customer account can create pet profiles.", 403);
  const pet = await Pet.create({ ...validatePet(req.body), ownerId: req.user._id });
  res.status(201).json(pet);
};

exports.update = async (req, res) => {
  const pet = await Pet.findOneAndUpdate({ _id: req.params.id, ownerId: req.user._id }, validatePet(req.body), { returnDocument: "after" });
  if (!pet) fail("Pet profile not found.", 404);
  res.json(pet);
};

exports.remove = async (req, res) => {
  const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user._id });
  if (!pet) fail("Pet profile not found.", 404);
  if (await Appointment.exists({ petId: String(pet._id), status: { $in: ["Pending", "Scheduled"] } }))
    fail("This pet has a pending or scheduled appointment. Cancel or complete it before deleting the profile.", 409);
  await pet.deleteOne();
  res.status(204).end();
};
