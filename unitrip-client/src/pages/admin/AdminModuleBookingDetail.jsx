import { Suspense, use, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { SelectNative } from "@/components/ui/select-native";
import { formatDateTime, formatINR } from "@/utils/format";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const cache = new Map();

function loadBooking(id, version) {
  const key = `${id}:${version}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      adminApi.moduleBooking(id).then(
        (item) => ({ item, error: "" }),
        (error) => ({ item: null, error: error.message || "Booking not found." })
      )
    );
  }
  return cache.get(key);
}

function showDay(value) {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return value;
}

function Row({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function Detail({ id, version, onChanged }) {
  const result = use(loadBooking(id, version));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  const booking = result.item;
  const details = booking.details || {};

  async function changeStatus(status) {
    setSaving(true);
    setError("");
    try {
      await adminApi.updateModuleBooking(booking._id, { status });
      onChanged();
    } catch (err) {
      setError(err.message || "Could not update the booking.");
    } finally {
      setSaving(false);
    }
  }

  const passengers = details.passengers || [];
  const amount = booking.currency === "INR" || !booking.currency ? formatINR(booking.amount) : `${booking.currency} ${booking.amount}`;

  return (
    <div>
      <AdminAlert>{error}</AdminAlert>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="capitalize">
          {booking.type}
        </Badge>
        <SelectNative
          value={booking.status}
          disabled={saving}
          aria-label="Booking status"
          onChange={(event) => changeStatus(event.target.value)}
          className="max-w-xs"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectNative>
      </div>
      <dl>
        <Row label="Booking ID" value={booking.reference} />
        <Row label="Customer" value={booking.customerName} />
        <Row label="Email" value={booking.email} />
        <Row label="Phone" value={booking.phone} />
        <Row label="Destination" value={booking.destination} />
        <Row label="Travel date" value={showDay(booking.travelDate)} />
        <Row label="Amount" value={amount} />
        <Row label="Status" value={STATUS_LABELS[booking.status] || booking.status} />
        <Row label="Created" value={formatDateTime(booking.createdAt)} />
        {details.packageName && <Row label="Package" value={details.packageName} />}
        {details.hotel?.name && <Row label="Hotel" value={details.hotel.name} />}
        {details.room?.name && <Row label="Room" value={details.room.name} />}
        {details.train && <Row label="Train" value={`${details.train.name} ${details.train.number}`} />}
        {details.journey && (
          <Row label="Journey" value={`${details.journey.from} to ${details.journey.to} · ${details.journey.classCode || ""}`} />
        )}
        {details.offer?.airline && <Row label="Airline" value={details.offer.airline} />}
        {passengers.length > 0 && (
          <Row
            label="Passengers"
            value={passengers
              .map((person) => person.name || `${person.firstName || ""} ${person.lastName || ""}`.trim())
              .filter(Boolean)
              .join(", ")}
          />
        )}
        {details.requirements && <Row label="Requirements" value={details.requirements} />}
        {details.pnrStatus && <Row label="PNR" value={details.pnr ? details.pnr : "Not issued"} />}
      </dl>
    </div>
  );
}

export default function AdminModuleBookingDetail() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);

  return (
    <div>
      <AdminPageHeader
        title="Booking details"
        actions={
          <Link to="/admin" className="text-sm font-semibold text-primary underline">
            Admin home
          </Link>
        }
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading booking…</p>}>
        <Detail id={id} version={version} onChanged={() => setVersion((current) => current + 1)} />
      </Suspense>
    </div>
  );
}
