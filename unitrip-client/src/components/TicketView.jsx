import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bookingApi } from "@/api/client";
import { formatDate, formatINR } from "@/utils/format";

function statusVariant(status) {
  if (status === "confirmed") return "success";
  if (status === "cancelled") return "destructive";
  return "warning";
}

export default function TicketView({ ticket }) {
  if (!ticket) return null;

  const isPaid = ticket.status === "confirmed" && Boolean(ticket.paidAt);
  const pdfHref =
    ticket.ticketPdfUrl ||
    bookingApi.ticketPdfUrl(ticket.orderId, ticket.email);

  return (
    <Card className="border-dashed border-primary" id="unitrip-ticket">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <p className="text-sm text-muted-foreground">{ticket.company?.name}</p>
          <CardTitle className="mt-1 text-2xl">Travel Ticket</CardTitle>
        </div>
        <Badge variant={statusVariant(ticket.status)}>
          {ticket.status?.replace("_", " ")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isPaid && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">Payment successful</p>
              <p className="text-xs text-emerald-800/80">
                Your booking is confirmed. Download the PDF ticket below.
              </p>
            </div>
          </div>
        )}

        <p><strong>Order ID:</strong> {ticket.orderId}</p>
        <p><strong>Traveller:</strong> {ticket.travellerName}</p>
        <p><strong>Email:</strong> {ticket.email}</p>
        <p><strong>Phone:</strong> {ticket.phone}</p>
        <p><strong>Travel date:</strong> {formatDate(ticket.travelDate)}</p>
        <p><strong>Travellers:</strong> {ticket.travellersCount}</p>
        <Separator />
        <p><strong>Experience:</strong> {ticket.package?.title}</p>
        <p>
          <strong>Destination:</strong>{" "}
          {[ticket.package?.city, ticket.package?.state, ticket.package?.country]
            .filter(Boolean)
            .join(", ")}
        </p>

        {ticket.includedPlaces?.length > 0 && (
          <div>
            <strong>Included places</strong>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {ticket.includedPlaces.map((p) => (
                <li key={p.placeId || p.name}>
                  {p.name}
                  {p.distanceKm != null ? ` (${p.distanceKm} km)` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ticket.addOns?.length > 0 && (
          <div>
            <strong>Paid add-on places</strong>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {ticket.addOns.map((p) => (
                <li key={p.placeId || p.name}>
                  {p.name} · {p.distanceKm} km · {formatINR(p.extraAmount)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />
        <p>
          <strong>Package:</strong> {formatINR(ticket.baseAmount ?? ticket.package?.amount)}
        </p>
        {(ticket.addOnsAmount || 0) > 0 && (
          <p>
            <strong>Add-ons:</strong> {formatINR(ticket.addOnsAmount)}
          </p>
        )}
        <p>
          <strong>Total:</strong> {formatINR(ticket.totalAmount)}
        </p>
        {ticket.paidAt && (
          <p className="text-xs text-muted-foreground">
            Paid on {formatDate(ticket.paidAt)}
            {ticket.paymentMethod ? ` via ${ticket.paymentMethod.toUpperCase()}` : ""}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Booked on {formatDate(ticket.createdAt)}. Keep this Order ID to track or redownload
          your ticket.
        </p>

        <div className="no-print flex flex-wrap gap-2 pt-2">
          {isPaid ? (
            <Button asChild size="sm">
              <a href={pdfHref} target="_blank" rel="noreferrer">
                Download PDF ticket
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled>
              PDF unlocks after payment
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
