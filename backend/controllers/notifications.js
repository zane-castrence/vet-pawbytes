const Notification = require("../models/Notification");
const User = require("../models/User");
const { fail } = require("../utils/httpError");
const { TEAM } = require("../middleware/auth");

exports.notify = async (recipientIds, { appointmentId, title, message, type }) => {
  const docs = [...new Set(recipientIds.map(String))].map((recipientId) => ({ recipientId, appointmentId: String(appointmentId), title, message, type }));
  if (docs.length) await Notification.insertMany(docs);
};

exports.activeTeamIds = async () => (await User.find({ role: { $in: TEAM }, active: { $ne: false } }).select("_id")).map((u) => u._id);

exports.list = async (req, res) => res.json(await Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }));

exports.markRead = async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, recipientId: req.user._id }, { read: true });
  if (!n) fail("Notification not found.", 404);
  res.status(204).end();
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ recipientId: req.user._id }, { read: true });
  res.status(204).end();
};
