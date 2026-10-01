import { COUNTRIES } from "../data/airports";
import { GENDERS, TITLES, passengerTypeLabel } from "../validation/passengers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} required>
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function PassengerDetailsForm({ passengers, errors, international, onChange, onSubmit }) {
  function patch(index, partial) {
    onChange(passengers.map((passenger, i) => (i === index ? { ...passenger, ...partial } : passenger)));
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {international && (
        <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Passport details are required because this sample itinerary leaves India.
        </p>
      )}
      {passengers.map((passenger, index) => {
        const fieldErrors = errors[index] || {};
        const legend = passengerTypeLabel(passenger.type, index, passengers);
        return (
          <Card key={`${passenger.type}-${index}`}>
            <CardHeader>
              <CardTitle>{legend}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field id={`title-${index}`} label="Title" error={fieldErrors.title}>
                <SelectNative
                  id={`title-${index}`}
                  value={passenger.title}
                  onChange={(event) => patch(index, { title: event.target.value })}
                >
                  <option value="">Select</option>
                  {TITLES.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field id={`gender-${index}`} label="Gender" error={fieldErrors.gender}>
                <SelectNative
                  id={`gender-${index}`}
                  value={passenger.gender}
                  onChange={(event) => patch(index, { gender: event.target.value })}
                >
                  <option value="">Select</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field id={`first-${index}`} label="First name" error={fieldErrors.firstName}>
                <Input
                  id={`first-${index}`}
                  value={passenger.firstName}
                  autoComplete="given-name"
                  onChange={(event) => patch(index, { firstName: event.target.value })}
                />
              </Field>
              <Field id={`last-${index}`} label="Last name" error={fieldErrors.lastName}>
                <Input
                  id={`last-${index}`}
                  value={passenger.lastName}
                  autoComplete="family-name"
                  onChange={(event) => patch(index, { lastName: event.target.value })}
                />
              </Field>
              <Field id={`dob-${index}`} label="Date of birth" error={fieldErrors.dateOfBirth}>
                <Input
                  id={`dob-${index}`}
                  type="date"
                  value={passenger.dateOfBirth}
                  onChange={(event) => patch(index, { dateOfBirth: event.target.value })}
                />
              </Field>
              <Field id={`nation-${index}`} label="Nationality" error={fieldErrors.nationality}>
                <SelectNative
                  id={`nation-${index}`}
                  value={passenger.nationality}
                  onChange={(event) => patch(index, { nationality: event.target.value })}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field id={`email-${index}`} label="Email" error={fieldErrors.email}>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={passenger.email}
                  autoComplete="email"
                  onChange={(event) => patch(index, { email: event.target.value })}
                />
              </Field>
              <Field id={`mobile-${index}`} label="Mobile" error={fieldErrors.mobile}>
                <Input
                  id={`mobile-${index}`}
                  type="tel"
                  value={passenger.mobile}
                  autoComplete="tel"
                  onChange={(event) => patch(index, { mobile: event.target.value })}
                />
              </Field>
              {international && (
                <>
                  <Field
                    id={`passport-${index}`}
                    label="Passport number"
                    error={fieldErrors.passportNumber}
                  >
                    <Input
                      id={`passport-${index}`}
                      value={passenger.passportNumber}
                      onChange={(event) => patch(index, { passportNumber: event.target.value })}
                    />
                  </Field>
                  <Field
                    id={`expiry-${index}`}
                    label="Passport expiry"
                    error={fieldErrors.passportExpiry}
                  >
                    <Input
                      id={`expiry-${index}`}
                      type="date"
                      value={passenger.passportExpiry}
                      onChange={(event) => patch(index, { passportExpiry: event.target.value })}
                    />
                  </Field>
                  <Field
                    id={`pcountry-${index}`}
                    label="Passport country"
                    error={fieldErrors.passportCountry}
                  >
                    <SelectNative
                      id={`pcountry-${index}`}
                      value={passenger.passportCountry}
                      onChange={(event) => patch(index, { passportCountry: event.target.value })}
                    >
                      <option value="">Select</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </SelectNative>
                  </Field>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
      <Button type="submit" className="w-full sm:w-auto">
        Continue
      </Button>
    </form>
  );
}
