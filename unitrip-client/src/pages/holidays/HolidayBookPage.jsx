import { use, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useHolidayBooking } from "@/holidays/context/bookingContext";
import { ROOM_PREFERENCES } from "@/holidays/data/options";
import { holidayPackagePromise } from "@/holidays/services/holidayCatalog";
import { localISODate } from "@/holidays/utils/dates";
import { validateHolidayBooking } from "@/holidays/validation/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";

function emptyBooking(travelPackage) {
  return {
    travelPackage,
    name: "",
    email: "",
    mobile: "",
    startDate: localISODate(14),
    endDate: localISODate(14 + travelPackage.durationNights),
    adults: 2,
    children: 0,
    room: "Deluxe",
    requirements: "",
  };
}

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export default function HolidayBookPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const travelPackage = use(holidayPackagePromise(slug));
  const { draft, setDraft } = useHolidayBooking();
  const [form, setForm] = useState(() =>
    draft?.travelPackage?.slug === slug ? draft : travelPackage ? emptyBooking(travelPackage) : null
  );
  const [boundSlug, setBoundSlug] = useState(slug);
  const [errors, setErrors] = useState({});

  if (travelPackage && boundSlug !== slug) {
    setBoundSlug(slug);
    setForm(draft?.travelPackage?.slug === slug ? draft : emptyBooking(travelPackage));
    setErrors({});
  }

  if (!travelPackage || !form) {
    return (
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-bold">Package not found</h1>
        <Button asChild className="mt-4">
          <Link to="/holiday-packages">Back to packages</Link>
        </Button>
      </div>
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateHolidayBooking(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setDraft({ ...form, travelPackage });
    navigate(`/holiday-packages/${slug}/summary`);
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <p className="text-sm text-muted-foreground">
        <Link to={`/holiday-packages/${slug}`} className="underline">
          {travelPackage.name}
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold">Book this holiday</h1>
      <p className="mt-2 text-muted-foreground">
        {travelPackage.destination} · {travelPackage.durationLabel}. This form saves a request. It does not confirm a departure.
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Customer name" error={errors.name}>
          <Input id="name" value={form.name} onChange={(event) => update("name", event.target.value)} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
        </Field>
        <Field id="mobile" label="Mobile" error={errors.mobile}>
          <Input id="mobile" value={form.mobile} onChange={(event) => update("mobile", event.target.value)} />
        </Field>
        <Field id="room" label="Room preference" error={errors.room}>
          <SelectNative id="room" value={form.room} onChange={(event) => update("room", event.target.value)}>
            {ROOM_PREFERENCES.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </SelectNative>
        </Field>
        <Field id="start" label="Travel start" error={errors.startDate}>
          <Input id="start" type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
        </Field>
        <Field id="end" label="Travel end" error={errors.endDate}>
          <Input id="end" type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} />
        </Field>
        <Field id="adults" label="Adults" error={errors.adults}>
          <Input
            id="adults"
            inputMode="numeric"
            value={form.adults}
            onChange={(event) => update("adults", event.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field id="children" label="Children" error={errors.children}>
          <Input
            id="children"
            inputMode="numeric"
            value={form.children}
            onChange={(event) => update("children", event.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id="requirements" label="Special requirements" error={errors.requirements}>
            <Textarea
              id="requirements"
              value={form.requirements}
              onChange={(event) => update("requirements", event.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit">Continue to summary</Button>
          <Button asChild type="button" variant="outline">
            <Link to={`/holiday-packages/${slug}`}>Back</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
