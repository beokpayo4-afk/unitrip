import { formatINR } from "@/utils/format";
import { Separator } from "@/components/ui/separator";

export function StayFare({ price }) {
  const rows = [
    [`${price.nights} night${price.nights === 1 ? "" : "s"} × ${price.rooms} room${price.rooms === 1 ? "" : "s"}`, price.base],
    ["Taxes", price.taxes],
    ["Fees", price.fees],
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{formatINR(price.pricePerNight)} per night</p>
      {rows.map(([label, amount]) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span>{label}</span>
          <span>{formatINR(amount)}</span>
        </div>
      ))}
      <Separator />
      <div className="flex items-center justify-between font-semibold">
        <span>Total</span>
        <span className="font-display text-2xl">{formatINR(price.total)}</span>
      </div>
    </div>
  );
}
