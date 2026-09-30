import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileText, MapPin, Shield, Smartphone } from "lucide-react";
import { catalogApi } from "@/api/client";
import { formatINR } from "@/utils/format";
import { destinationImage } from "@/utils/destinationImages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRUST_ITEMS = [
  "All-inclusive pricing — GST shown before you pay",
  "Verified local partners across India & abroad",
  "Secure UPI checkout",
  "Instant confirmation & PDF ticket",
  "Track order anytime",
];

const CITY_BLURBS = {
  Delhi: "Capital of India",
  Mumbai: "City of Dreams",
  Jaipur: "The Pink City",
  Goa: "Sun, sand & adventure",
  Agra: "Home of the Taj Mahal",
  Udaipur: "City of Lakes",
  Jaisalmer: "The Golden City",
  Jodhpur: "The Blue City",
  Dubai: "Desert meets skyline",
  Bangkok: "Temples & river life",
  Singapore: "Garden city",
};

const STEPS = [
  {
    n: "1",
    title: "Pick your experience",
    body: "Browse by destination or category, open a trip, and see exactly what’s included.",
  },
  {
    n: "2",
    title: "Pay securely by UPI",
    body: "Checkout in seconds with secure payment. Pricing stays transparent before you confirm.",
  },
  {
    n: "3",
    title: "Get your ticket",
    body: "Confirmation and PDF ticket land instantly — download anytime from Track order or My bookings.",
  },
];

const WHY = [
  {
    icon: FileText,
    title: "Instant PDF ticket",
    body: "Your itinerary and order details are ready the moment payment clears.",
  },
  {
    icon: Shield,
    title: "Clear inclusions",
    body: "Know what’s covered, what’s optional, and what you’ll pay — no surprise markups.",
  },
  {
    icon: Smartphone,
    title: "Secure UPI checkout",
    body: "Pay with UPI, cards or netbanking when Razorpay is configured.",
  },
  {
    icon: MapPin,
    title: "India & international",
    body: "Private city tours and day experiences at home and select destinations abroad.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Booked a Delhi day tour at night, had confirmation and the PDF by morning. Driver was on time and the guide knew every photo stop.",
    name: "Ananya R.",
    place: "Bengaluru · Family trip",
  },
  {
    quote:
      "Transparent price, easy UPI, and we could track the order without calling anyone. Exactly what we needed for Agra.",
    name: "Vikram S.",
    place: "Pune · Couple",
  },
  {
    quote:
      "Added a paid place later from Track order — smooth. Will book international next through UNITRIP.",
    name: "Meera K.",
    place: "Delhi · Solo traveller",
  },
];

function cityBlurb(city, country) {
  if (CITY_BLURBS[city]) return CITY_BLURBS[city];
  if (country && country.toLowerCase() !== "india") return country;
  return country || "Explore more";
}

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    catalogApi.destinations().then(setDestinations).catch(() => setDestinations([]));
    catalogApi.packages().then(setPackages).catch(() => setPackages([]));
    catalogApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const featured = packages.slice(0, 4);
  const newest = [...packages].slice(0, 4);
  const experienceCount = packages.length;
  const topicCount = categories.length || 0;
  const destCount = destinations.length;

  return (
    <>
      {/* Trust ticker */}
      <div className="overflow-hidden border-b border-border bg-sidebar text-sidebar-foreground no-print">
        <div className="trust-marquee flex w-max gap-10 py-2.5 text-xs font-medium tracking-wide text-sidebar-foreground/85">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} className="flex shrink-0 items-center gap-2">
              <CheckCircle2 className="size-3.5 text-accent" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Hero — one composition */}
      <section className="relative flex min-h-[min(88vh,720px)] items-end overflow-hidden text-white">
        <img
          src="/images/world-earth-hero.png"
          alt="Planet Earth from space"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/25 via-black/50 to-black/85" />
        <div className="container-page relative z-10 py-14 hero-animate">
          <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
            Tours · Transfers · Experiences
          </p>
          <p className="font-display mt-3 text-5xl font-bold tracking-tight md:text-7xl">UNITRIP</p>
          <h1 className="font-sans mt-4 max-w-[20ch] text-2xl font-medium tracking-wide text-white/95 md:text-4xl">
            Explore incredible India — and beyond
          </h1>
          <p className="mt-4 max-w-[42ch] text-base font-light leading-relaxed text-white/88 md:text-lg">
            Private city tours, transfers and curated day trips with transparent pricing and instant
            confirmation — from UNITRIP TRAVELS, Delhi.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/packages">Browse all trips</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/packages?scope=international">International</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            { value: experienceCount ? `${experienceCount}+` : "Ready", label: "Experiences" },
            { value: "Instant", label: "Confirmation" },
            { value: topicCount ? String(topicCount) : "—", label: "Topics covered" },
            { value: destCount ? String(destCount) : "—", label: "Destinations" },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-display text-3xl font-bold tracking-tight text-primary md:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-wide text-primary">Explore</p>
              <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
                Popular <em className="not-italic text-primary">destinations</em>
              </h2>
            </div>
            <Button asChild variant="link" className="shrink-0">
              <Link to="/destinations">All destinations</Link>
            </Button>
          </div>
          {destinations.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              Destinations will appear once packages are published.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.slice(0, 8).map((d, i) => (
                <Link
                  key={`${d.city}-${d.state}-${d.country}`}
                  to={`/packages?city=${encodeURIComponent(d.city)}`}
                  className="group relative isolate min-h-52 overflow-hidden text-white transition-transform duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <img
                      src={destinationImage(d.city, d.image)}
                      alt={d.city}
                      className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <h3 className="font-display text-xl font-bold">{d.city}</h3>
                    <p className="mt-0.5 text-sm text-white/85">
                      {cityBlurb(d.city, d.country)} · {d.packageCount} activities · From{" "}
                      {formatINR(d.fromAmount)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best sellers / featured */}
      <section id="best-sellers" className="scroll-mt-24 bg-muted/40 py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-wide text-primary">Traveller favourites</p>
              <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
                Best-selling <em className="not-italic text-primary">experiences</em>
              </h2>
            </div>
            <Button asChild variant="link" className="shrink-0">
              <Link to="/packages">See all</Link>
            </Button>
          </div>
          {featured.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              No packages yet. Admin can add them from the dashboard.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {featured.map((pkg) => (
                <Link
                  key={pkg._id}
                  to={`/packages/${pkg.slug}`}
                  className="group grid gap-4 sm:grid-cols-[140px_1fr] sm:items-start"
                >
                  <img
                    className="h-36 w-full object-cover sm:h-full sm:min-h-36"
                    src={
                      pkg.images?.[0] ||
                      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={pkg.title}
                  />
                  <div className="flex min-h-full flex-col py-0.5">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {pkg.category?.name && <Badge variant="secondary">{pkg.category.name}</Badge>}
                      {pkg.country && pkg.country.toLowerCase() !== "india" && (
                        <Badge>International</Badge>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-bold leading-snug group-hover:text-primary">
                      {pkg.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {[pkg.city, pkg.country].filter(Boolean).join(" · ")}
                      {pkg.about ? ` — ${pkg.about}` : ""}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <span className="font-display text-lg font-bold">{formatINR(pkg.amount)}</span>
                      <span className="text-sm font-medium text-primary">Book now →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="text-sm font-medium tracking-wide text-primary">
              From booking to confirmed in minutes
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
              How it <em className="not-italic text-primary">works</em>
            </h2>
          </div>
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span className="font-display text-5xl font-bold text-accent/90">{step.n}</span>
                <h3 className="font-display mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why UNITRIP */}
      <section className="border-y border-border bg-sidebar py-16 text-sidebar-foreground">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="text-sm font-medium tracking-wide text-accent">Why travellers choose us</p>
            <h2 className="font-display mt-1 text-3xl font-bold text-white md:text-4xl">
              Built for real trips, not fluff
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-sidebar-foreground/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="text-sm font-medium tracking-wide text-primary">Loved on the road</p>
            <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
              Results people <em className="not-italic text-primary">actually felt</em>
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="border-l-2 border-accent pl-5">
                <p className="text-sm leading-relaxed text-foreground/90">“{t.quote}”</p>
                <footer className="mt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.place}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Newest + CTA */}
      <section className="bg-muted/40 py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium tracking-wide text-primary">Fresh off the press</p>
              <h2 className="font-display mt-1 text-3xl font-bold md:text-4xl">
                Newest <em className="not-italic text-primary">experiences</em>
              </h2>
            </div>
            <Button asChild variant="link" className="shrink-0">
              <Link to="/packages">View all</Link>
            </Button>
          </div>
          {newest.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">New trips will show here soon.</p>
          ) : (
            <div className="divide-y divide-border">
              {newest.map((pkg) => (
                <Link
                  key={pkg._id}
                  to={`/packages/${pkg.slug}`}
                  className="grid gap-4 py-4 transition-colors hover:bg-background/60 sm:grid-cols-[160px_1fr_auto] sm:items-center"
                >
                  <img
                    className="h-24 w-full object-cover sm:h-28"
                    src={
                      pkg.images?.[0] ||
                      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={pkg.title}
                  />
                  <div>
                    {pkg.category?.name && (
                      <Badge variant="secondary" className="mb-2">
                        {pkg.category.name}
                      </Badge>
                    )}
                    <h3 className="font-display text-lg font-bold">{pkg.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {[pkg.city, pkg.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="font-display text-lg font-bold">{formatINR(pkg.amount)}</div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-14 border-t border-border pt-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Your next experience is <em className="not-italic text-primary">one click away</em>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Transparent pricing, secure checkout, and a PDF ticket you can keep — book India or
              international trips with UNITRIP.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/packages">Browse experiences</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/destinations">Popular destinations</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
