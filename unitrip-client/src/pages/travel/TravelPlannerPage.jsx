import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChoiceGroup from "@/travel/components/ChoiceGroup";
import { useTripPlanner } from "@/travel/context/plannerContext";
import {
  CURRENCIES,
  HOTEL_OPTIONS,
  INTERESTS,
  PLANNER_STEPS,
  SCOPES,
  TRANSPORT_OPTIONS,
  TRIP_TYPES,
} from "@/travel/data/options";
import { rememberTripEnquiry, tripEnquiryService } from "@/travel/services/tripEnquiry";
import { tripEnquiryPayload, validateTripRequest, validateTripStep } from "@/travel/validation/planner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function showDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function money(amount, currency) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);
}

export default function TravelPlannerPage() {
  const navigate = useNavigate();
  const { draft, updateDraft, clearDraft } = useTripPlanner();
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const step = draft.step;
  const current = PLANNER_STEPS[step - 1];

  function update(partial) {
    updateDraft(partial);
  }

  function goNext() {
    const nextErrors = validateTripStep(step, draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    updateDraft({ step: step + 1 });
    setErrors({});
  }

  function goBack() {
    updateDraft({ step: Math.max(1, step - 1) });
    setErrors({});
    setSubmitError("");
  }

  async function submit() {
    const nextErrors = validateTripRequest(draft);
    setErrors(nextErrors);
    const first = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find((item) =>
      Object.keys(validateTripStep(item, draft)).length > 0
    );
    if (first) {
      updateDraft({ step: first });
      return;
    }
    setSaving(true);
    setSubmitError("");
    try {
      const saved = await tripEnquiryService.submit(tripEnquiryPayload(draft));
      rememberTripEnquiry(saved.reference, { ...saved, enquiry: tripEnquiryPayload(draft) });
      clearDraft();
      navigate(`/travel-packages/confirmation/${saved.reference}`);
    } catch (error) {
      setSubmitError(error.message || "The request was not saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <p className="text-sm font-semibold text-primary">
        Step {step} of {PLANNER_STEPS.length}
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold">Plan a custom trip</h1>
      <p className="mt-2 text-muted-foreground">
        Tell us what you want. A UnitTrip travel expert reviews the request and prepares a quotation afterwards.
      </p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${(step / PLANNER_STEPS.length) * 100}%` }} />
      </div>
      <h2 className="mt-6 font-display text-2xl font-semibold">{current.title}</h2>

      <div className="mt-6 space-y-5">
        {step === 1 && (
          <>
            <Field id="destination" label="Destination" error={errors.destination}>
              <Input
                id="destination"
                value={draft.destination}
                onChange={(event) => update({ destination: event.target.value })}
                placeholder="Goa, Dubai, Kerala"
              />
            </Field>
            <div className="space-y-2">
              <Label>Domestic / International</Label>
              <ChoiceGroup options={SCOPES} value={draft.scope} onChange={(scope) => update({ scope })} />
              {errors.scope && <p className="text-sm text-destructive">{errors.scope}</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="departure" label="Departure date" error={errors.departureDate}>
                <Input
                  id="departure"
                  type="date"
                  value={draft.departureDate}
                  onChange={(event) => update({ departureDate: event.target.value })}
                />
              </Field>
              <Field id="return" label="Return date" error={errors.returnDate}>
                <Input
                  id="return"
                  type="date"
                  value={draft.returnDate}
                  onChange={(event) => update({ returnDate: event.target.value })}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.flexible}
                onChange={(event) => update({ flexible: event.target.checked })}
              />
              My dates are flexible
            </label>
          </>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="adults" label="Adults" error={errors.adults}>
              <Input id="adults" inputMode="numeric" value={draft.adults} onChange={(event) => update({ adults: event.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="children" label="Children" error={errors.children}>
              <Input id="children" inputMode="numeric" value={draft.children} onChange={(event) => update({ children: event.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="infants" label="Infants" error={errors.infants}>
              <Input id="infants" inputMode="numeric" value={draft.infants} onChange={(event) => update({ infants: event.target.value.replace(/\D/g, "") })} />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="budget-min" label="Minimum budget" error={errors.budgetMin}>
              <Input id="budget-min" inputMode="numeric" value={draft.budgetMin} onChange={(event) => update({ budgetMin: event.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="budget-max" label="Maximum budget" error={errors.budgetMax}>
              <Input id="budget-max" inputMode="numeric" value={draft.budgetMax} onChange={(event) => update({ budgetMax: event.target.value.replace(/\D/g, "") })} />
            </Field>
            <Field id="currency" label="Currency" error={errors.currency}>
              <SelectNative id="currency" value={draft.currency} onChange={(event) => update({ currency: event.target.value })}>
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </SelectNative>
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2">
            <ChoiceGroup options={HOTEL_OPTIONS} value={draft.hotel} onChange={(hotel) => update({ hotel })} />
            {errors.hotel && <p className="text-sm text-destructive">{errors.hotel}</p>}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-2">
            <ChoiceGroup options={TRIP_TYPES} multiple value={draft.tripTypes} onChange={(tripTypes) => update({ tripTypes })} />
            {errors.tripTypes && <p className="text-sm text-destructive">{errors.tripTypes}</p>}
          </div>
        )}

        {step === 7 && (
          <div className="space-y-2">
            <ChoiceGroup options={INTERESTS} multiple value={draft.interests} onChange={(interests) => update({ interests })} />
            {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
          </div>
        )}

        {step === 8 && (
          <div className="space-y-2">
            <ChoiceGroup options={TRANSPORT_OPTIONS} multiple value={draft.transport} onChange={(transport) => update({ transport })} />
            {errors.transport && <p className="text-sm text-destructive">{errors.transport}</p>}
          </div>
        )}

        {step === 9 && (
          <Field id="requirements" label="Special requirements" error={errors.requirements}>
            <Textarea
              id="requirements"
              className="min-h-40"
              value={draft.requirements}
              onChange={(event) => update({ requirements: event.target.value })}
              placeholder="Anniversary dinner, wheelchair access, vegetarian meals, or anything else the expert should know."
            />
          </Field>
        )}

        {step === 10 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Full name" error={errors.name}>
              <Input id="name" value={draft.name} onChange={(event) => update({ name: event.target.value })} />
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <Input id="email" type="email" value={draft.email} onChange={(event) => update({ email: event.target.value })} />
            </Field>
            <Field id="phone" label="Phone" error={errors.phone}>
              <Input id="phone" value={draft.phone} onChange={(event) => update({ phone: event.target.value })} />
            </Field>
            <Field id="whatsapp" label="WhatsApp number" error={errors.whatsapp}>
              <Input id="whatsapp" value={draft.whatsapp} onChange={(event) => update({ whatsapp: event.target.value })} />
            </Field>
          </div>
        )}

        {step === 11 && (
          <Review draft={draft} />
        )}
      </div>

      {submitError && <p className="mt-4 text-sm text-destructive">{submitError}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={goBack} disabled={saving}>
            Back
          </Button>
        )}
        {step < 11 ? (
          <Button type="button" onClick={goNext}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? "Sending request…" : "GET MY CUSTOM QUOTE"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Review({ draft }) {
  const hotel = HOTEL_OPTIONS.find((item) => item.value === draft.hotel)?.label || draft.hotel;
  const scope = SCOPES.find((item) => item.value === draft.scope)?.label || draft.scope;
  const rows = [
    ["Destination", `${draft.destination} · ${scope}`],
    ["Dates", `${showDate(draft.departureDate)} to ${showDate(draft.returnDate)}${draft.flexible ? " · flexible" : ""}`],
    ["Travellers", `${draft.adults} adults, ${draft.children} children, ${draft.infants} infants`],
    ["Budget", `${money(draft.budgetMin, draft.currency)} – ${money(draft.budgetMax, draft.currency)}`],
    ["Hotel", hotel],
    ["Trip type", draft.tripTypes.join(", ")],
    ["Interests", draft.interests.join(", ")],
    ["Transport", draft.transport.join(", ")],
    ["Special requirements", draft.requirements.trim() || "None"],
    ["Customer", `${draft.name} · ${draft.email}`],
    ["Phone", draft.phone],
    ["WhatsApp", draft.whatsapp],
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This sends your request to UnitTrip. A travel expert will review it. A quotation is not created by this form.
      </p>
      <dl className="divide-y divide-border rounded-xl border border-border">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
