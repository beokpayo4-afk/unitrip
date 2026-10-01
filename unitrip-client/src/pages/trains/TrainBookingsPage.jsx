import { Link } from "react-router-dom";
import { listTrainBookings } from "@/trains/services/trainBookings";
import { formatDate, formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TrainBookingsPage() {
  const bookings = listTrainBookings();

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">My Bookings</h1>
          <p className="mt-2 text-muted-foreground">
            Train reservations saved in this browser. No PNR has been issued.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/trains">Search trains</Link>
        </Button>
      </div>
      {bookings.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-muted-foreground">
          No train reservations yet.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.reference}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{booking.reference}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.train.number} {booking.train.name} · {booking.journey.from} → {booking.journey.to} ·{" "}
                    {formatDate(booking.journey.date)} · {formatINR(booking.fare.total)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">PNR not issued</Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/trains/confirmation/${booking.reference}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
