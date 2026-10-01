import { airlineByCode } from "../data/airlines";
import { TIME_BUCKETS } from "../utils/time";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function toggle(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function FlightFilters({ offers, filters, onChange, onReset }) {
  const airlines = [
    ...new Map(
      offers.flatMap((offer) => offer.airlineCodes.map((code) => [code, airlineByCode(code)]))
    ).values(),
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Price</legend>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="price-min">Min</Label>
              <Input
                id="price-min"
                type="number"
                min="0"
                value={filters.priceMin}
                onChange={(event) => onChange({ ...filters, priceMin: event.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price-max">Max</Label>
              <Input
                id="price-max"
                type="number"
                min="0"
                value={filters.priceMax}
                onChange={(event) => onChange({ ...filters, priceMax: event.target.value })}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Airlines</legend>
          {airlines.map((airline) => (
            <label key={airline.code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline.code)}
                onChange={() =>
                  onChange({ ...filters, airlines: toggle(filters.airlines, airline.code) })
                }
              />
              {airline.name}
            </label>
          ))}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="stops">Stops</Label>
          <SelectNative
            id="stops"
            value={filters.stops}
            onChange={(event) => onChange({ ...filters, stops: event.target.value })}
          >
            <option value="any">Any stops</option>
            <option value="0">Non-stop</option>
            <option value="1">1 stop</option>
            <option value="2">2+ stops</option>
          </SelectNative>
        </div>

        <BucketGroup
          legend="Departure time"
          selected={filters.departBuckets}
          onToggle={(id) =>
            onChange({ ...filters, departBuckets: toggle(filters.departBuckets, id) })
          }
        />
        <BucketGroup
          legend="Arrival time"
          selected={filters.arriveBuckets}
          onToggle={(id) =>
            onChange({ ...filters, arriveBuckets: toggle(filters.arriveBuckets, id) })
          }
        />

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <SelectNative
            id="duration"
            value={filters.maxDuration}
            onChange={(event) => onChange({ ...filters, maxDuration: event.target.value })}
          >
            <option value="any">Any duration</option>
            <option value="180">Under 3 hours</option>
            <option value="300">Under 5 hours</option>
            <option value="480">Under 8 hours</option>
            <option value="720">Under 12 hours</option>
          </SelectNative>
        </div>
      </CardContent>
    </Card>
  );
}

function BucketGroup({ legend, selected, onToggle }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{legend}</legend>
      {TIME_BUCKETS.map((bucket) => (
        <label key={bucket.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={selected.includes(bucket.id)}
            onChange={() => onToggle(bucket.id)}
          />
          {bucket.label}
        </label>
      ))}
    </fieldset>
  );
}
