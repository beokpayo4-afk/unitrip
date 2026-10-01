import { ArrowLeftRight, Plus, Search, Trash2 } from "lucide-react";
import { AIRPORTS } from "../data/airports";
import { TRAVEL_CLASSES } from "../services/fares";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Card, CardContent } from "@/components/ui/card";

function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-destructive">{children}</p>;
}

function AirportSelect({ id, label, value, onChange, error }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <SelectNative id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {AIRPORTS.map((airport) => (
          <option key={airport.code} value={airport.code}>
            {airport.city} ({airport.code})
          </option>
        ))}
      </SelectNative>
      <FieldError>{error}</FieldError>
    </div>
  );
}

const TRIP_TYPES = [
  { id: "oneway", label: "One Way" },
  { id: "roundtrip", label: "Round Trip" },
  { id: "multicity", label: "Multi City" },
];

export function FlightSearchForm({ search, onChange, errors, onSubmit }) {
  function patch(partial) {
    onChange({ ...search, ...partial });
  }

  function setCount(key, value) {
    const next = { ...search, [key]: value };
    if (key === "adults" && Number(next.infants) > Number(value)) next.infants = Number(value);
    onChange(next);
  }

  function swapEnds() {
    if (search.tripType === "multicity") {
      onChange({
        ...search,
        segments: search.segments.map((segment) => ({
          ...segment,
          from: segment.to,
          to: segment.from,
        })),
      });
      return;
    }
    onChange({ ...search, from: search.to, to: search.from });
  }

  function updateSegment(index, partial) {
    const segments = search.segments.map((segment, i) =>
      i === index ? { ...segment, ...partial } : segment
    );
    onChange({ ...search, segments });
  }

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
      <CardContent className="space-y-5 pt-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Trip type">
          {TRIP_TYPES.map((type) => (
            <Button
              key={type.id}
              type="button"
              variant={search.tripType === type.id ? "default" : "outline"}
              size="sm"
              aria-pressed={search.tripType === type.id}
              onClick={() => patch({ tripType: type.id })}
            >
              {type.label}
            </Button>
          ))}
        </div>

        {search.tripType === "multicity" ? (
          <div className="space-y-4">
            {search.segments.map((segment, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <AirportSelect
                  id={`from-${index}`}
                  label={`From ${index + 1}`}
                  value={segment.from}
                  onChange={(from) => updateSegment(index, { from })}
                  error={errors.segments?.[index]?.from}
                />
                <AirportSelect
                  id={`to-${index}`}
                  label={`To ${index + 1}`}
                  value={segment.to}
                  onChange={(to) => updateSegment(index, { to })}
                  error={errors.segments?.[index]?.to}
                />
                <div className="space-y-2">
                  <Label htmlFor={`date-${index}`}>Departure date</Label>
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={segment.date}
                    onChange={(event) => updateSegment(index, { date: event.target.value })}
                  />
                  <FieldError>{errors.segments?.[index]?.date}</FieldError>
                </div>
                {search.segments.length > 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mt-6"
                    aria-label={`Remove city ${index + 1}`}
                    onClick={() =>
                      onChange({
                        ...search,
                        segments: search.segments.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                ) : (
                  <span className="hidden md:block" />
                )}
              </div>
            ))}
            <FieldError>{errors.segmentsCount}</FieldError>
            {search.segments.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onChange({
                    ...search,
                    segments: [
                      ...search.segments,
                      {
                        from: search.segments.at(-1)?.to || "BOM",
                        to: "GOI",
                        date: search.segments.at(-1)?.date || search.departureDate,
                      },
                    ],
                  })
                }
              >
                <Plus />
                Add city
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AirportSelect
              id="from"
              label="From"
              value={search.from}
              onChange={(from) => patch({ from })}
              error={errors.from}
            />
            <AirportSelect
              id="to"
              label="To"
              value={search.to}
              onChange={(to) => patch({ to })}
              error={errors.to}
            />
            <div className="space-y-2">
              <Label htmlFor="departure">Departure date</Label>
              <Input
                id="departure"
                type="date"
                value={search.departureDate}
                onChange={(event) => patch({ departureDate: event.target.value })}
              />
              <FieldError>{errors.departureDate}</FieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="return">Return date</Label>
              <Input
                id="return"
                type="date"
                value={search.returnDate}
                disabled={search.tripType !== "roundtrip"}
                onChange={(event) => patch({ returnDate: event.target.value })}
              />
              <FieldError>{errors.returnDate}</FieldError>
            </div>
          </div>
        )}

        <Button type="button" variant="outline" size="sm" onClick={swapEnds}>
          <ArrowLeftRight />
          Swap From/To
        </Button>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CountField
            id="adults"
            label="Adults"
            min={1}
            max={9}
            value={search.adults}
            error={errors.adults}
            onChange={(value) => setCount("adults", value)}
          />
          <CountField
            id="children"
            label="Children"
            min={0}
            max={6}
            value={search.children}
            error={errors.children}
            onChange={(value) => setCount("children", value)}
          />
          <CountField
            id="infants"
            label="Infants"
            min={0}
            max={9}
            value={search.infants}
            error={errors.infants}
            onChange={(value) => setCount("infants", value)}
          />
          <div className="space-y-2">
            <Label htmlFor="class">Travel class</Label>
            <SelectNative
              id="class"
              value={search.travelClass}
              onChange={(event) => patch({ travelClass: event.target.value })}
            >
              {TRAVEL_CLASSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </SelectNative>
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-auto">
          <Search />
          Search Flights
        </Button>
      </CardContent>
      </form>
    </Card>
  );
}

function CountField({ id, label, min, max, value, onChange, error }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <FieldError>{error}</FieldError>
    </div>
  );
}
