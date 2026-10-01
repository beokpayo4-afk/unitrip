import { Link, useParams } from "react-router-dom";
import { useHolidayBooking } from "@/holidays/context/bookingContext";
import { downloadHolidayBooking } from "@/holidays/services/holidayBookings";
import { showDate } from "@/holidays/utils/dates";
import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HolidayConfirmationPage() {
  const { reference } = useParams();
  const { findBooking } = useHolidayBooking();
  const booking = findBooking(reference);

  if (!booking) {
    return (
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-bold">Request not found</h1>
        <Button asChild className="mt-4">
          <Link to="/holiday-packages">Browse packages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <Badge variant="secondary">{booking.statusLabel}</Badge>
      <h1 className="mt-3 font-display text-4xl font-bold">Request saved</h1>
      <p className="mt-2 text-muted-foreground">
        Booking ID {booking.reference}. This is stored in this browser. The trip is not confirmed and no payment was taken.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{booking.packageName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{booking.destination}</p>
          <p>{booking.durationLabel}</p>
          <p>
            {showDate(booking.startDate)} to {showDate(booking.endDate)}
          </p>
          <p>
            {booking.name} · {booking.email} · {booking.mobile}
          </p>
          <p>
            {booking.adults === 1 ? "1 adult" : `${booking.adults} adults`},{" "}
            {booking.children === 1 ? "1 child" : `${booking.children} children`} · {booking.room}
          </p>
          {booking.requirements && <p>Requirements: {booking.requirements}</p>}
          <p className="text-base font-semibold">Estimate {formatINR(booking.fare.total)}</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" className="no-print" onClick={() => downloadHolidayBooking(booking)}>
          Download
        </Button>
        <Button type="button" variant="outline" className="no-print" onClick={() => window.print()}>
          Print
        </Button>
        <Button asChild variant="outline" className="no-print">
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild variant="secondary" className="no-print">
          <Link to="/holiday-packages/bookings">My requests</Link>
        </Button>
      </div>
    </div>
  );
}
