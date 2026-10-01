import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PackageCard({ travelPackage }) {
  return (
    <Card className="overflow-hidden">
      <img
        src={travelPackage.images[0]}
        alt={travelPackage.destination}
        className="h-48 w-full object-cover"
      />
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {travelPackage.categories.slice(0, 3).map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">{travelPackage.name}</h2>
          <p className="text-sm text-muted-foreground">
            {travelPackage.destination} · {travelPackage.durationLabel}
          </p>
        </div>
        {travelPackage.rating != null && (
          <p className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-accent text-accent" />
            {travelPackage.rating}
            <span className="text-muted-foreground">({travelPackage.reviewCount})</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">{travelPackage.summary}</p>
        <p className="text-lg font-semibold">From {formatINR(travelPackage.startingPrice)}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={`/holiday-packages/${travelPackage.slug}`}>View Package</Link>
          </Button>
          <Button asChild>
            <Link to={`/holiday-packages/${travelPackage.slug}/book`}>Book Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
