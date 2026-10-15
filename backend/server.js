require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors({ origin: (process.env.CLIENT_URL || "http://localhost:3000").split(",") }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/pets", require("./routes/pets"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/clinic", require("./routes/clinic"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/notifications", require("./routes/notifications"));
app.use((_req, res) => res.status(404).json({ message: "Route not found." }));
app.use(errorHandler);

if (!process.env.JWT_SECRET) { console.error("Startup failed: JWT_SECRET is missing in backend/.env"); process.exit(1); }

const PORT = process.env.PORT || 5001;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => { console.error("Startup failed:", err.message); process.exit(1); });
