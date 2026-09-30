import PDFDocument from "pdfkit";
import { uploadBuffer } from "./storage.js";

function money(n) {
  return `INR ${Number(n || 0).toLocaleString("en-IN")}`;
}

function dateStr(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildTicketPdfBuffer(booking) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pkg = booking.packageSnapshot || {};
    const company = "UNITRIP TRAVELS PRIVATE LIMITED";

    doc
      .fillColor("#0d6e6e")
      .fontSize(22)
      .text("UNITRIP", { continued: false });
    doc
      .fillColor("#333")
      .fontSize(10)
      .text(company)
      .text("Delhi, India")
      .moveDown();

    doc
      .fontSize(16)
      .fillColor("#07111c")
      .text("Travel Ticket / Booking Confirmation", { underline: true })
      .moveDown(0.5);

    doc.fontSize(11).fillColor("#111");
    doc.text(`Order ID: ${booking.orderId}`);
    doc.text(`Status: ${String(booking.status || "").replace("_", " ")}`);
    doc.text(`Booked on: ${dateStr(booking.createdAt)}`);
    doc.moveDown();

    doc.text(`Traveller: ${booking.travellerName}`);
    doc.text(`Email: ${booking.email}`);
    doc.text(`Phone: ${booking.phone}`);
    doc.text(`Travel date: ${dateStr(booking.travelDate)}`);
    doc.text(`Travellers: ${booking.travellersCount}`);
    doc.moveDown();

    doc.fontSize(12).text(`Experience: ${pkg.title || "—"}`);
    doc
      .fontSize(11)
      .text(
        `Destination: ${[pkg.city, pkg.state, pkg.country].filter(Boolean).join(", ")}`
      );
    doc.moveDown(0.5);

    if (booking.includedPlaces?.length) {
      doc.text("Included places:");
      booking.includedPlaces.forEach((p) => {
        doc.text(`  • ${p.name}${p.distanceKm != null ? ` (${p.distanceKm} km)` : ""}`);
      });
      doc.moveDown(0.5);
    }

    if (booking.addOns?.length) {
      doc.text("Paid add-on places:");
      booking.addOns.forEach((p) => {
        doc.text(
          `  • ${p.name} · ${p.distanceKm || 0} km · ${money(p.extraAmount)}`
        );
      });
      doc.moveDown(0.5);
    }

    const base =
      (pkg.amount || 0) * (booking.travellersCount || 1);
    const addOns = (booking.addOns || []).reduce(
      (s, a) => s + (Number(a.extraAmount) || 0),
      0
    );

    doc.moveDown(0.5);
    doc.text(`Package subtotal: ${money(base)}`);
    if (addOns) doc.text(`Add-ons: ${money(addOns)}`);
    doc.fontSize(13).text(`Total paid / due: ${money(booking.totalAmount)}`);
    doc.moveDown();

    doc
      .fontSize(9)
      .fillColor("#666")
      .text(
        "This document is your UNITRIP booking confirmation. Present Order ID and a valid ID at the meeting point. Payment gateway settlement details appear on your bank/UPI statement when paid."
      );

    doc.end();
  });
}

export async function generateAndStoreTicketPdf(booking) {
  const buffer = await buildTicketPdfBuffer(booking);
  const filename = `${booking.orderId}.pdf`;
  const stored = await uploadBuffer(buffer, {
    folder: "tickets",
    filename,
    mimeType: "application/pdf",
  });
  return stored.url;
}

export default { buildTicketPdfBuffer, generateAndStoreTicketPdf };
