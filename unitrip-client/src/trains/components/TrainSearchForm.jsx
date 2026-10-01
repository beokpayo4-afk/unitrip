import { ArrowLeftRight, Search } from "lucide-react";
import { QUOTAS, TRAVEL_CLASSES } from "../data/classes";
import { STATIONS } from "../data/stations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-destructive">{children}</p>;
}

function StationSelect({ id, label, value, onChange, error }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <SelectNative id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {STATIONS.map((station) => (
          <option key={station.code} value={station.code}>
            {station.name} ({station.code})
          </option>
        ))}
      </SelectNative>
      <FieldError>{error}</FieldError>
    </div>
  );
}

export function TrainSearchForm({ search, errors, onChange, onSubmit }) {
  function patch(partial) {
    onChange({ ...search, ...partial });
  }

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <StationSelect
            id="from-station"
            label="From station"
            value={search.from}
            error={errors.from}
            onChange={(from) => patch({ from })}
          />
          <StationSelect
            id="to-station"
            label="To station"
            value={search.to}
            error={errors.to}
            onChange={(to) => patch({ to })}
          />
          <div className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => patch({ from: search.to, to: search.from })}
            >
              <ArrowLeftRight />
              Swap From/To
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="journey-date">Journey date</Label>
            <Input
              id="journey-date"
              type="date"
              value={search.journeyDate}
              onChange={(event) => patch({ journeyDate: event.target.value })}
            />
            <FieldError>{errors.journeyDate}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <SelectNative
              id="class"
              value={search.class}
              onChange={(event) => patch({ class: event.target.value })}
            >
              {TRAVEL_CLASSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectNative>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="quota">Quota</Label>
            <SelectNative
              id="quota"
              value={search.quota}
              onChange={(event) => patch({ quota: event.target.value })}
            >
              {QUOTAS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectNative>
          </div>
          <div>
            <Button type="submit" className="w-full sm:w-auto">
              <Search />
              Search
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
