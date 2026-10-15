const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { fail } = require("../utils/httpError");

const TEAM = ["admin", "staff", "veterinarian"]; // "clinic team"

exports.TEAM = TEAM;
exports.signToken = (user) => jwt.sign({ id: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.requireAuth = async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) fail("Please log in.", 401);
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { fail("Your session expired. Please log in again.", 401); }
  const user = await User.findById(payload.id);
  if (!user || user.active === false) fail("Account not available.", 401);
  req.user = user; // role comes from the database, so role changes apply immediately
  next();
};

exports.requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) fail("You do not have permission to do that.", 403);
  next();
};
