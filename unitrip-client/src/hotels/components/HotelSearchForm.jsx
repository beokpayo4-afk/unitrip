import { Search } from "lucide-react";
import { hotelCities } from "../data/hotels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-destructive">{children}</p>;
}

export function HotelSearchForm({ search, errors, onChange, onSubmit }) {
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
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="destination">Destination</Label>
            <SelectNative
              id="destination"
              value={search.destination}
              onChange={(event) => patch({ destination: event.target.value })}
            >
              {hotelCities().map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </SelectNative>
            <FieldError>{errors.destination}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-in">Check-in</Label>
            <Input
              id="check-in"
              type="date"
              value={search.checkIn}
              onChange={(event) => patch({ checkIn: event.target.value })}
            />
            <FieldError>{errors.checkIn}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-out">Check-out</Label>
            <Input
              id="check-out"
              type="date"
              value={search.checkOut}
              onChange={(event) => patch({ checkOut: event.target.value })}
            />
            <FieldError>{errors.checkOut}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rooms">Rooms</Label>
            <Input
              id="rooms"
              type="number"
              min={1}
              max={5}
              value={search.rooms}
              onChange={(event) => patch({ rooms: Number(event.target.value) })}
            />
            <FieldError>{errors.rooms}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adults">Adults</Label>
            <Input
              id="adults"
              type="number"
              min={1}
              max={8}
              value={search.adults}
              onChange={(event) => patch({ adults: Number(event.target.value) })}
            />
            <FieldError>{errors.adults}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              type="number"
              min={0}
              max={6}
              value={search.children}
              onChange={(event) => patch({ children: Number(event.target.value) })}
            />
            <FieldError>{errors.children}</FieldError>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
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
