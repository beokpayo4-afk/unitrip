import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useHolidayBooking } from "@/holidays/context/bookingContext";
import { nightCount, showDate } from "@/holidays/utils/dates";
import { formatINR } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HolidaySummaryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { draft, fare, confirmBooking } = useHolidayBooking();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!draft?.travelPackage || draft.travelPackage.slug !== slug || !fare) {
    return (
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-bold">Add traveller details first</h1>
        <Button asChild className="mt-4">
          <Link to={`/holiday-packages/${slug}/book`}>Go to booking</Link>
        </Button>
      </div>
    );
  }

  const nights = nightCount(draft.startDate, draft.endDate);
  const packageNights = draft.travelPackage.durationNights;

  async function confirm() {
    setSaving(true);
    setError("");
    try {
      const saved = await confirmBooking();
      if (saved) navigate(`/holiday-packages/confirmation/${saved.reference}`);
    } catch (err) {
      setError(err.message || "The request was not saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="font-display text-4xl font-bold">Booking summary</h1>
      <p className="mt-2 text-muted-foreground">
        Sample estimate. Saving this request does not confirm the departure or take a payment.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{draft.travelPackage.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            {draft.travelPackage.destination} · {draft.travelPackage.durationLabel}
          </p>
          <p>
            {showDate(draft.startDate)} to {showDate(draft.endDate)} ({nights} nights)
          </p>
          {nights !== packageNights && (
            <p className="text-muted-foreground">
              This catalogue plan is {packageNights} nights. Your dates are {nights} nights, so the estimate still uses the starting price.
            </p>
          )}
          <p>
            {draft.name} · {draft.email} · {draft.mobile}
          </p>
          <p>
            {Number(draft.adults) === 1 ? "1 adult" : `${draft.adults} adults`},{" "}
            {Number(draft.children) === 1 ? "1 child" : `${draft.children} children`} · {draft.room} room
          </p>
          {draft.requirements && <p>Requirements: {draft.requirements}</p>}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Estimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span>Travellers</span>
            <span>{formatINR(fare.base)}</span>
          </p>
          <p className="flex justify-between">
            <span>Taxes</span>
            <span>{formatINR(fare.taxes)}</span>
          </p>
          <p className="flex justify-between">
            <span>Service fee</span>
            <span>{formatINR(fare.fees)}</span>
          </p>
          <p className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatINR(fare.total)}</span>
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={confirm} disabled={saving}>
          {saving ? "Saving…" : "Save request"}
        </Button>
        {error && <p className="w-full text-sm text-destructive">{error}</p>}
        <Button asChild variant="outline">
          <Link to={`/holiday-packages/${slug}/book`}>Edit details</Link>
        </Button>
      </div>
    </div>
  );
}
