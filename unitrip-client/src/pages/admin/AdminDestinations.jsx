import { Suspense, use } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR } from "@/utils/format";

function loadDestinations() {
  return Promise.all([adminApi.packages(), adminApi.holidayPackages()]).then(
    ([packages, holidays]) => ({ packages, holidays, error: "" }),
    (error) => ({ packages: [], holidays: [], error: error.message || "Could not load destinations." })
  );
}

const request = loadDestinations();

function group(rows, key) {
  const map = new Map();
  rows.forEach((row) => {
    const name = row[key] || "Unknown";
    const current = map.get(name) || { name, count: 0, from: null };
    current.count += 1;
    const price = row.amount ?? row.startingPrice;
    if (current.from == null || price < current.from) current.from = price;
    map.set(name, current);
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function DestinationTables() {
  const result = use(request);
  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  const experiences = group(result.packages, "city");
  const holidays = group(result.holidays, "destination");
  return (
    <div className="grid gap-8">
      <section>
        <h2 className="mb-3 font-display text-2xl font-semibold">Experience destinations</h2>
        <AdminTableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Packages</TableHead>
                <TableHead>From</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{formatINR(item.from)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableWrap>
      </section>
      <section>
        <h2 className="mb-3 font-display text-2xl font-semibold">Holiday destinations</h2>
        <AdminTableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Packages</TableHead>
                <TableHead>From</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{formatINR(item.from)}</TableCell>
                  <TableCell>
                    <Link className="text-sm font-semibold text-primary underline" to="/admin/holiday-packages">
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableWrap>
      </section>
    </div>
  );
}

export default function AdminDestinations() {
  return (
    <div>
      <AdminPageHeader
        title="Destinations"
        description="Cities used by experience packages and holiday packages."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading destinations…</p>}>
        <DestinationTables />
      </Suspense>
    </div>
  );
}
