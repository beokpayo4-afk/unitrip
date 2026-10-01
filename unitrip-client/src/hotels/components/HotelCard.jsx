import { guestRatingLabel } from "../data/hotels";
import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";

export function HotelCard({ hotel, room, onDetails, onSelectRoom }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-4 p-0 md:grid-cols-[220px_1fr]">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="h-48 w-full object-cover md:h-full"
        />
        <div className="space-y-3 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">{hotel.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StarRating value={hotel.stars} />
                <span className="text-sm text-muted-foreground">
                  {hotel.area}, {hotel.city}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="inline-flex items-center gap-2">
                <span className="rounded-md bg-primary px-2 py-1 text-sm font-bold text-primary-foreground">
                  {hotel.guestRating.toFixed(1)}
                </span>
                <span className="text-sm font-semibold">{guestRatingLabel(hotel.guestRating)}</span>
              </p>
              <p className="text-xs text-muted-foreground">{hotel.reviewCount} sample reviews</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((amenity) => (
              <Badge key={amenity} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {room.name} · {room.occupancy} · {room.bedType} · {room.meals}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              {room.freeCancellation && <Badge variant="success">Free cancellation</Badge>}
              <p className="mt-1 font-display text-2xl font-bold">{formatINR(room.price.pricePerNight)}</p>
              <p className="text-xs text-muted-foreground">per night · {formatINR(room.price.total)} total</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => onDetails(hotel)}>
                View Details
              </Button>
              <Button type="button" onClick={() => onSelectRoom(hotel)}>
                Select Room
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
