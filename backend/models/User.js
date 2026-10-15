const mongoose = require("mongoose");
const toJSON = require("./toJSON");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false }, // bcrypt hash; empty for Google-only accounts
  googleId: { type: String },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  province: { type: String, default: "" },
  role: { type: String, enum: ["customer", "staff", "veterinarian", "admin"], default: "customer" },
  active: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });
userSchema.set("toJSON", toJSON);

module.exports = mongoose.model("User", userSchema);
