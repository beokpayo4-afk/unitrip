import { useState } from "react";
import { guestRatingLabel } from "../data/hotels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { RoomList } from "./RoomList";

export function HotelDetails({ hotel, onSelectRoom, onBrowseRooms }) {
  const [active, setActive] = useState(0);
  const photos = hotel.gallery.length > 0 ? hotel.gallery : [hotel.image];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[1.6fr_0.8fr]">
        <img
          src={photos[active]}
          alt={hotel.name}
          className="h-64 w-full rounded-xl object-cover sm:h-80"
        />
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              className="overflow-hidden rounded-lg border border-border"
              onClick={() => setActive(index)}
            >
              <img src={photo} alt="" className="h-20 w-full object-cover sm:h-24" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-bold">{hotel.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating value={hotel.stars} />
            <span className="text-sm text-muted-foreground">
              {hotel.area}, {hotel.city}
            </span>
          </div>
        </div>
        <p className="text-sm font-semibold">
          <span className="mr-2 rounded-md bg-primary px-2 py-1 text-primary-foreground">
            {hotel.guestRating.toFixed(1)}
          </span>
          {guestRatingLabel(hotel.guestRating)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About this stay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{hotel.description}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {hotel.area}, {hotel.city}. Sample location for this demo, not a live map pin.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {hotel.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline">
                {amenity}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Check-in {hotel.policies.checkIn}</p>
          <p>Check-out {hotel.policies.checkOut}</p>
          <p>{hotel.policies.children}</p>
          <p>{hotel.policies.pets}</p>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-bold">Available rooms</h3>
          <Button type="button" variant="outline" onClick={onBrowseRooms}>
            Select Room
          </Button>
        </div>
        <RoomList rooms={hotel.rooms} onSelect={(room) => onSelectRoom(room)} />
      </div>
    </div>
  );
}
