import { formatDate, formatINR } from "@/utils/format";
import { formatDuration } from "../utils/time";
import { quotaLabel } from "../data/classes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RunningDays } from "./RunningDays";

export function TrainDetails({ train, journeyDate, quota, onSelectClass }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-bold">{train.name}</h2>
        <p className="text-sm text-muted-foreground">
          Train No. {train.number} · {train.type} · {formatDate(journeyDate)} · {quotaLabel(quota)} quota
        </p>
        <div className="mt-2">
          <RunningDays days={train.runningDays} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route</CardTitle>
          <p className="text-sm text-muted-foreground">
            {train.from.name} {train.from.departure} → {train.to.name} {train.to.arrival}
            {train.dayOffset > 0 ? ` +${train.dayOffset}` : ""} · {formatDuration(train.durationMinutes)}
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-xl-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-2 font-semibold">Station</th>
                <th className="py-2 font-semibold">Arrival</th>
                <th className="py-2 font-semibold">Departure</th>
                <th className="py-2 font-semibold">Halt</th>
                <th className="py-2 font-semibold">Day</th>
                <th className="py-2 font-semibold">Km</th>
              </tr>
            </thead>
            <tbody>
              {train.route.map((stop) => {
                const boarded = stop.code === train.from.code || stop.code === train.to.code;
                return (
                  <tr key={`${stop.code}-${stop.km}`} className={boarded ? "font-semibold text-primary" : undefined}>
                    <td className="py-2">
                      {stop.name}
                      <span className="ml-1 text-xs text-muted-foreground">{stop.code}</span>
                    </td>
                    <td className="py-2">{stop.arrival || "—"}</td>
                    <td className="py-2">{stop.departure || "—"}</td>
                    <td className="py-2">{stop.halt ? `${stop.halt}m` : "—"}</td>
                    <td className="py-2">{stop.day}</td>
                    <td className="py-2">{stop.km}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classes and fare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {train.classes.map((item) => (
            <div
              key={item.code}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">
                  {item.code} · {formatINR(item.fare)}
                </p>
                <p className="text-sm text-muted-foreground">Sample catalogue fare {formatINR(item.baseFare)}</p>
                <Badge variant={item.availabilityKind === "available" ? "success" : "warning"}>
                  {item.availability}
                </Badge>
              </div>
              <Button type="button" onClick={() => onSelectClass(item.code)}>
                Select {item.code}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {train.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
