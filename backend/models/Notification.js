const mongoose = require("mongoose");
const toJSON = require("./toJSON");

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  appointmentId: String,
  title: String,
  message: String,
  type: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });
notificationSchema.set("toJSON", {
  ...toJSON,
  transform(doc, ret) { toJSON.transform(doc, ret); ret.recipientId = String(ret.recipientId); ret.createdAt = new Date(ret.createdAt).toISOString(); delete ret.updatedAt; return ret; }
});

module.exports = mongoose.model("Notification", notificationSchema);
