import { Link } from "react-router-dom";
import {
  Globe2,
  Leaf,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "Trusted & Secure",
    body: "Your safety and satisfaction are our top priorities.",
  },
  {
    icon: MapPin,
    title: "Wide Range of Destinations",
    body: "From India's hidden gems to global hotspots.",
  },
  {
    icon: Star,
    title: "Curated Experiences",
    body: "Handpicked tours, stays and activities for every traveler.",
  },
  {
    icon: Users,
    title: "Expert Support",
    body: "Our team is always here to help you, 24/7.",
  },
  {
    icon: Tag,
    title: "Best Value",
    body: "Great experiences at competitive prices.",
  },
  {
    icon: Globe2,
    title: "Sustainable Travel",
    body: "We support responsible tourism and local communities.",
  },
];

export default function About() {
  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">About us</p>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              About UNITRIP
            </h1>
            <p className="mt-3 text-lg font-medium text-foreground">
              Your Trusted Travel Partner for Unforgettable Journeys
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">UNITRIP TRAVELS PRIVATE LIMITED</strong>{" "}
              is a Delhi-based travel agency offering curated tours, transfers and experiences across
              India and select international destinations. We believe travel is not just about visiting
              new places, but about creating stories, discovering cultures and making memories for a
              lifetime.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1400&q=80"
              alt="Traveller looking out over mountains and a lake"
              className="aspect-4/3 w-full object-cover"
            />
            <p className="font-display absolute top-6 right-6 text-right text-3xl leading-tight font-semibold text-primary italic md:text-4xl">
              Explore
              <br />
              Dream
              <br />
              Discover
            </p>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-14 lg:grid-cols-2 lg:py-16">
        <div>
          <h2 className="font-display text-3xl font-bold">Our Story</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            At UNITRIP, we are passionate about travel and the incredible experiences it brings. Our
            journey started with a simple idea — to make travel easy, reliable and memorable for
            everyone. What began as a small team of travel enthusiasts has now grown into a trusted
            travel agency, helping thousands of travelers explore India and the world.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We work with a network of trusted partners, hotels, and local experts to ensure you get
            the best experiences, comfortable stays and seamless travel arrangements — all at the
            right value.
          </p>
          <Button asChild className="mt-8 rounded-full px-6">
            <Link to="/packages">
              Plan Your Next Trip
              <Sparkles className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold">Why Choose UNITRIP?</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {REASONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-primary/5 md:grid-cols-2">
          <div className="flex gap-4 p-6 md:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-primary">
              <Mountain className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Our Mission</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To make travel simple, accessible and memorable for every traveler.
              </p>
            </div>
          </div>
          <div className="flex gap-4 border-t border-border p-6 md:border-t-0 md:border-l md:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-primary">
              <Leaf className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Our Vision</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To be a leading travel partner, inspiring people to explore the world and experience
                more.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
