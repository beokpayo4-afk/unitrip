import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LegalPage({ title }) {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This policy page is a placeholder for UNITRIP TRAVELS PRIVATE LIMITED. Final legal copy
            will be published before public launch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
