import { useState } from "react";
import { ratingApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RatingForm({ ticket, onRated }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!ticket?.canRate) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await ratingApi.create({
        bookingId: ticket.id,
        stars: Number(stars),
        comment,
      });
      onRated?.();
    } catch (err) {
      setError(err.message || "Could not submit rating");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="no-print">
      <CardHeader>
        <CardTitle className="text-lg">Rate this experience</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Stars</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              value={stars}
              onChange={(e) => setStars(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What stood out?"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Submitting…" : "Submit rating"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
