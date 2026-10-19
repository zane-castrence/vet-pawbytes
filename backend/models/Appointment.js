const mongoose = require("mongoose");
const toJSON = require("./toJSON");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  ownerName: String,
  petId: { type: String, default: "" },
  petName: String,
  species: String,
  petPhoto: { type: String, default: "" },
  service: String,   // name string, not an id
  vet: String,       // name string, not an id
  date: String,      // "YYYY-MM-DD"
  time: String,      // "HH:mm"
  endTime: String,   // "HH:mm"
  duration: Number,  // minutes
  notes: { type: String, default: "" },
  status: { type: String, enum: ["Pending", "Scheduled", "Completed", "Cancelled"], default: "Pending" },
  completedAt: Date,
  archived: { type: Boolean, default: false },
  archivedAt: Date
}, { timestamps: true });
appointmentSchema.index({ vet: 1, date: 1 });
appointmentSchema.set("toJSON", {
  ...toJSON,
  transform(doc, ret) {
    toJSON.transform(doc, ret);
    ret.userId = String(ret.userId);
    if (ret.completedAt) ret.completedAt = new Date(ret.completedAt).toISOString();
    if (ret.archivedAt) ret.archivedAt = new Date(ret.archivedAt).toISOString();
    return ret;
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
