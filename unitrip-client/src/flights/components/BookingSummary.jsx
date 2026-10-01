import { formatDate } from "@/utils/format";
import { classLabel } from "../services/fares";
import { formatDuration } from "../utils/time";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FareBreakdown } from "./FareBreakdown";

export function BookingSummary({ offer, search, passengers, onContinue }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle>Flight</CardTitle>
          <p className="text-sm text-muted-foreground">{classLabel(offer.travelClass)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {offer.legs.map((leg) => (
            <div key={`${leg.date}-${leg.from.code}`} className="rounded-lg border border-border p-3">
              <p className="font-semibold">
                {leg.from.city} ({leg.from.code}) → {leg.to.city} ({leg.to.code})
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(leg.date)} · {formatDuration(leg.durationMinutes)} ·{" "}
                {leg.segments.map((segment) => segment.flightNumber).join(", ")}
              </p>
            </div>
          ))}
          <div>
            <p className="font-semibold">
              {passengers.length} passenger{passengers.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {passengers.map((passenger, index) => (
                <li key={`${passenger.firstName}-${index}`}>
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FareBreakdown price={offer.price} passengers={search} />
          <Button type="button" className="w-full" onClick={onContinue}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
