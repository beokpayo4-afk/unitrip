import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RoomList({ rooms, onSelect, selectedId }) {
  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <Card key={room.id} className={selectedId === room.id ? "border-primary" : undefined}>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-[140px_1fr_auto] md:items-center">
            <img src={room.image} alt="" className="h-28 w-full rounded-lg object-cover" />
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold">{room.name}</h3>
              <p className="text-sm">Occupancy: {room.occupancy}</p>
              <p className="text-sm text-muted-foreground">Bed: {room.bedType}</p>
              <p className="text-sm text-muted-foreground">Meals: {room.meals}</p>
              <p className="text-sm text-muted-foreground">{room.cancellation}</p>
              {room.freeCancellation && <Badge variant="success">Free cancellation</Badge>}
            </div>
            <div className="text-left md:text-right">
              <p className="font-display text-2xl font-bold">{formatINR(room.price.total)}</p>
              <p className="text-xs text-muted-foreground">
                {formatINR(room.price.pricePerNight)} per night
              </p>
              <Button type="button" className="mt-3" onClick={() => onSelect(room)}>
                {selectedId === room.id ? "Selected" : "Select"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
