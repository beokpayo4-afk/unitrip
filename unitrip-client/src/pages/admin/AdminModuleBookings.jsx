import { Suspense, use, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Badge } from "@/components/ui/badge";
import { SelectNative } from "@/components/ui/select-native";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatINR } from "@/utils/format";

const TYPES = {
  flights: { apiType: "flight", title: "Flight bookings" },
  hotels: { apiType: "hotel", title: "Hotel bookings" },
  trains: { apiType: "train", title: "Train bookings" },
  holidays: { apiType: "holiday", title: "Holiday package bookings" },
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const cache = new Map();

function loadBookings(type, version) {
  const key = `${type}:${version}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      adminApi.moduleBookings(type).then(
        (items) => ({ items, error: "" }),
        (error) => ({ items: [], error: error.message || "Could not load bookings." })
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

function money(amount, currency) {
  if (currency === "INR" || !currency) return formatINR(amount);
  return `${currency} ${Number(amount || 0).toLocaleString("en-IN")}`;
}

function statusVariant(status) {
  if (status === "confirmed" || status === "completed") return "success";
  if (status === "cancelled") return "destructive";
  return "warning";
}

function BookingTable({ type, version, onChanged }) {
  const result = use(loadBookings(type, version));
  const [savingId, setSavingId] = useState("");
  const [actionError, setActionError] = useState("");

  async function changeStatus(id, status) {
    setSavingId(id);
    setActionError("");
    try {
      await adminApi.updateModuleBooking(id, { status });
      onChanged();
    } catch (error) {
      setActionError(error.message || "Could not update the booking.");
    } finally {
      setSavingId("");
    }
  }

  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  if (result.items.length === 0) {
    return <AdminEmptyState title="No bookings yet" description="New bookings from the website will appear here." />;
  }

  return (
    <>
      <AdminAlert>{actionError}</AdminAlert>
      <AdminTableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Travel date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-semibold">{item.reference}</TableCell>
                <TableCell>
                  <p>{item.customerName || "—"}</p>
                  <p className="text-xs text-muted-foreground">{item.email || item.phone}</p>
                </TableCell>
                <TableCell className="capitalize">{item.type}</TableCell>
                <TableCell>{item.destination || "—"}</TableCell>
                <TableCell>{showDay(item.travelDate)}</TableCell>
                <TableCell>{money(item.amount, item.currency)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(item.status)}>{STATUS_LABELS[item.status] || item.status}</Badge>
                  <SelectNative
                    className="mt-2"
                    value={item.status}
                    disabled={savingId === item._id}
                    aria-label={`Status for ${item.reference}`}
                    onChange={(event) => changeStatus(item._id, event.target.value)}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </SelectNative>
                </TableCell>
                <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                <TableCell>
                  <Link className="text-sm font-semibold text-primary underline" to={`/admin/module-bookings/${item._id}`}>
                    View details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableWrap>
    </>
  );
}

export default function AdminModuleBookings() {
  const { type } = useParams();
  const [version, setVersion] = useState(0);
  const selected = TYPES[type];

  if (!selected) {
    return <AdminEmptyState title="Unknown booking type" />;
  }

  return (
    <div>
      <AdminPageHeader
        title={selected.title}
        description="Saved from the website. Changing the status does not take a payment."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading bookings…</p>}>
        <BookingTable type={selected.apiType} version={version} onChanged={() => setVersion((current) => current + 1)} />
      </Suspense>
    </div>
  );
}
