import { use, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PackageCard from "@/holidays/components/PackageCard";
import PackageFilters from "@/holidays/components/PackageFilters";
import { HOLIDAY_CATEGORIES } from "@/holidays/data/options";
import { publishedPackagesPromise } from "@/services/packageService";
import { EMPTY_FILTERS, filterHolidayPackages, holidayDestinations } from "@/holidays/services/filterPackages";
import { Button } from "@/components/ui/button";

export default function HolidayListPage() {
  const catalog = use(publishedPackagesPromise());
  const packages = useMemo(() => catalog.packages || [], [catalog]);
  const destinations = useMemo(() => holidayDestinations(packages), [packages]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const visible = filterHolidayPackages(packages, filters);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Holiday Packages</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            UnitTrip holidays with hotels, meals, and a day-by-day plan. This catalogue is sample data until the admin panel manages it.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/holiday-packages/bookings">My requests</Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={filters.category === "all" ? "default" : "outline"}
          onClick={() => setFilters({ ...filters, category: "all" })}
        >
          All
        </Button>
        {HOLIDAY_CATEGORIES.map((category) => (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={filters.category === category ? "default" : "outline"}
            onClick={() => setFilters({ ...filters, category })}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <PackageFilters
          filters={filters}
          destinations={destinations}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.length === 0 && (
            <p className="text-muted-foreground sm:col-span-2">No packages match these filters.</p>
          )}
          {visible.map((travelPackage) => (
            <PackageCard key={travelPackage.slug} travelPackage={travelPackage} />
          ))}
        </div>
      </div>
    </div>
  );
}
