// Run once after setting MONGODB_URI:  npm run seed   (safe to run again)
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const { getCatalog } = require("./controllers/clinic");
const { getSettings } = require("./utils/settings");
const { toMin, toHHMM } = require("./utils/clinicTime");

const DEMO = [
  { name: "PawBytes Admin", email: "admin@pawbytes.local", password: "PawBytesAdmin2026!", role: "admin" },
  { name: "PawBytes Staff", email: "staff@pawbytes.local", password: "PawBytesStaff2026!", role: "staff" }
];

(async () => {
  await connectDB();
  for (const acc of DEMO) {
    if (await User.exists({ email: acc.email })) { console.log(`Exists:  ${acc.email}`); continue; }
    await User.create({ ...acc, password: await bcrypt.hash(acc.password, 10) });
    console.log(`Created: ${acc.email}`);
  }
  await getCatalog();
  await getSettings();
  console.log("Default catalog and settings are in place.");

  // One-time migration: old appointments without an end time get endTime = time + 30 minutes.
  const old = await Appointment.find({ $or: [{ endTime: { $exists: false } }, { endTime: null }, { endTime: "" }] });
  for (const a of old) {
    a.endTime = toHHMM(toMin(a.time) + 30);
    a.duration = 30;
    await a.save();
  }
  if (old.length) console.log(`Migrated ${old.length} appointment(s) without an end time.`);

  await mongoose.disconnect();
  console.log("Seed finished.");
})().catch((err) => { console.error("Seed failed:", err.message); process.exit(1); });
