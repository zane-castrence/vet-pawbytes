const mongoose = require("mongoose");
const toJSON = require("./toJSON");

const petSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: String,
  sex: String,
  birthday: String,
  weightKg: mongoose.Schema.Types.Mixed, // number or ""
  color: String,
  sterilized: String,
  vaccinationStatus: { type: String, default: "Unknown" },
  allergies: String,
  medicalNotes: String,
  notes: String,
  microchipNumber: String,
  photoUrl: String
}, { timestamps: true });
petSchema.set("toJSON", {
  ...toJSON,
  transform(doc, ret) { toJSON.transform(doc, ret); ret.ownerId = String(ret.ownerId); return ret; }
});

module.exports = mongoose.model("Pet", petSchema);
