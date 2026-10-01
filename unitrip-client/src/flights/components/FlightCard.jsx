import { formatDuration, stopsLabel } from "../utils/time";
import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AirlineLogo } from "./AirlineLogo";

function DayMark({ offset }) {
  if (!offset) return null;
  return <span className="ml-1 text-[10px] text-muted-foreground">+{offset}</span>;
}

function LegRow({ leg }) {
  const first = leg.segments[0];
  const last = leg.segments[leg.segments.length - 1];
  const numbers = leg.segments.map((item) => item.flightNumber).join(" · ");
  return (
    <div className="grid gap-3 border-b border-border pb-4 last:border-0 last:pb-0 md:grid-cols-[minmax(0,9rem)_1fr]">
      <div className="flex items-center gap-3">
        <AirlineLogo airline={first.airline} />
        <div>
          <p className="font-semibold">{first.airline.name}</p>
          <p className="text-xs text-muted-foreground">{numbers}</p>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <p className="font-display text-xl font-bold">
            {first.departTime}
            <DayMark offset={first.departDayOffset} />
          </p>
          <p className="text-sm font-semibold">{first.from.code}</p>
          <p className="text-xs text-muted-foreground">{first.from.name}</p>
        </div>
        <div className="px-1 text-center text-xs text-muted-foreground">
          <p>{formatDuration(leg.durationMinutes)}</p>
          <p>{stopsLabel(leg.stops)}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold">
            {last.arriveTime}
            <DayMark offset={last.arriveDayOffset} />
          </p>
          <p className="text-sm font-semibold">{last.to.code}</p>
          <p className="text-xs text-muted-foreground">{last.to.name}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground md:col-start-2">
        Baggage: cabin {leg.baggage.cabin}, check-in {leg.baggage.checkIn}
        {" · "}
        {leg.refundable ? "Refundable" : "Non-refundable"}
        {" · "}
        {leg.date}
      </p>
    </div>
  );
}

export function FlightCard({ offer, travellerCount, onSelect }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Badge variant={offer.refundable ? "success" : "secondary"}>
            {offer.refundable ? "Refundable" : "Non-refundable"}
          </Badge>
          <div className="text-right">
            <p className="font-display text-2xl font-bold">{formatINR(offer.price.total)}</p>
            <p className="text-xs text-muted-foreground">
              Total for {travellerCount} traveller{travellerCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {offer.legs.map((leg) => (
            <LegRow key={`${leg.date}-${leg.segments[0].flightNumber}`} leg={leg} />
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={() => onSelect(offer)}>
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
