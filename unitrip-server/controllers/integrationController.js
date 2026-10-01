import asyncHandler from "../utils/asyncHandler.js";

const SERVICES = new Set(["flight", "hotel", "train", "package", "payment", "notification"]);
const ACTIONS = new Set(["search", "details", "bookings", "booking", "cancel"]);

/**
 * Server-side adapter for third-party travel, payment, and notification APIs.
 * Credentials are read from the server environment only and are never returned.
 * Until a real adapter is connected, every action reports that it is unavailable.
 */
export const runIntegration = asyncHandler(async (req, res) => {
  if (!SERVICES.has(req.params.service) || !ACTIONS.has(req.params.action)) {
    return res.status(404).json({ message: "Unknown integration." });
  }

  res.status(501).json({
    provider: "unconfigured",
    message:
      "This provider is not connected yet. Add the server credentials, then replace the mock adapter.",
  });
});
