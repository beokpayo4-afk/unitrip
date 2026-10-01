import { formatINR } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainPaymentPanel({ amount, busy, onContinue }) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          This step does not take a payment and does not book a railway seat. No card, UPI, or wallet
          is charged. A payment provider can be connected later through the train payment service.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Amount due later</span>
          <span className="font-display text-3xl font-bold">{formatINR(amount)}</span>
        </div>
        <Badge variant="warning">Not charged</Badge>
        <Button type="button" className="w-full" disabled={busy} onClick={onContinue}>
          {busy ? "Saving reservation…" : "Save reservation"}
        </Button>
      </CardContent>
    </Card>
  );
}
