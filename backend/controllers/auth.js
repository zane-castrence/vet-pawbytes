const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");
const { fail } = require("../utils/httpError");

const RESERVED = ["admin@pawbytes.local", "staff@pawbytes.local"];
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const out = (u, extra = {}) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, ...extra, token: signToken(u) });

exports.register = async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const phone = String(b.phone || "").replace(/[\s-]/g, "");
  const address = String(b.address || "").trim();
  const city = String(b.city || "").trim();
  const province = String(b.province || "").trim();

  if (name.length < 2) fail("Enter your full name (at least 2 characters).");
  if (!emailRe.test(email)) fail("Enter a valid email, like name@example.com.");
  if (!/^(09|\+639)\d{9}$/.test(phone)) fail("Enter a valid mobile number, like 09123456789.");
  if (address.length < 5) fail("Enter your street address.");
  if (city.length < 2) fail("Enter your city or municipality.");
  if (province.length < 2) fail("Enter your province.");
  if (password.length < 8) fail("Password must be at least 8 characters.");
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) fail("Password needs at least one letter and one number.");

  if (RESERVED.includes(email)) fail("This email is reserved for a clinic account.", 409);
  if (await User.exists({ email })) fail("An account with this email already exists.", 409);

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), phone, address, city, province, role: "customer", active: true });
  res.status(201).json(out(user, { phone, address, city, province }));
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: String(email || "").trim().toLowerCase() }).select("+password");
  if (user && !user.password) fail("This account uses Google sign-in. Please continue with Google.", 400);
  if (!user || !(await bcrypt.compare(String(password || ""), user.password))) fail("Incorrect email or password.", 401);
  if (user.active === false) fail("This account is paused. Please contact the clinic.", 403);
  res.json(out(user));
};

// POST /api/auth/google  { code }  (auth-code flow from @react-oauth/google)
exports.google = async (req, res) => {
  const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) fail("Google sign-in is not set up on the server.", 503);
  const code = String((req.body || {}).code || "");
  if (!code) fail("Google sign-in failed. Please try again.");

  let payload;
  try {
    const client = new OAuth2Client(id, secret, "postmessage"); // "postmessage" = popup flow
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: id });
    payload = ticket.getPayload();
  } catch {
    fail("Google sign-in failed. Please try again.", 401);
  }
  const email = String(payload?.email || "").toLowerCase();
  if (!email || payload.email_verified !== true) fail("Your Google email address is not verified.", 401);

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: (payload.name || email.split("@")[0]).trim(), email, googleId: payload.sub, role: "customer", active: true });
  } else {
    if (user.active === false) fail("This account is paused. Please contact the clinic.", 403);
    if (user.googleId && user.googleId !== payload.sub) fail("This email is linked to a different Google account.", 409);
    if (!user.googleId) { user.googleId = payload.sub; await user.save(); } // link an existing email account
  }
  res.json(out(user));
};
