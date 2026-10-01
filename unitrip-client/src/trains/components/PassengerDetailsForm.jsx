import { Plus, Trash2 } from "lucide-react";
import { berthOptions, emptyPassenger, GENDERS, ID_TYPES } from "../validation/passengers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

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

export function PassengerDetailsForm({ passengers, errors, classCode, onChange, onSubmit }) {
  const berths = berthOptions(classCode);

  function patch(index, partial) {
    onChange(passengers.map((passenger, i) => (i === index ? { ...passenger, ...partial } : passenger)));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {errors.form ? <p className="text-sm text-destructive">{errors.form}</p> : null}
      {passengers.map((passenger, index) => {
        const fieldErrors = errors[index] || {};
        return (
          <Card key={index}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Passenger {index + 1}</CardTitle>
              {passengers.length > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange(passengers.filter((_, i) => i !== index))}
                >
                  <Trash2 />
                  Remove
                </Button>
              ) : null}
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field id={`name-${index}`} label="Name" error={fieldErrors.name}>
                <Input id={`name-${index}`} value={passenger.name} onChange={(event) => patch(index, { name: event.target.value })} />
              </Field>
              <Field id={`age-${index}`} label="Age" error={fieldErrors.age}>
                <Input
                  id={`age-${index}`}
                  type="number"
                  min={1}
                  max={125}
                  value={passenger.age}
                  onChange={(event) => patch(index, { age: event.target.value })}
                />
              </Field>
              <Field id={`gender-${index}`} label="Gender" error={fieldErrors.gender}>
                <SelectNative id={`gender-${index}`} value={passenger.gender} onChange={(event) => patch(index, { gender: event.target.value })}>
                  <option value="">Select</option>
                  {GENDERS.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field id={`berth-${index}`} label="Berth preference" error={fieldErrors.berth}>
                <SelectNative id={`berth-${index}`} value={passenger.berth} onChange={(event) => patch(index, { berth: event.target.value })}>
                  <option value="">Select</option>
                  {berths.map((berth) => (
                    <option key={berth} value={berth}>
                      {berth}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field id={`id-type-${index}`} label="ID type" error={fieldErrors.idType}>
                <SelectNative id={`id-type-${index}`} value={passenger.idType} onChange={(event) => patch(index, { idType: event.target.value })}>
                  <option value="">Select</option>
                  {ID_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field id={`id-number-${index}`} label="ID number" error={fieldErrors.idNumber}>
                <Input
                  id={`id-number-${index}`}
                  value={passenger.idNumber}
                  onChange={(event) => patch(index, { idNumber: event.target.value })}
                />
              </Field>
            </CardContent>
          </Card>
        );
      })}
      {passengers.length < 6 ? (
        <Button type="button" variant="outline" onClick={() => onChange([...passengers, emptyPassenger()])}>
          <Plus />
          Add passenger
        </Button>
      ) : null}
      <div>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
