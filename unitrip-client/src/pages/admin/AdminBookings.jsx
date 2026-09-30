import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  AdminCancelButton,
  AdminConfirmButton,
  AdminRowActions,
} from "@/components/admin/AdminRowActions";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR } from "@/utils/format";
import { cn } from "@/lib/utils";

function statusVariant(status) {
  if (status === "confirmed") return "success";
  if (status === "cancelled") return "destructive";
  return "warning";
}

function paymentLabel(b) {
  if (!b.paymentTxnId && !b.paidAt && !b.payerUpiId) return null;
  const method = b.paymentMethod
    ? b.paymentMethod.replace("_", " ").toUpperCase()
    : "ONLINE";
  return {
    method,
    txnId: b.paymentTxnId || "—",
    userUpiId: b.payerUpiId || null,
  };
}

export default function AdminBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "";
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const qRef = useRef(q);
  qRef.current = q;

  const load = useCallback(async (overrides = {}) => {
    const params = {
      status: overrides.status ?? status,
      q: overrides.q ?? qRef.current,
    };
    setBookings(await adminApi.bookings(params));
  }, [status]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      load({ q, status })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q, status, load]);

  function handleStatusChange(next) {
    setStatus(next);
    if (next) setSearchParams({ status: next });
    else setSearchParams({});
  }

  async function updateStatus(id, next) {
    if (next === "cancelled" && !confirm("Cancel this booking?")) return;
    try {
      await adminApi.updateBooking(id, { status: next });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Bookings"
        description="Search orders, review payment IDs / transaction refs, and confirm or cancel bookings."
      />

      <AdminAlert>{error}</AdminAlert>

      <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Order ID, payment ID, user UPI, email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load({ q }).catch((err) => setError(err.message));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <SelectNative value={status} onChange={(e) => handleStatusChange(e.target.value)}>
              <option value="">All</option>
              <option value="pending_payment">Pending payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </SelectNative>
          </div>
        </div>
      </div>

      {!loading && bookings.length === 0 ? (
        <AdminEmptyState
          title="No bookings found"
          description="Try another search or clear the status filter."
        />
      ) : (
        <AdminTableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Traveller</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Travel</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment ID / Txn</TableHead>
                <TableHead>User UPI ID</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : bookings.map((b) => {
                    const payment = paymentLabel(b);
                    return (
                      <TableRow
                        key={b.id}
                        className={cn(
                          b.status === "pending_payment" &&
                            "bg-[color-mix(in_oklch,var(--accent)_12%,transparent)] border-l-4 border-l-chart-2"
                        )}
                      >
                        <TableCell>
                          <div className="font-medium">{b.orderId}</div>
                          {b.cartGroupId && (
                            <div className="text-xs text-muted-foreground">{b.cartGroupId}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{b.travellerName}</div>
                          <div className="text-xs text-muted-foreground">{b.email}</div>
                        </TableCell>
                        <TableCell>{b.package?.title}</TableCell>
                        <TableCell>{formatDate(b.travelDate)}</TableCell>
                        <TableCell>{formatINR(b.totalAmount)}</TableCell>
                        <TableCell>
                          {payment ? (
                            <div className="max-w-56">
                              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {payment.method}
                              </div>
                              <div className="break-all font-mono text-xs">{payment.txnId}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment?.userUpiId ? (
                            <code className="break-all text-xs">{payment.userUpiId}</code>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {b.paidAt ? (
                            <span className="whitespace-nowrap text-xs">
                              {formatDate(b.paidAt)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(b.status)}>
                            {b.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AdminRowActions>
                            {b.status !== "confirmed" && (
                              <AdminConfirmButton onClick={() => updateStatus(b.id, "confirmed")} />
                            )}
                            {b.status !== "cancelled" && (
                              <AdminCancelButton onClick={() => updateStatus(b.id, "cancelled")} />
                            )}
                          </AdminRowActions>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </AdminTableWrap>
      )}
    </div>
  );
}
