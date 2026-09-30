import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi } from "@/api/client";
import AddOnsEditor from "@/components/AddOnsEditor";
import PayButton from "@/components/PayButton";
import RatingForm from "@/components/RatingForm";
import { RequireAuth } from "@/components/ProtectedRoute";
import TicketView from "@/components/TicketView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR } from "@/utils/format";

function statusVariant(status) {
  if (status === "confirmed") return "success";
  if (status === "cancelled") return "destructive";
  return "warning";
}

function MyBookingsInner() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const data = await bookingApi.mine();
    setBookings(data);
    if (selected) {
      const refreshed = data.find((b) => b.id === selected.id);
      setSelected(refreshed || null);
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function updateSelected(booking) {
    setSelected(booking);
    setBookings((list) => list.map((b) => (b.id === booking.id ? booking : b)));
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">My bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Pay, download PDF, add places, or rate confirmed trips — or{" "}
          <Button asChild variant="link" className="h-auto p-0">
            <Link to="/track">track with Order ID</Link>
          </Button>
        </p>
      </div>
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {bookings.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.orderId}>
                  <TableCell>{b.orderId}</TableCell>
                  <TableCell>{b.package?.title}</TableCell>
                  <TableCell>{formatDate(b.travelDate)}</TableCell>
                  <TableCell>{formatINR(b.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(b.status)}>
                      {b.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelected(b)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-4">
            {selected ? (
              <>
                <TicketView ticket={selected} />
                <PayButton ticket={selected} onPaid={updateSelected} />
                <AddOnsEditor ticket={selected} onUpdated={updateSelected} />
                <RatingForm
                  ticket={selected}
                  onRated={() =>
                    updateSelected({ ...selected, canRate: false, hasRated: true })
                  }
                />
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Select Manage to pay, download PDF, add places, or rate.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookings() {
  return (
    <RequireAuth>
      <MyBookingsInner />
    </RequireAuth>
  );
}
