import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { catalogApi } from "@/api/client";
import { formatINR } from "@/utils/format";
import { destinationImage } from "@/utils/destinationImages";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const scope = searchParams.get("scope") || "";

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (scope) params.scope = scope;
    catalogApi
      .destinations(params)
      .then(setDestinations)
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, [scope]);

  function updateScope(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("scope", value);
    else next.delete("scope");
    setSearchParams(next);
  }

  return (
    <div className="container-page py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold">Destinations</h1>
          <p className="mt-2 text-muted-foreground">
            Browse experiences by city — India and international
          </p>
        </div>
        <div className="w-full space-y-2 sm:w-52">
          <Label>Region</Label>
          <SelectNative value={scope} onChange={(e) => updateScope(e.target.value)}>
            <option value="">All regions</option>
            <option value="india">India</option>
            <option value="international">International</option>
          </SelectNative>
        </div>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : destinations.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No destinations yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link
              key={`${d.city}-${d.state}-${d.country}`}
              to={`/packages?city=${encodeURIComponent(d.city)}${
                d.country && d.country.toLowerCase() !== "india"
                  ? "&scope=international"
                  : ""
              }`}
              className="group relative isolate min-h-56 overflow-hidden rounded-xl text-white transition-transform hover:-translate-y-1"
            >
              <img
                src={destinationImage(d.city, d.image)}
                alt={d.city}
                className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-4 bottom-4">
                <h3 className="font-display text-xl font-bold">{d.city}</h3>
                <p className="text-sm text-white/90">
                  {d.country}
                  {d.state && d.state !== d.country ? ` · ${d.state}` : ""} · {d.packageCount}{" "}
                  packages · From {formatINR(d.fromAmount)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
