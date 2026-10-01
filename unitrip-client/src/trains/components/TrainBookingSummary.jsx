import { formatDate, formatINR } from "@/utils/format";
import { formatDuration } from "../utils/time";
import { quotaLabel } from "../data/classes";
import { maskId } from "../validation/passengers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TrainBookingSummary({ train, travelClass, search, passengers, fare, onContinue }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle>
            {train.name} · {train.number}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {travelClass.code} · {quotaLabel(search.quota)} quota
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-semibold">
            {train.from.name} {train.from.departure} → {train.to.name} {train.to.arrival}
            {train.dayOffset > 0 ? ` +${train.dayOffset}` : ""}
          </p>
          <p className="text-muted-foreground">
            {formatDate(search.journeyDate)} · {formatDuration(train.durationMinutes)}
          </p>
          <div>
            <p className="font-semibold">Passengers</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {passengers.map((passenger, index) => (
                <li key={`${passenger.name}-${index}`}>
                  {passenger.name}, {passenger.age}, {passenger.gender}, {passenger.berth}, {passenger.idType}{" "}
                  {maskId(passenger.idNumber)}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Fare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>
              {formatINR(fare.fareEach)} × {fare.passengers}
            </span>
            <span>{formatINR(fare.base)}</span>
          </div>
          <div className="flex justify-between">
            <span>Reservation charge</span>
            <span>{formatINR(fare.reservation)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes</span>
            <span>{formatINR(fare.taxes)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fees</span>
            <span>{formatINR(fare.fees)}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="font-display text-2xl">{formatINR(fare.total)}</span>
          </div>
          <Button type="button" className="w-full" onClick={onContinue}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
