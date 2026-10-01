import { Link } from "react-router-dom";
import { useHolidayBooking } from "@/holidays/context/bookingContext";
import { showDate } from "@/holidays/utils/dates";
import { formatINR } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HolidayBookingsPage() {
  const { bookings } = useHolidayBooking();

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl font-bold">Holiday requests</h1>
      <p className="mt-2 text-muted-foreground">Saved in this browser. None of these are confirmed departures.</p>
      {bookings.length === 0 ? (
        <Button asChild className="mt-6">
          <Link to="/holiday-packages">Browse packages</Link>
        </Button>
      ) : (
        <div className="mt-6 grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.reference}>
              <CardHeader>
                <CardTitle>{booking.packageName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{booking.reference}</p>
                <p>
                  {showDate(booking.startDate)} to {showDate(booking.endDate)}
                </p>
                <p>{formatINR(booking.fare.total)}</p>
                <p>{booking.statusLabel}</p>
                <Button asChild variant="outline">
                  <Link to={`/holiday-packages/confirmation/${booking.reference}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
