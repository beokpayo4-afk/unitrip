import { use, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useHolidayBooking } from "@/holidays/context/bookingContext";
import { packageDetailsPromise } from "@/services/packageService";
import { validateHolidayEnquiry } from "@/holidays/validation/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HolidayEnquiryPage() {
  const { slug } = useParams();
  const travelPackage = use(packageDetailsPromise(slug));
  const { submitEnquiry } = useHolidayBooking();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    message: travelPackage ? `I would like to know more about ${travelPackage.name}.` : "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(null);

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

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateHolidayEnquiry(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const enquiry = submitEnquiry({
      ...form,
      packageSlug: travelPackage.slug,
      packageName: travelPackage.name,
    });
    setSaved(enquiry);
  }

  if (saved) {
    return (
      <div className="container-page max-w-xl py-10">
        <h1 className="font-display text-4xl font-bold">Enquiry saved</h1>
        <p className="mt-2 text-muted-foreground">
          Reference {saved.reference}. It is stored in this browser and has not been emailed to UNITRIP.
        </p>
        <Button asChild className="mt-6">
          <Link to={`/holiday-packages/${slug}`}>Back to package</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page max-w-xl py-10">
      <h1 className="font-display text-4xl font-bold">Send enquiry</h1>
      <p className="mt-2 text-muted-foreground">{travelPackage.name}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="enquiry-name">Name</Label>
          <Input id="enquiry-name" value={form.name} onChange={(event) => update("name", event.target.value)} />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enquiry-email">Email</Label>
          <Input id="enquiry-email" value={form.email} onChange={(event) => update("email", event.target.value)} />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enquiry-mobile">Mobile</Label>
          <Input id="enquiry-mobile" value={form.mobile} onChange={(event) => update("mobile", event.target.value)} />
          {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="enquiry-message">Message</Label>
          <Textarea id="enquiry-message" value={form.message} onChange={(event) => update("message", event.target.value)} />
          {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
        </div>
        <Button type="submit">Save enquiry</Button>
      </form>
    </div>
  );
}
