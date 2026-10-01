import { formatDate } from "@/utils/format";
import { formatDuration, stopsLabel } from "../utils/time";
import { classLabel } from "../services/fares";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AirlineLogo } from "./AirlineLogo";
import { FareBreakdown } from "./FareBreakdown";

function SegmentBlock({ segment }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
      <AirlineLogo airline={segment.airline} />
      <div className="space-y-2">
        <div>
          <p className="font-semibold">
            {segment.airline.name} · {segment.flightNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDuration(segment.durationMinutes)}
            {segment.arriveDayOffset ? ` · arrives +${segment.arriveDayOffset} day` : ""}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="font-display text-xl font-bold">{segment.departTime}</p>
            <p className="text-sm font-semibold">
              {segment.from.city} ({segment.from.code})
            </p>
            <p className="text-xs text-muted-foreground">{segment.from.name}</p>
          </div>
          <div>
            <p className="font-display text-xl font-bold">{segment.arriveTime}</p>
            <p className="text-sm font-semibold">
              {segment.to.city} ({segment.to.code})
            </p>
            <p className="text-xs text-muted-foreground">{segment.to.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlightDetails({ offer, search, onContinue }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-4">
        {offer.legs.map((leg, index) => (
          <Card key={`${leg.date}-${leg.from.code}`}>
            <CardHeader>
              <CardTitle>
                {offer.legs.length > 1 ? `Flight ${index + 1}` : "Flight"} · {formatDate(leg.date)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {leg.from.city} to {leg.to.city} · {formatDuration(leg.durationMinutes)} ·{" "}
                {stopsLabel(leg.stops)}
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {leg.segments.map((segment, segmentIndex) => (
                <div key={segment.flightNumber} className="space-y-3">
                  <SegmentBlock segment={segment} />
                  {segmentIndex < leg.segments.length - 1 && (
                    <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                      Layover in {segment.to.city}
                    </p>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Cabin {leg.baggage.cabin}</Badge>
                <Badge variant="outline">Check-in {leg.baggage.checkIn}</Badge>
                <Badge variant={leg.refundable ? "success" : "secondary"}>
                  {leg.refundable ? "Refundable" : "Non-refundable"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{leg.cancellation}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Fare details</CardTitle>
          <p className="text-sm text-muted-foreground">{classLabel(offer.travelClass)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <FareBreakdown price={offer.price} passengers={search} />
          <p className="text-sm text-muted-foreground">{offer.cancellation}</p>
          <Button type="button" className="w-full" onClick={onContinue}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
