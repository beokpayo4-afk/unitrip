import { useState } from "react";
import { bookingApi } from "@/api/client";
import AddOnsEditor from "@/components/AddOnsEditor";
import PayButton from "@/components/PayButton";
import TicketView from "@/components/TicketView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setTicket(null);
    setLoading(true);
    try {
      setTicket(await bookingApi.track({ orderId, email }));
    } catch (err) {
      setError(err.message || "Could not find booking");
    } finally {
      setLoading(false);
    }
  }

  async function redownload() {
    setError("");
    setLoading(true);
    try {
      setTicket(await bookingApi.ticket(orderId, email));
    } catch (err) {
      setError(err.message || "Could not redownload ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">Track your order</h1>
        <p className="mt-2 text-muted-foreground">
          Enter Order ID and email to view, pay, download PDF, or add nearby places
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Find booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input
                  required
                  placeholder="UT-20250821-ABCD"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Searching…" : "Track order"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading || !orderId || !email}
                  onClick={redownload}
                >
                  Refresh ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {ticket ? (
            <>
              <TicketView ticket={ticket} />
              <PayButton ticket={ticket} onPaid={setTicket} />
              <AddOnsEditor
                ticket={ticket}
                orderId={orderId}
                email={email}
                onUpdated={setTicket}
              />
            </>
          ) : (
            <p className="py-10 text-center text-muted-foreground">Your ticket will appear here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
