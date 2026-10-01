import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { catalogApi } from "@/api/client";
import { formatINR } from "@/utils/format";
import { placeImage } from "@/utils/placeImages";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

function PlaceGrid({ places, emptyLabel }) {
  if (!places?.length) {
    return (
      <p className="text-sm text-muted-foreground">{emptyLabel}</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <Link
          key={`${place.packageSlug}-${place.name}`}
          to={`/packages/${place.packageSlug}`}
          className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground"
        >
          <img
            src={placeImage(place)}
            alt={place.name}
            className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeImage({ ...place, name: "" });
            }}
          />
          <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold group-hover:underline">
              {place.name}
            </h3>
            {place.type === "paid_addon" && (
              <Badge variant="secondary">Add-on</Badge>
            )}
          </div>
          {place.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {place.description}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {[place.city, place.distanceKm ? `${place.distanceKm} km` : null]
              .filter(Boolean)
              .join(" · ")}
            {place.extraAmount > 0 ? ` · +${formatINR(place.extraAmount)}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            Via {place.packageTitle}
          </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function PackageList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [placesData, setPlacesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";
  const categorySlug = searchParams.get("categorySlug") || "";
  const search = searchParams.get("search") || "";
  const scope = searchParams.get("scope") || "";

  useEffect(() => {
    catalogApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (city) params.city = city;
    if (category) params.category = category;
    if (categorySlug) params.categorySlug = categorySlug;
    if (search) params.search = search;
    if (scope) params.scope = scope;
    catalogApi
      .packages(params)
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [city, category, categorySlug, search, scope]);

  useEffect(() => {
    if (!city) {
      setPlacesData(null);
      return;
    }
    catalogApi
      .places({ city })
      .then(setPlacesData)
      .catch(() => setPlacesData(null));
  }, [city]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "category") next.delete("categorySlug");
    if (key === "categorySlug") next.delete("category");
    setSearchParams(next);
  }

  const selectedCategoryValue =
    category ||
    categories.find((c) => c.slug === categorySlug)?._id ||
    "";

  const heading = city
    ? `${city} places & experiences`
    : scope === "international"
      ? "International experiences"
      : scope === "india"
        ? "India experiences"
        : "Experiences";

  const primaryPackages = city
    ? packages.filter(
        (pkg) => pkg.city?.toLowerCase() === city.toLowerCase()
      )
    : packages;
  const nearbyPackages = city
    ? packages.filter(
        (pkg) => pkg.city?.toLowerCase() !== city.toLowerCase()
      )
    : [];

  return (
    <div className="container-page py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold">{heading}</h1>
        <p className="mt-2 text-muted-foreground">
          {city
            ? `Places to visit in ${city}${
                placesData?.nearbyCities?.length
                  ? `, plus nearby spots in ${placesData.nearbyCities.slice(0, 4).join(", ")}`
                  : ""
              }`
            : scope === "international"
              ? "City tours and day trips beyond India"
              : "Find a package and book in minutes — India and international"}
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              value={search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Taj, Dubai, safari…"
            />
          </div>
          <div className="space-y-2">
            <Label>Region</Label>
            <SelectNative
              value={scope}
              onChange={(e) => updateFilter("scope", e.target.value)}
            >
              <option value="">All regions</option>
              <option value="india">India</option>
              <option value="international">International</option>
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={city}
              onChange={(e) => updateFilter("city", e.target.value)}
              placeholder="Delhi, Dubai…"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <SelectNative
              value={selectedCategoryValue}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </SelectNative>
          </div>
        </CardContent>
      </Card>

      {city && placesData && (
        <div className="mb-10 space-y-10">
          <section>
            <h2 className="font-display text-2xl font-bold">
              Places to visit in {city}
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              All stops and attractions available across packages in {city}
            </p>
            <PlaceGrid
              places={placesData.placesInCity}
              emptyLabel={`No places listed for ${city} yet.`}
            />
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold">
              Nearby places to explore
            </h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">
              Day trips and neighbouring cities around {city}
            </p>
            <PlaceGrid
              places={placesData.nearbyPlaces}
              emptyLabel={`No nearby places found around ${city} yet.`}
            />
          </section>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : packages.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          No packages match your filters.
        </p>
      ) : (
        <div className="space-y-10">
          <PackageSection
            title={city ? `Packages in ${city}` : "Packages"}
            packages={city ? primaryPackages : packages}
          />
          {city && nearbyPackages.length > 0 && (
            <PackageSection
              title={`Nearby packages around ${city}`}
              packages={nearbyPackages}
            />
          )}
        </div>
      )}
    </div>
  );
}

function PackageSection({ title, packages }) {
  if (!packages?.length) return null;
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl font-bold">{title}</h2>
      <div className="divide-y divide-border">
        {packages.map((pkg) => (
          <Link
            key={pkg._id}
            to={`/packages/${pkg.slug}`}
            className="grid gap-4 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[180px_1fr_auto] sm:items-center"
          >
            <img
              className="h-28 w-full rounded-xl object-cover sm:w-45"
              src={
                pkg.images?.[0] ||
                "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80"
              }
              alt={pkg.title}
            />
            <div>
              <div className="mb-2 flex flex-wrap gap-1">
                {pkg.country && pkg.country.toLowerCase() !== "india" && (
                  <Badge>International</Badge>
                )}
                {pkg.tags?.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
              <h3 className="font-display text-lg font-bold">{pkg.title}</h3>
              <p className="text-sm text-muted-foreground">
                {[pkg.city, pkg.country].filter(Boolean).join(", ")}
                {pkg.category?.name ? ` · ${pkg.category.name}` : ""}
              </p>
            </div>
            <div className="font-display text-lg font-bold">
              {formatINR(pkg.amount)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
