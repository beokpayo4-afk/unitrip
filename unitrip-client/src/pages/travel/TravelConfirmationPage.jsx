import { Link, useParams } from "react-router-dom";
import { readTripEnquiry } from "@/travel/services/tripEnquiry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TravelConfirmationPage() {
  const { reference } = useParams();
  const saved = readTripEnquiry(reference);

  return (
    <div className="container-page max-w-2xl py-10">
      <Badge variant="secondary">Waiting for a travel expert</Badge>
      <h1 className="mt-3 font-display text-4xl font-bold">Request received</h1>
      <p className="mt-3 text-muted-foreground">
        Request ID <strong>{reference}</strong>. A UnitTrip travel expert will review this request. A custom quote has not been prepared yet.
      </p>
      {saved?.enquiry && (
        <p className="mt-4 text-sm">
          {saved.enquiry.destination} · {saved.enquiry.name} · {saved.enquiry.email}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/travel-packages">Plan another trip</Link>
        </Button>
      </div>
    </div>
  );
}
