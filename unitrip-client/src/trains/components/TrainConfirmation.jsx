import { Link } from "react-router-dom";
import { Download, Printer } from "lucide-react";
import { formatDate, formatINR } from "@/utils/format";
import { quotaLabel } from "../data/classes";
import { maskId } from "../validation/passengers";
import { downloadTrainBooking } from "../services/trainBookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TrainConfirmation({ booking }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Train booking ID</p>
          <h2 className="font-display text-4xl font-bold">{booking.reference}</h2>
        </div>
        <Badge variant="warning">{booking.statusLabel}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>PNR</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="font-display text-2xl font-bold text-foreground">Not issued</p>
          <p className="mt-2">
            This is a sample reservation. No PNR was allotted and no railway seat was booked.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {booking.train.name} · {booking.train.number}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Journey: </span>
            {booking.journey.from} {booking.journey.departure} → {booking.journey.to} {booking.journey.arrival} on{" "}
            {formatDate(booking.journey.date)}
          </p>
          <p>
            <span className="font-semibold">Class: </span>
            {booking.journey.classCode} · {quotaLabel(booking.journey.quota)} quota
          </p>
          <p>
            <span className="font-semibold">Fare: </span>
            {formatINR(booking.fare.total)}
          </p>
          <p>
            <span className="font-semibold">Status: </span>
            {booking.statusLabel}
          </p>
          <div>
            <p className="font-semibold">Passengers</p>
            <ul className="mt-1 space-y-1 text-muted-foreground">
              {booking.passengers.map((passenger, index) => (
                <li key={`${passenger.name}-${index}`}>
                  {passenger.name}, {passenger.age}, {passenger.gender}, {passenger.berth}, {passenger.idType}{" "}
                  {maskId(passenger.idNumber)}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">{booking.payment.message}</p>
      <div className="no-print flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => downloadTrainBooking(booking)}>
          <Download />
          Download booking
        </Button>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          <Printer />
          Print booking
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
        <Button asChild>
          <Link to="/trains/bookings">My Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
