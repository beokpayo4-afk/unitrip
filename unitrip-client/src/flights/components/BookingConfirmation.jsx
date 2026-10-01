import { Link } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { formatDate } from "@/utils/format";
import { formatDuration } from "../utils/time";
import { classLabel } from "../services/fares";
import { COUNTRIES } from "../data/airports";
import { downloadBookingFile } from "../services/flightBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FareBreakdown } from "./FareBreakdown";

function countryName(code) {
  return COUNTRIES.find((country) => country.code === code)?.name || code;
}

export function BookingConfirmation({ booking }) {
  return (
    <div className="space-y-6" id="flight-booking">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Booking reference</p>
          <h2 className="font-display text-4xl font-bold">{booking.reference}</h2>
        </div>
        <Badge variant="warning">{booking.statusLabel}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{booking.payment.message}</p>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flight details</CardTitle>
              <p className="text-sm text-muted-foreground">{classLabel(booking.offer.travelClass)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.offer.legs.map((leg) => (
                <div key={`${leg.date}-${leg.from.code}`} className="rounded-lg border border-border p-3">
                  <p className="font-semibold">
                    {leg.from.city} ({leg.from.code}) → {leg.to.city} ({leg.to.code})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(leg.date)} · {formatDuration(leg.durationMinutes)}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {leg.segments.map((segment) => (
                      <li key={segment.flightNumber}>
                        {segment.airline.name} {segment.flightNumber}: {segment.departTime}{" "}
                        {segment.from.code} → {segment.arriveTime} {segment.to.code}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Passenger details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <div key={`${passenger.email}-${index}`} className="text-sm">
                  <p className="font-semibold">
                    {passenger.title} {passenger.firstName} {passenger.lastName}
                  </p>
                  <p className="text-muted-foreground">
                    {passenger.type} · {passenger.gender} · {countryName(passenger.nationality)} ·{" "}
                    {passenger.email} · {passenger.mobile}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <FareBreakdown price={booking.fare} passengers={booking.search} />
          </CardContent>
        </Card>
      </div>

      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => downloadBookingFile(booking)}>
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
          <Link to="/flights/bookings">My Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
