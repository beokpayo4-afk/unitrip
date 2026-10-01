import { Navigate, useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { SampleTrainNotice } from "@/trains/components/SampleTrainNotice";
import { TrainDetails } from "@/trains/components/TrainDetails";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { selectedJourney } from "@/trains/services/trainSearch";

export default function TrainDetailsPage() {
  const { draft, selectTrain } = useTrainBooking();
  const navigate = useNavigate();
  const { train } = selectedJourney(draft);
  if (!train) return <Navigate to="/trains/results" replace />;

  return (
    <div className="container-page py-10">
      <TrainStepper current="Details" />
      <div className="mb-6 space-y-3">
        <h1 className="font-display text-4xl font-bold">Train details</h1>
        <SampleTrainNotice />
      </div>
      <TrainDetails
        train={train}
        journeyDate={draft.search.journeyDate}
        quota={draft.search.quota}
        onSelectClass={(classCode) => {
          selectTrain(train.id, classCode);
          navigate("/trains/passengers");
        }}
      />
    </div>
  );
}
