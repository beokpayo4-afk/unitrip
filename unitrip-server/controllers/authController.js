import User from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";
import logger from "../utils/logger.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (adminEmail && email.toLowerCase() === adminEmail) {
    return res.status(400).json({ message: "This email cannot be registered" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    phone: phone || "",
  });

  const token = signToken({ id: user._id.toString(), role: "user" });

  await audit({
    level: "info",
    action: "auth.register",
    message: `User registered: ${user.email}`,
    meta: { userId: String(user._id) },
    actor: { id: String(user._id), role: "user", email: user.email },
  });

  res.status(201).json({
    token,
    role: "user",
    user: user.toSafeJSON(),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (
    adminEmail &&
    adminPassword &&
    email.toLowerCase() === adminEmail &&
    password === adminPassword
  ) {
    const token = signToken({ id: "admin", role: "admin" });
    await audit({
      level: "info",
      action: "auth.admin_login",
      message: `Admin logged in (${adminEmail})`,
      meta: {},
      actor: { id: "admin", role: "admin", email: adminEmail },
    });
    return res.json({
      token,
      role: "admin",
      user: {
        id: "admin",
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
      },
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    logger.warn("Failed login attempt", { email: email?.toLowerCase() });
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signToken({ id: user._id.toString(), role: "user" });
  await audit({
    level: "info",
    action: "auth.login",
    message: `User logged in: ${user.email}`,
    meta: { userId: String(user._id) },
    actor: { id: String(user._id), role: "user", email: user.email },
  });
  res.json({
    token,
    role: "user",
    user: user.toSafeJSON(),
  });
});

export const me = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    return res.json({
      role: "admin",
      user: {
        id: "admin",
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
      },
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ role: "user", user: user.toSafeJSON() });
});
