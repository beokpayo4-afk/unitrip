import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="container-page max-w-xl py-12">
      <h1 className="font-display text-4xl font-bold">Contact</h1>
      <p className="mt-2 text-muted-foreground">UNITRIP TRAVELS PRIVATE LIMITED · Delhi</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reach us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Email:</strong> care@unitrip.travel
          </p>
          <p>
            <strong>Location:</strong> Delhi, India
          </p>
          <p className="text-muted-foreground">
            For booking support, include your Order ID in the subject line.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
