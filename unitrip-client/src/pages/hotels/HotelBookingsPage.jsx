import { Link } from "react-router-dom";
import { listHotelBookings } from "@/hotels/services/hotelBookings";
import { formatDate, formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HotelBookingsPage() {
  const bookings = listHotelBookings();

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">My Bookings</h1>
          <p className="mt-2 text-muted-foreground">
            Hotel reservations saved in this browser. Payment has not been collected.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/hotels">Search hotels</Link>
        </Button>
      </div>
      {bookings.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-muted-foreground">
          No hotel reservations yet.
        </p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.reference}>
              <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{booking.reference}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.hotel.name} · {booking.room.name} · {formatDate(booking.search.checkIn)} ·{" "}
                    {formatINR(booking.fare.total)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="warning">{booking.statusLabel}</Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/hotels/confirmation/${booking.reference}`}>View</Link>
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
