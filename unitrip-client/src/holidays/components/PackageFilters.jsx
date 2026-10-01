import { HOLIDAY_CATEGORIES, HOTEL_CATEGORIES } from "../data/options";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PackageFilters({ filters, destinations, onChange, onReset }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <SelectNative
            id="destination"
            value={filters.destination}
            onChange={(event) => set("destination", event.target.value)}
          >
            <option value="all">All destinations</option>
            {destinations.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="price-min">Min price</Label>
            <Input
              id="price-min"
              inputMode="numeric"
              value={filters.priceMin}
              onChange={(event) => set("priceMin", event.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-max">Max price</Label>
            <Input
              id="price-max"
              inputMode="numeric"
              value={filters.priceMax}
              onChange={(event) => set("priceMax", event.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <SelectNative id="duration" value={filters.duration} onChange={(event) => set("duration", event.target.value)}>
            <option value="any">Any duration</option>
            <option value="short">1–2 nights</option>
            <option value="medium">3–4 nights</option>
            <option value="long">5 nights or more</option>
          </SelectNative>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <SelectNative id="category" value={filters.category} onChange={(event) => set("category", event.target.value)}>
            <option value="all">All categories</option>
            {HOLIDAY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotel-category">Hotel category</Label>
          <SelectNative
            id="hotel-category"
            value={filters.hotelCategory}
            onChange={(event) => set("hotelCategory", event.target.value)}
          >
            <option value="all">All hotels</option>
            {HOTEL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectNative>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scope">Domestic / International</Label>
          <SelectNative id="scope" value={filters.scope} onChange={(event) => set("scope", event.target.value)}>
            <option value="all">All trips</option>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </SelectNative>
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={onReset}>
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );
}
