import { CLASS_ORDER } from "../data/classes";
import { TIME_BUCKETS } from "../utils/time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function TrainFilters({ trains, filters, onChange, onReset }) {
  const types = [...new Set(trains.map((train) => train.type))];
  const classes = CLASS_ORDER.filter((code) =>
    trains.some((train) => train.classes.some((item) => item.code === code))
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <BucketGroup
          legend="Departure time"
          selected={filters.departBuckets}
          onToggle={(id) => onChange({ ...filters, departBuckets: toggle(filters.departBuckets, id) })}
        />
        <BucketGroup
          legend="Arrival time"
          selected={filters.arriveBuckets}
          onToggle={(id) => onChange({ ...filters, arriveBuckets: toggle(filters.arriveBuckets, id) })}
        />
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Train type</legend>
          {types.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.types.includes(type)}
                onChange={() => onChange({ ...filters, types: toggle(filters.types, type) })}
              />
              {type}
            </label>
          ))}
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Class</legend>
          {classes.map((code) => (
            <label key={code} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.classes.includes(code)}
                onChange={() => onChange({ ...filters, classes: toggle(filters.classes, code) })}
              />
              {code}
            </label>
          ))}
        </fieldset>
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
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <SelectNative
            id="duration"
            value={filters.maxDuration}
            onChange={(event) => onChange({ ...filters, maxDuration: event.target.value })}
          >
            <option value="any">Any duration</option>
            <option value="360">Under 6 hours</option>
            <option value="720">Under 12 hours</option>
            <option value="1080">Under 18 hours</option>
            <option value="1440">Under 24 hours</option>
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
          <input type="checkbox" checked={selected.includes(bucket.id)} onChange={() => onToggle(bucket.id)} />
          {bucket.label}
        </label>
      ))}
    </fieldset>
  );
}
