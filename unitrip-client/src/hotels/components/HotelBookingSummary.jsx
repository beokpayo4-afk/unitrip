import { formatDate } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StayFare } from "./StayFare";

export function HotelBookingSummary({ hotel, room, search, guest, onContinue }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle>Stay</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-display text-2xl font-bold">{hotel.name}</p>
          <p className="text-muted-foreground">
            {hotel.area}, {hotel.city}
          </p>
          <p>
            <span className="font-semibold">Room: </span>
            {room.name} · {room.bedType} · {room.meals}
          </p>
          <p>
            <span className="font-semibold">Dates: </span>
            {formatDate(search.checkIn)} – {formatDate(search.checkOut)}
          </p>
          <p>
            <span className="font-semibold">Guests: </span>
            {guest.guests} · {guest.name}
          </p>
          <p className="text-muted-foreground">{room.cancellation}</p>
          {guest.requests ? <p>Requests: {guest.requests}</p> : null}
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StayFare price={room.price} />
          <Button type="button" className="w-full" onClick={onContinue}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
