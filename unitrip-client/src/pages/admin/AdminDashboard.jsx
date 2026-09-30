import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatINR } from "@/utils/format";
import { cn } from "@/lib/utils";

function statusVariant(status) {
  if (status === "confirmed") return "success";
  if (status === "cancelled") return "destructive";
  return "warning";
}

const accentBorders = [
  "border-t-primary",
  "border-t-[var(--chart-2)]",
  "border-t-primary",
  "border-t-[var(--chart-2)]",
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = stats
    ? [
        {
          label: "Packages",
          value: stats.packages.total,
          hint: `${stats.packages.active} active`,
          to: "/admin/packages",
        },
        {
          label: "Bookings",
          value: stats.bookings.total,
          hint: `${stats.bookings.pending_payment} pending · ${stats.bookings.confirmed} confirmed`,
          to: "/admin/bookings",
        },
        {
          label: "Confirmed revenue",
          value: formatINR(stats.revenueConfirmed),
          hint: `${stats.users} users · ${stats.categories} categories`,
          to: "/admin/bookings?status=confirmed",
          large: true,
        },
        {
          label: "FAQs",
          value: stats.faqs,
          hint: "Global help articles",
          to: "/admin/faqs",
        },
      ]
    : [];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of packages, bookings, and revenue."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/admin/packages/new">New package</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/bookings?status=pending_payment">View pending</Link>
            </Button>
          </div>
        }
      />

      <AdminAlert>{error}</AdminAlert>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-t-4 border-t-muted">
              <CardHeader className="pb-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        {!loading &&
          metrics.map((m, i) => (
            <Link key={m.label} to={m.to} className="block">
              <Card
                className={cn(
                  "h-full overflow-hidden border-t-4 transition-shadow hover:shadow-md",
                  accentBorders[i]
                )}
              >
                <CardHeader className="pb-2">
                  <CardDescription>{m.label}</CardDescription>
                  <CardTitle className={m.large ? "text-2xl" : "text-3xl"}>
                    {m.value}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">{m.hint}</CardContent>
              </Card>
            </Link>
          ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Recent bookings</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/bookings">View all</Link>
          </Button>
        </div>
        {!loading && (!stats?.recentBookings || stats.recentBookings.length === 0) ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No bookings yet.
          </p>
        ) : (
          <AdminTableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Traveller</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : stats.recentBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.orderId}</TableCell>
                        <TableCell>{b.travellerName}</TableCell>
                        <TableCell>{b.packageTitle}</TableCell>
                        <TableCell>{formatINR(b.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(b.status)}>
                            {b.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(b.createdAt)}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </AdminTableWrap>
        )}
      </div>
    </div>
  );
}
