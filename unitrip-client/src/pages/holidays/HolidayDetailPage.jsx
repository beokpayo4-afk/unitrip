import { use } from "react";
import { Link, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import PackageGallery from "@/holidays/components/PackageGallery";
import { packageDetailsPromise } from "@/services/packageService";
import { whatsappEnquiryUrl } from "@/holidays/services/holidayBookings";
import { formatINR } from "@/utils/format";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function BulletList({ items }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function HolidayDetailPage() {
  const { slug } = useParams();
  const travelPackage = use(packageDetailsPromise(slug));

  if (!travelPackage) {
    return (
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-bold">Package not found</h1>
        <Button asChild className="mt-4">
          <Link to="/holiday-packages">Back to packages</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <PackageGallery images={travelPackage.images} name={travelPackage.name} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap gap-2">
              {travelPackage.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">{travelPackage.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {travelPackage.destination}, {travelPackage.country} · {travelPackage.durationLabel}
            </p>
            {travelPackage.rating != null && (
              <p className="mt-2 flex items-center gap-1 text-sm">
                <Star className="size-4 fill-accent text-accent" />
                {travelPackage.rating} · {travelPackage.reviewCount} ratings
              </p>
            )}
            <p className="mt-4 text-2xl font-semibold">From {formatINR(travelPackage.startingPrice)}</p>
            <p className="mt-4 max-w-3xl text-muted-foreground">{travelPackage.overview}</p>
          </div>

          <section>
            <h2 className="font-display text-2xl font-semibold">Day-by-day itinerary</h2>
            <ol className="mt-4 space-y-4">
              {travelPackage.itinerary.map((day) => (
                <li key={day.day} className="rounded-xl border border-border p-4">
                  <p className="text-sm font-semibold text-primary">Day {day.day}</p>
                  <p className="font-semibold">{day.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{day.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hotels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {travelPackage.hotels.map((hotel) => (
                  <p key={hotel.name}>
                    {hotel.name} · {hotel.category} · {hotel.nights} nights
                  </p>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Meals</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{travelPackage.meals}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transportation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{travelPackage.transportation}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList items={travelPackage.activities} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList items={travelPackage.inclusions} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Exclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <BulletList items={travelPackage.exclusions} />
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Cancellation policy</h2>
            <div className="mt-3">
              <BulletList items={travelPackage.cancellation} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">Terms and conditions</h2>
            <div className="mt-3">
              <BulletList items={travelPackage.terms} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold">FAQs</h2>
            <Accordion type="single" collapsible className="mt-3">
              {travelPackage.faqs.map((item) => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="h-fit space-y-3 lg:sticky lg:top-24">
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm text-muted-foreground">Starting price per adult</p>
              <p className="text-2xl font-semibold">{formatINR(travelPackage.startingPrice)}</p>
              <Button asChild className="w-full">
                <Link to={`/holiday-packages/${travelPackage.slug}/book`}>Book Now</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/holiday-packages/${travelPackage.slug}/enquiry`}>Send Enquiry</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <a href={whatsappEnquiryUrl(travelPackage)} target="_blank" rel="noreferrer">
                  WhatsApp Enquiry
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
