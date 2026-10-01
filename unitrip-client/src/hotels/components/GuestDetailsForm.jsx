import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} required={id !== "requests"}>
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function GuestDetailsForm({ guest, errors, onChange, onSubmit }) {
  function patch(partial) {
    onChange({ ...guest, ...partial });
  }

  return (
    <Card>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <Field id="guest-name" label="Guest name" error={errors.name}>
            <Input
              id="guest-name"
              value={guest.name}
              autoComplete="name"
              onChange={(event) => patch({ name: event.target.value })}
            />
          </Field>
          <Field id="guest-email" label="Email" error={errors.email}>
            <Input
              id="guest-email"
              type="email"
              value={guest.email}
              autoComplete="email"
              onChange={(event) => patch({ email: event.target.value })}
            />
          </Field>
          <Field id="guest-mobile" label="Mobile" error={errors.mobile}>
            <Input
              id="guest-mobile"
              type="tel"
              value={guest.mobile}
              autoComplete="tel"
              onChange={(event) => patch({ mobile: event.target.value })}
            />
          </Field>
          <Field id="guest-count" label="Number of guests" error={errors.guests}>
            <Input
              id="guest-count"
              type="number"
              min={1}
              max={12}
              value={guest.guests}
              onChange={(event) => patch({ guests: Number(event.target.value) })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field id="requests" label="Special requests" error={errors.requests}>
              <Textarea
                id="requests"
                value={guest.requests}
                placeholder="Optional. Late arrival, extra bed, or a quiet room."
                onChange={(event) => patch({ requests: event.target.value })}
              />
            </Field>
          </div>
          <div>
            <Button type="submit">Continue</Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
