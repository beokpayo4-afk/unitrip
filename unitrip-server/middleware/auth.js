import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      req.user = {
        id: "admin",
        role: "admin",
        email: process.env.ADMIN_EMAIL,
        name: "Admin",
      };
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id.toString(),
      role: "user",
      email: user.email,
      name: user.name,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export default { protect, requireAdmin, signToken };
