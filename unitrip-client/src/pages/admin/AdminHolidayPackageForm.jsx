import { Suspense, use, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "@/api/client";
import { HOLIDAY_CATEGORIES, HOTEL_CATEGORIES } from "@/holidays/data/options";
import { bumpHolidayCatalog } from "@/holidays/services/holidayCatalog";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";

const cache = new Map();

function loadPackage(id) {
  if (!id || id === "new") return Promise.resolve(null);
  if (!cache.has(id)) cache.set(id, adminApi.holidayPackage(id));
  return cache.get(id);
}

function blank() {
  return {
    name: "",
    destination: "",
    country: "India",
    scope: "domestic",
    categories: [],
    durationNights: 2,
    durationLabel: "",
    startingPrice: "",
    hotelCategory: "4 star",
    summary: "",
    overview: "",
    images: "",
    meals: "",
    transportation: "",
    inclusions: "",
    exclusions: "",
    cancellation: "",
    terms: "",
    published: false,
    itinerary: [{ day: 1, title: "", description: "" }],
  };
}

function fromRecord(item) {
  if (!item) return blank();
  return {
    ...blank(),
    ...item,
    startingPrice: item.startingPrice ?? "",
    images: (item.images || []).join("\n"),
    inclusions: (item.inclusions || []).join("\n"),
    exclusions: (item.exclusions || []).join("\n"),
    cancellation: (item.cancellation || []).join("\n"),
    terms: (item.terms || []).join("\n"),
    categories: item.categories || [],
    itinerary: item.itinerary?.length ? item.itinerary : [{ day: 1, title: "", description: "" }],
  };
}

function PackageForm({ existing }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => fromRecord(existing));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(partial) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function toggleCategory(category) {
    update({
      categories: form.categories.includes(category)
        ? form.categories.filter((item) => item !== category)
        : [...form.categories, category],
    });
  }

  function updateDay(index, partial) {
    update({
      itinerary: form.itinerary.map((day, dayIndex) => (dayIndex === index ? { ...day, ...partial } : day)),
    });
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...form,
      images: form.images,
      inclusions: form.inclusions,
      exclusions: form.exclusions,
      cancellation: form.cancellation,
      terms: form.terms,
      startingPrice: Number(form.startingPrice),
    };
    try {
      if (existing?._id) await adminApi.updateHolidayPackage(existing._id, body);
      else await adminApi.createHolidayPackage(body);
      bumpHolidayCatalog();
      navigate("/admin/holiday-packages");
    } catch (err) {
      setError(err.message || "Could not save the package.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-4">
      <AdminAlert>{error}</AdminAlert>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Package name</Label>
          <Input id="name" value={form.name} onChange={(event) => update({ name: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" value={form.destination} onChange={(event) => update({ destination: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={form.country} onChange={(event) => update({ country: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scope">Domestic / International</Label>
          <SelectNative id="scope" value={form.scope} onChange={(event) => update({ scope: event.target.value })}>
            <option value="domestic">Domestic</option>
            <option value="international">International</option>
          </SelectNative>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nights">Nights</Label>
          <Input id="nights" inputMode="numeric" value={form.durationNights} onChange={(event) => update({ durationNights: event.target.value.replace(/\D/g, "") })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration label</Label>
          <Input id="duration" value={form.durationLabel} onChange={(event) => update({ durationLabel: event.target.value })} placeholder="5 days / 4 nights" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Starting price (INR)</Label>
          <Input id="price" inputMode="numeric" value={form.startingPrice} onChange={(event) => update({ startingPrice: event.target.value.replace(/\D/g, "") })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hotel">Hotel category</Label>
          <SelectNative id="hotel" value={form.hotelCategory} onChange={(event) => update({ hotelCategory: event.target.value })}>
            {HOTEL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectNative>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Package categories</Label>
        <div className="flex flex-wrap gap-2">
          {HOLIDAY_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={form.categories.includes(category)}
              onClick={() => toggleCategory(category)}
              className={`rounded-full border px-3 py-1 text-sm ${form.categories.includes(category) ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Short description</Label>
        <Textarea id="summary" value={form.summary} onChange={(event) => update({ summary: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="overview">Overview</Label>
        <Textarea id="overview" value={form.overview} onChange={(event) => update({ overview: event.target.value })} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Itinerary</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => update({ itinerary: [...form.itinerary, { day: form.itinerary.length + 1, title: "", description: "" }] })}
          >
            Add day
          </Button>
        </div>
        {form.itinerary.map((day, index) => (
          <div key={day.day || index} className="grid gap-2 rounded-lg border border-border p-3">
            <Input value={day.title} placeholder={`Day ${index + 1} title`} onChange={(event) => updateDay(index, { title: event.target.value, day: index + 1 })} />
            <Textarea value={day.description} placeholder="What happens this day" onChange={(event) => updateDay(index, { description: event.target.value })} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meals">Meals</Label>
          <Textarea id="meals" value={form.meals} onChange={(event) => update({ meals: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="transport">Transportation</Label>
          <Textarea id="transport" value={form.transportation} onChange={(event) => update({ transportation: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inclusions">Inclusions (one per line)</Label>
          <Textarea id="inclusions" value={form.inclusions} onChange={(event) => update({ inclusions: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exclusions">Exclusions (one per line)</Label>
          <Textarea id="exclusions" value={form.exclusions} onChange={(event) => update({ exclusions: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cancellation">Cancellation (one per line)</Label>
          <Textarea id="cancellation" value={form.cancellation} onChange={(event) => update({ cancellation: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Terms (one per line)</Label>
          <Textarea id="terms" value={form.terms} onChange={(event) => update({ terms: event.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="images">Image URLs (one per line)</Label>
        <Textarea id="images" value={form.images} onChange={(event) => update({ images: event.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(event) => update({ published: event.target.checked })} />
        Published
      </label>
      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save package"}
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/holiday-packages">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}

function Editor({ id }) {
  const existing = use(loadPackage(id));
  return <PackageForm key={existing?._id || "new"} existing={existing} />;
}

export default function AdminHolidayPackageForm() {
  const { id } = useParams();
  return (
    <div>
      <AdminPageHeader title={id ? "Edit holiday package" : "Add holiday package"} />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading package…</p>}>
        <Editor id={id} />
      </Suspense>
    </div>
  );
}
