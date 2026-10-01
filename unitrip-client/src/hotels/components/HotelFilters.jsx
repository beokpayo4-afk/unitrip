import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

const AMENITY_OPTIONS = ["Wifi", "Pool", "Breakfast", "Parking", "Spa", "Gym", "Airport shuttle"];

function toggle(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function HotelFilters({ hotels, filters, onChange, onReset }) {
  const areas = [...new Set(hotels.map((hotel) => hotel.area))];

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
          <legend className="text-sm font-semibold">Star rating</legend>
          {[5, 4, 3].map((star) => (
            <label key={star} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.stars.includes(star)}
                onChange={() => onChange({ ...filters, stars: toggle(filters.stars, star) })}
              />
              {star} star
            </label>
          ))}
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="guest-rating">Guest rating</Label>
          <SelectNative
            id="guest-rating"
            value={filters.minGuestRating}
            onChange={(event) => onChange({ ...filters, minGuestRating: event.target.value })}
          >
            <option value="any">Any rating</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
            <option value="9">9+</option>
          </SelectNative>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Location</legend>
          {areas.map((area) => (
            <label key={area} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.areas.includes(area)}
                onChange={() => onChange({ ...filters, areas: toggle(filters.areas, area) })}
              />
              {area}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Amenities</legend>
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() =>
                  onChange({ ...filters, amenities: toggle(filters.amenities, amenity) })
                }
              />
              {amenity}
            </label>
          ))}
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={filters.freeCancellation}
            onChange={(event) => onChange({ ...filters, freeCancellation: event.target.checked })}
          />
          Free cancellation
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={filters.breakfast}
            onChange={(event) => onChange({ ...filters, breakfast: event.target.checked })}
          />
          Breakfast included
        </label>
      </CardContent>
    </Card>
  );
}
