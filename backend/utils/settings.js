const Settings = require("../models/Settings");

// Single document, created on first read. Returns { open, close, minutes } with minutes as a plain object.
exports.getSettings = async () => {
  const doc = (await Settings.findOne({ key: "main" })) || (await Settings.create({ key: "main" }));
  return { open: doc.open, close: doc.close, minutes: Object.fromEntries(doc.minutes) };
};
