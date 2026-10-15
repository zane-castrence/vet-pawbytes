const mongoose = require("mongoose");

// One document: clinic hours + suggested minutes per service.
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: "main", unique: true },
  open: { type: String, default: "08:00" },
  close: { type: String, default: "17:00" },
  minutes: {
    type: Map, of: Number,
    default: { "Deworming": 15, "Vaccination": 30, "Check-up": 30, "Other": 30, "Surgery consult": 45, "Dental cleaning": 60, "Emergency": 60, "Grooming": 90 }
  }
});

module.exports = mongoose.model("Settings", settingsSchema);
