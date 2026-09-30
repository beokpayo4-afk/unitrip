import { useState } from "react";
import { bookingApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/utils/format";

/**
 * Post-booking paid add-on picker.
 * authMode: use bookingId + JWT; otherwise orderId + email.
 */
export default function AddOnsEditor({ ticket, orderId, email, onUpdated }) {
  const available = ticket?.availableAddOns || [];
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!ticket?.canModifyAddOns || available.length === 0) {
    return null;
  }

  function toggle(placeId) {
    setSelected((ids) =>
      ids.includes(placeId) ? ids.filter((id) => id !== placeId) : [...ids, placeId]
    );
  }

  const extra = available
    .filter((p) => selected.includes(p.placeId))
    .reduce((sum, p) => sum + (p.extraAmount || 0), 0);

  async function handleAdd() {
    setError("");
    if (selected.length === 0) {
      setError("Select at least one place");
      return;
    }
    setSaving(true);
    try {
      let res;
      if (ticket.id && localStorage.getItem("unitrip_token")) {
        res = await bookingApi.addAddOnsAuth({
          bookingId: ticket.id,
          placeIds: selected,
        });
      } else {
        res = await bookingApi.addAddOns({
          orderId: orderId || ticket.orderId,
          email: email || ticket.email,
          placeIds: selected,
        });
      }
      setSelected([]);
      onUpdated?.(res.booking);
    } catch (err) {
      setError(err.message || "Could not add places");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="no-print border-primary/40">
      <CardHeader>
        <CardTitle className="text-lg">Add nearby places</CardTitle>
        <CardDescription>
          Optional paid stops in or near {ticket.package?.city}. Distance-based pricing from the
          package.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {available.map((place) => (
          <label
            key={place.placeId}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/40"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={selected.includes(place.placeId)}
              onChange={() => toggle(place.placeId)}
            />
            <div className="flex-1 text-sm">
              <div className="font-semibold">{place.name}</div>
              {place.description && (
                <p className="text-muted-foreground">{place.description}</p>
              )}
              <p className="mt-1 text-muted-foreground">
                {place.distanceKm} km · +{formatINR(place.extraAmount)}
              </p>
            </div>
          </label>
        ))}
        {selected.length > 0 && (
          <p className="font-display text-sm font-bold">
            Extra: {formatINR(extra)} → new total{" "}
            {formatINR((ticket.totalAmount || 0) + extra)}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="button" disabled={saving || selected.length === 0} onClick={handleAdd}>
          {saving ? "Adding…" : "Add selected places"}
        </Button>
      </CardContent>
    </Card>
  );
}
