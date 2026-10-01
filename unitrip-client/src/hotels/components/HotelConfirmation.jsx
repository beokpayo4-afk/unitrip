import { Link } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { formatDate, formatINR } from "@/utils/format";
import { downloadHotelBooking } from "../services/hotelBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HotelConfirmation({ booking }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Hotel booking ID</p>
          <h2 className="font-display text-4xl font-bold">{booking.reference}</h2>
        </div>
        <Badge variant="warning">{booking.statusLabel}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{booking.payment.message}</p>
      <Card>
        <CardHeader>
          <CardTitle>{booking.hotel.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {booking.hotel.area}, {booking.hotel.city}
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Room: </span>
            {booking.room.name}
          </p>
          <p>
            <span className="font-semibold">Dates: </span>
            {formatDate(booking.search.checkIn)} – {formatDate(booking.search.checkOut)}
          </p>
          <p>
            <span className="font-semibold">Guest: </span>
            {booking.guest.name} · {booking.guest.email} · {booking.guest.mobile}
          </p>
          <p>
            <span className="font-semibold">Guests: </span>
            {booking.guest.guests}
          </p>
          <p>
            <span className="font-semibold">Amount: </span>
            {formatINR(booking.fare.total)}
          </p>
          <p>
            <span className="font-semibold">Status: </span>
            {booking.statusLabel}
          </p>
        </CardContent>
      </Card>
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => downloadHotelBooking(booking)}>
          <Download />
          Download booking
        </Button>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer />
          Print booking
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild>
          <Link to="/hotels/bookings">My Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
