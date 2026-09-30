import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { bookingApi, catalogApi, ratingApi } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/utils/format";
import AddOnsEditor from "@/components/AddOnsEditor";
import PayButton from "@/components/PayButton";
import RatingForm from "@/components/RatingForm";
import TicketView from "@/components/TicketView";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PackageDetail() {
  const { slug } = useParams();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cartMsg, setCartMsg] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [form, setForm] = useState({
    travellerName: "",
    email: "",
    phone: "",
    travelDate: "",
    travellersCount: 1,
  });

  useEffect(() => {
    catalogApi
      .packageBySlug(slug)
      .then((data) => {
        setPkg(data);
        if (data?._id) {
          ratingApi.list(data._id).then(setRatings).catch(() => setRatings([]));
        }
      })
      .catch(() => setError("Package not found"));
  }, [slug]);

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

  const includedPlaces = (pkg?.places || []).filter((p) => p.type === "included");
  const paidPlaces = (pkg?.places || []).filter((p) => p.type === "paid_addon");

  function toggleAddOn(id) {
    setSelectedAddOns((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  const addOnsTotal = paidPlaces
    .filter((p) => selectedAddOns.includes(p._id))
    .reduce((sum, p) => sum + (Number(p.extraAmount) || 0), 0);

  const total =
    (pkg?.amount || 0) * (Number(form.travellersCount) || 1) + addOnsTotal;

  async function handleBook(e) {
    e.preventDefault();
    setError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/packages/${slug}` } });
      return;
    }
    if (isAdmin) {
      setError("Admin accounts cannot book. Use a traveller account.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bookingApi.create({
        packageId: pkg._id,
        ...form,
        travellersCount: Number(form.travellersCount) || 1,
        placeIds: selectedAddOns,
      });
      setTicket(res.booking);
    } catch (err) {
      setError(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAddToCart() {
    setCartMsg("");
    const selectedPlaces = paidPlaces.filter((p) => selectedAddOns.includes(p._id));
    addItem({
      packageId: pkg._id,
      title: pkg.title,
      slug: pkg.slug,
      city: pkg.city,
      amount: pkg.amount,
      image: pkg.images?.[0] || "",
      travellersCount: Number(form.travellersCount) || 1,
      travelDate: form.travelDate || "",
      placeIds: selectedAddOns,
      addOnsPreview: selectedPlaces.map((p) => p.name),
      addOnsAmount: addOnsTotal,
    });
    setCartMsg("Added to cart");
  }

  if (error && !pkg) {
    return (
      <div className="container-page py-12">
        <p className="text-destructive">{error}</p>
        <Button asChild variant="link" className="px-0">
          <Link to="/packages">Back to experiences</Link>
        </Button>
      </div>
    );
  }

  if (!pkg) return <div className="container-page py-12">Loading…</div>;

  return (
    <div className="container-page py-12">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <img
            className="aspect-16/10 w-full rounded-xl object-cover bg-muted"
            src={
              pkg.images?.[0] ||
              "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
            }
            alt={pkg.title}
          />
          <div className="mt-6">
            {pkg.category?.name && <Badge>{pkg.category.name}</Badge>}
            <h1 className="font-display mt-2 text-4xl font-bold">{pkg.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {pkg.city}, {pkg.state}, {pkg.country} · {formatINR(pkg.amount)} per traveller
              {pkg.ratingCount > 0 && (
                <> · ★ {pkg.averageRating} ({pkg.ratingCount})</>
              )}
            </p>
          </div>

          {pkg.about && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">About</h2>
              <p className="mt-2 text-muted-foreground">{pkg.about}</p>
            </section>
          )}

          {includedPlaces.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Included places</h2>
              <ul className="mt-2 space-y-2">
                {includedPlaces.map((p) => (
                  <li key={p._id} className="rounded-lg border border-border p-3 text-sm">
                    <strong>{p.name}</strong>
                    <span className="text-muted-foreground"> · {p.distanceKm || 0} km</span>
                    {p.description && (
                      <p className="mt-1 text-muted-foreground">{p.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {paidPlaces.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Optional paid places</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nearby stops you can add at booking or later from Track order.
              </p>
              <ul className="mt-2 space-y-2">
                {paidPlaces.map((p) => (
                  <li key={p._id} className="rounded-lg border border-border p-3 text-sm">
                    <strong>{p.name}</strong>
                    <span className="text-muted-foreground">
                      {" "}
                      · {p.distanceKm || 0} km · +{formatINR(p.extraAmount)}
                    </span>
                    {p.description && (
                      <p className="mt-1 text-muted-foreground">{p.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pkg.highlights?.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Highlights</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {pkg.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          )}

          {pkg.itinerary?.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Itinerary</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {pkg.itinerary.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {pkg.inclusions?.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold">Inclusions</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  {pkg.inclusions.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            {pkg.exclusions?.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold">Exclusions</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  {pkg.exclusions.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {pkg.pdfLinks?.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-xl font-bold">Downloads</h2>
              <ul className="mt-2 space-y-1">
                {pkg.pdfLinks.map((p) => (
                  <li key={p.url}>
                    <a
                      className="text-primary underline-offset-4 hover:underline"
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pkg.faqs?.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display mb-2 text-xl font-bold">FAQs</h2>
              <Accordion type="single" collapsible>
                {pkg.faqs.map((f, i) => (
                  <AccordionItem key={f._id || f.question} value={`faq-${i}`}>
                    <AccordionTrigger>{f.question}</AccordionTrigger>
                    <AccordionContent>{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {ratings.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display mb-2 text-xl font-bold">Traveller ratings</h2>
              <ul className="space-y-3">
                {ratings.map((r) => (
                  <li key={r._id} className="rounded-lg border border-border p-3 text-sm">
                    <strong>★ {r.stars}</strong>
                    <span className="text-muted-foreground"> · {r.user?.name || "Traveller"}</span>
                    {r.comment && <p className="mt-1 text-muted-foreground">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside>
          {ticket ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-primary">Booking created successfully.</p>
              <TicketView ticket={ticket} />
              <PayButton ticket={ticket} onPaid={setTicket} />
              <AddOnsEditor ticket={ticket} onUpdated={setTicket} />
              <RatingForm
                ticket={ticket}
                onRated={() => setTicket({ ...ticket, canRate: false, hasRated: true })}
              />
              <div className="no-print flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/track">Track later</Link>
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Book this trip</CardTitle>
                <CardDescription>
                  Book now, or add to cart with other experiences and checkout together.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleBook}>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Travel date</Label>
                      <Input
                        type="date"
                        required
                        value={form.travelDate}
                        onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Travellers</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={form.travellersCount}
                        onChange={(e) =>
                          setForm({ ...form, travellersCount: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {paidPlaces.length > 0 && (
                    <div className="space-y-2">
                      <Label>Add paid places (optional)</Label>
                      <div className="space-y-2">
                        {paidPlaces.map((p) => (
                          <label
                            key={p._id}
                            className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedAddOns.includes(p._id)}
                              onChange={() => toggleAddOn(p._id)}
                            />
                            <span>
                              <strong>{p.name}</strong>
                              <span className="text-muted-foreground">
                                {" "}
                                · {p.distanceKm || 0} km · +{formatINR(p.extraAmount)}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 text-sm">
                    <p>Package: {formatINR(pkg.amount * (Number(form.travellersCount) || 1))}</p>
                    {addOnsTotal > 0 && <p>Add-ons: {formatINR(addOnsTotal)}</p>}
                    <p className="font-display text-lg font-bold">Total: {formatINR(total)}</p>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {cartMsg && <p className="text-sm text-primary">{cartMsg}</p>}
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" type="submit" disabled={submitting}>
                      {isAuthenticated
                        ? submitting
                          ? "Booking…"
                          : "Book now"
                        : "Log in to book"}
                    </Button>
                    <Button
                      className="w-full"
                      type="button"
                      variant="outline"
                      onClick={handleAddToCart}
                    >
                      Add to cart
                    </Button>
                    <Button asChild variant="link" className="h-auto">
                      <Link to="/cart">View cart</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
