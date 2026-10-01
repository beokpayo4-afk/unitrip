import { Suspense, use } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

function loadItineraries() {
  return Promise.all([adminApi.packages(), adminApi.holidayPackages()]).then(
    ([packages, holidays]) => ({ packages, holidays, error: "" }),
    (error) => ({ packages: [], holidays: [], error: error.message || "Could not load itineraries." })
  );
}

const request = loadItineraries();

function ItineraryLists() {
  const result = use(request);
  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  return (
    <div className="grid gap-8">
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Experience itineraries</h2>
        {result.packages.map((item) => (
          <article key={item._id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{item.title}</h3>
              <Link className="text-sm font-semibold text-primary underline" to={`/admin/packages/${item._id}`}>
                Edit
              </Link>
            </div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              {(item.itinerary || []).length === 0 && <li>No itinerary yet.</li>}
              {(item.itinerary || []).map((line, index) => (
                <li key={`${item._id}-${index}`}>{line}</li>
              ))}
            </ol>
          </article>
        ))}
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Holiday itineraries</h2>
        {result.holidays.map((item) => (
          <article key={item._id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">
                {item.name} · {item.destination}
              </h3>
              <Link className="text-sm font-semibold text-primary underline" to={`/admin/holiday-packages/${item._id}`}>
                Edit
              </Link>
            </div>
            <ol className="mt-2 space-y-2 text-sm text-muted-foreground">
              {(item.itinerary || []).length === 0 && <li>No itinerary yet.</li>}
              {(item.itinerary || []).map((day) => (
                <li key={`${item._id}-${day.day}`}>
                  <span className="font-semibold text-foreground">Day {day.day}. {day.title}</span>
                  <p>{day.description}</p>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function AdminItineraries() {
  return (
    <div>
      <AdminPageHeader title="Itineraries" description="Day plans for experience packages and holiday packages." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading itineraries…</p>}>
        <ItineraryLists />
      </Suspense>
    </div>
  );
}
