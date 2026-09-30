import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingApi } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import CartPayButton from "@/components/CartPayButton";
import TicketView from "@/components/TicketView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/utils/format";

export default function Cart() {
  const { items, subtotal, updateItem, removeItem, clearCart } = useCart();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    travellerName: "",
    email: "",
    phone: "",
    travelDate: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (user && !isAdmin) {
      setForm((f) => ({
        ...f,
        travellerName: user.name || f.travellerName,
        email: user.email || f.email,
        phone: user.phone || f.phone,
      }));
    }
  }, [user, isAdmin]);

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (isAdmin) {
      setError("Admin accounts cannot checkout. Use a traveller account.");
      return;
    }
    if (!items.length) {
      setError("Cart is empty");
      return;
    }
    for (const item of items) {
      if (!item.travelDate && !form.travelDate) {
        setError("Set a travel date on the form or on each cart item");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await bookingApi.checkout({
        ...form,
        items: items.map((i) => ({
          packageId: i.packageId,
          travellersCount: i.travellersCount,
          placeIds: i.placeIds || [],
          travelDate: i.travelDate || form.travelDate,
        })),
      });
      clearCart();
      setResult(res);
    } catch (err) {
      setError(err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="container-page space-y-6 py-12">
        <div>
          <h1 className="font-display text-4xl font-bold">Checkout complete</h1>
          <p className="mt-2 text-muted-foreground">
            Cart group <strong>{result.cartGroupId}</strong> · {result.bookings.length} booking(s) ·
            Total {formatINR(result.grandTotal)}
          </p>
        </div>
        <CartPayButton
          cartGroupId={result.cartGroupId}
          grandTotal={result.grandTotal}
          paymentAvailable={result.upiEnabled || result.razorpayEnabled}
          upiPayment={result.upiPayment}
          razorpayAvailable={result.razorpayEnabled}
          onPaid={(data) =>
            setResult({ ...result, bookings: data.bookings, paid: true })
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {result.bookings.map((b) => (
            <TicketView key={b.id} ticket={b} />
          ))}
        </div>
        <Button asChild variant="outline">
          <Link to="/my-bookings">Go to my bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">Cart</h1>
        <p className="mt-2 text-muted-foreground">
          Add multiple experiences, then checkout once
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="mt-4">
              <Link to="/packages">Browse experiences</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-[100px_1fr_auto]">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=200&q=80"
                    }
                    alt=""
                    className="h-24 w-full rounded-lg object-cover sm:w-25"
                  />
                  <div>
                    <Link to={`/packages/${item.slug}`} className="font-display text-lg font-bold hover:text-primary">
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.city}</p>
                    {item.addOnsPreview?.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Add-ons: {item.addOnsPreview.join(", ")}
                      </p>
                    )}
                    <div className="mt-3 grid max-w-sm grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Travellers</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.travellersCount}
                          onChange={(e) =>
                            updateItem(item.id, {
                              travellersCount: Number(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Travel date</Label>
                        <Input
                          type="date"
                          value={item.travelDate}
                          onChange={(e) =>
                            updateItem(item.id, { travelDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold">
                      {formatINR(
                        item.amount * item.travellersCount + (item.addOnsAmount || 0)
                      )}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="mt-2"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Subtotal {formatINR(subtotal)} · {items.length} experience(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCheckout}>
                <div className="space-y-2">
                  <Label>Traveller name</Label>
                  <Input
                    required
                    value={form.travellerName}
                    onChange={(e) => setForm({ ...form, travellerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default travel date</Label>
                  <Input
                    type="date"
                    required
                    value={form.travelDate}
                    onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used when an item has no date of its own.
                  </p>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button className="w-full" type="submit" disabled={submitting}>
                  {isAuthenticated
                    ? submitting
                      ? "Placing order…"
                      : "Checkout cart"
                    : "Log in to checkout"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
