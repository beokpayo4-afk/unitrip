import { Link, useParams } from "react-router-dom";
import { SampleTrainNotice } from "@/trains/components/SampleTrainNotice";
import { TrainConfirmation } from "@/trains/components/TrainConfirmation";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { getTrainBooking } from "@/trains/services/trainBookings";
import { Button } from "@/components/ui/button";

export default function TrainConfirmationPage() {
  const { reference } = useParams();
  const booking = getTrainBooking(reference);

  return (
    <div className="container-page py-10">
      <TrainStepper current="Done" />
      <h1 className="mb-6 font-display text-4xl font-bold">Booking confirmation</h1>
      {booking ? (
        <div className="space-y-4">
          <SampleTrainNotice>
            Saved in this browser only. No PNR was issued and no railway seat was booked.
          </SampleTrainNotice>
          <TrainConfirmation booking={booking} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">No reservation found for {reference}.</p>
          <Button asChild>
            <Link to="/trains">Search trains</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
