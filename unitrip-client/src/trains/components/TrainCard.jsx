import { formatDuration } from "../utils/time";
import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RunningDays } from "./RunningDays";

function availabilityVariant(kind) {
  if (kind === "available") return "success";
  if (kind === "wl" || kind === "rac") return "warning";
  return "secondary";
}

export function TrainCard({ train, onDetails, onBook }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">{train.name}</h2>
            <p className="text-sm text-muted-foreground">
              Train No. {train.number} · {train.type}
            </p>
          </div>
          <RunningDays days={train.runningDays} />
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div>
            <p className="font-semibold">{train.from.name}</p>
            <p className="font-display text-3xl font-bold">{train.from.departure}</p>
            <p className="text-xs text-muted-foreground">{train.from.code}</p>
          </div>
          <p className="text-sm text-muted-foreground">Duration: {formatDuration(train.durationMinutes)}</p>
          <div className="sm:text-right">
            <p className="font-semibold">{train.to.name}</p>
            <p className="font-display text-3xl font-bold">
              {train.to.arrival}
              {train.dayOffset > 0 ? (
                <span className="ml-1 text-sm text-muted-foreground">+{train.dayOffset}</span>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground">{train.to.code}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {train.classes.map((item) => (
            <div key={item.code} className="rounded-lg border border-border px-3 py-2 text-sm">
              <p className="font-semibold">
                {item.code} {formatINR(item.fare)}
              </p>
              <Badge variant={availabilityVariant(item.availabilityKind)}>{item.availability}</Badge>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onDetails(train)}>
            View Details
          </Button>
          <Button type="button" onClick={() => onBook(train)}>
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
