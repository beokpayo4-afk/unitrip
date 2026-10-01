import { Link, useParams } from "react-router-dom";
import { HotelConfirmation } from "@/hotels/components/HotelConfirmation";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { SampleStayNotice } from "@/hotels/components/SampleStayNotice";
import { getHotelBooking } from "@/hotels/services/hotelBookings";
import { Button } from "@/components/ui/button";

export default function HotelConfirmationPage() {
  const { reference } = useParams();
  const booking = getHotelBooking(reference);

  return (
    <div className="container-page py-10">
      <HotelStepper current="Done" />
      <h1 className="mb-6 font-display text-4xl font-bold">Booking confirmation</h1>
      {booking ? (
        <div className="space-y-4">
          <SampleStayNotice>
            This reservation is saved in your browser only. Payment was not taken, and this is not a confirmed hotel booking.
          </SampleStayNotice>
          <HotelConfirmation booking={booking} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">No reservation found for {reference}.</p>
          <Button asChild>
            <Link to="/hotels">Search hotels</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
