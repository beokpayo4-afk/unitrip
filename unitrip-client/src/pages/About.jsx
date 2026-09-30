import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-4xl font-bold">About UNITRIP</h1>
      <p className="mt-4">
        <strong>UNITRIP TRAVELS PRIVATE LIMITED</strong> is a Delhi-based travel agency offering
        curated tours, transfers and experiences across India and select international destinations.
      </p>
      <p className="mt-3 text-muted-foreground">
        Transparent pricing, verified local partners, and clear booking confirmation — so you can
        plan with confidence.
      </p>
      <Button asChild className="mt-6">
        <Link to="/packages">Browse experiences</Link>
      </Button>
    </div>
  );
}
