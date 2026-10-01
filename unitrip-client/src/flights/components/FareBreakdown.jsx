import { formatINR } from "@/utils/format";
import { Separator } from "@/components/ui/separator";

export function FareBreakdown({ price, passengers }) {
  const adults = Number(passengers?.adults ?? 0);
  const children = Number(passengers?.children ?? 0);
  const infants = Number(passengers?.infants ?? 0);
  const rows = [
    ["Fare", price.base],
    ["Taxes", price.taxes],
    ["Fees", price.fees],
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {adults} adult{adults === 1 ? "" : "s"}
        {children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}
        {infants ? `, ${infants} infant${infants === 1 ? "" : "s"}` : ""}
      </p>
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
