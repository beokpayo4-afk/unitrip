/**
 * Direct UPI payment helpers (QR / deep-link).
 * Configure via UPI_ID (and optional UPI_PAYEE_NAME) in .env
 */

export function upiConfigured() {
  return Boolean(process.env.UPI_ID?.trim());
}

export function getUpiConfig() {
  if (!upiConfigured()) return null;
  return {
    upiId: process.env.UPI_ID.trim(),
    payeeName: (process.env.UPI_PAYEE_NAME || "UNITRIP TRAVELS").trim(),
  };
}

/** Build a standard UPI intent URI for QR scanners / GPay / PhonePe / Paytm. */
export function buildUpiUri({ amount, note } = {}) {
  const cfg = getUpiConfig();
  if (!cfg) return null;

  const params = new URLSearchParams({
    pa: cfg.upiId,
    pn: cfg.payeeName,
    cu: "INR",
  });

  if (amount != null && Number(amount) >= 0) {
    params.set("am", Number(amount).toFixed(2));
  }
  if (note) {
    params.set("tn", String(note).slice(0, 50));
  }

  return `upi://pay?${params.toString()}`;
}

export function upiPaymentPayload({ amount, note } = {}) {
  const cfg = getUpiConfig();
  if (!cfg) return null;
  return {
    payeeName: cfg.payeeName,
    amount: amount != null ? Number(amount) : null,
    note: note || "",
    uri: buildUpiUri({ amount, note }),
  };
}
