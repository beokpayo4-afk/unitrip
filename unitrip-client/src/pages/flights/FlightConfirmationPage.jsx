import { Link, useParams } from "react-router-dom";
import { BookingConfirmation } from "@/flights/components/BookingConfirmation";
import { FlightStepper } from "@/flights/components/FlightStepper";
import { SampleDataNotice } from "@/flights/components/SampleDataNotice";
import { getFlightBooking } from "@/flights/services/flightBookings";
import { Button } from "@/components/ui/button";

export default function FlightConfirmationPage() {
  const { reference } = useParams();
  const booking = getFlightBooking(reference);

  return (
    <div className="container-page py-10">
      <FlightStepper current="Done" />
      <h1 className="mb-6 font-display text-4xl font-bold">Booking confirmation</h1>
      {booking ? (
        <div className="space-y-4">
          <SampleDataNotice>
            This reservation is saved in your browser only. Payment was not taken, and this is not a ticket.
          </SampleDataNotice>
          <BookingConfirmation booking={booking} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">No reservation found for {reference}.</p>
          <Button asChild>
            <Link to="/flights">Search flights</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
